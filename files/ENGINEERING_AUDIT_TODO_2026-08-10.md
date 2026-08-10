# 港翼官网代码、部署与 PRD 审计 TODO

> 审计日期：2026-08-10
>
> 审计基线：`2214791`
>
> 范围：前台、CMS、Express API、JSON 数据迁移、测试、质量审计、部署脚本、部署文档、PRD
>
> 原则：先删除已确认无消费者的代码，再合并真实重复；不为假设场景保留兼容层，不建立只有一个调用方的通用抽象。

## 1. 审计结论

- `npm run typecheck` 通过。
- `npm test` 的 12 项测试通过。
- `npm run audit:quality` 通过，但它只检查整个组件文件是否零引用、组件文件是否完全相同、静态 API 路径是否存在及资源预算。它不会发现命名导出废代码、单消费者抽象、近似组件、无前端消费者的服务端路由、历史迁移残留或部署文档冲突。
- 未确认到完全未使用的 npm 依赖。
- 未确认到整组完全无源码引用的 CSS 选择器。`global.css` 虽有 2423 行，但大部分来自仍在使用的技术叙事和材料可视化，不能按文件大小直接判定为废代码。
- 已确认多项自动审计漏检：废导出、废数据字段、废路由、假设性 props/variants、重复联系字段、旧 API 回退层和部署双通道。
- 最大风险不在视觉组件，而在默认管理员凭据、SSH 信任、发布门禁、测试污染真实 `db.json`、SMTP 配置保存链路和迁移代码长期覆盖 CMS 的可能性。

## 2. P0：先处理发布与数据安全

### [ ] P0-01 移除默认管理员凭据，并补齐真实的密码维护流程

证据：

- `server/db.ts:485-486` 为新数据库写入固定账号和固定密码，且 `must_change_password` 初始值为 `0`。
- `server/routes/admin.ts:18-29` 有修改密码 API，但前端没有对应页面或入口。
- `src/admin/Login.tsx:17-21` 登录后无条件进入首页，不处理 `must_change_password`。
- `files/PROJECT_LOG.md:52-55` 公开记录默认账号和密码，直接违反 `files/AGENTS.md:51-53` 与 `files/PRD.md:389`。

实施：

- 删除源码中的固定默认密码和文档中的凭据。
- 新环境通过一次性初始化命令或环境变量创建首位管理员；生产环境缺少初始化凭据时拒绝创建默认用户。
- 增加 CMS 内的修改密码页面，登录返回需要改密时先进入该页面。
- 立即轮换当前生产管理员密码，并使已有 JWT 失效。最简单做法是同时轮换 `JWT_SECRET`。

验收：

- 全仓搜索不到真实或默认管理员密码。
- 空数据库首次启动不会产生可预测登录凭据。
- 管理员能在 CMS 内修改密码；需要改密的账号不能跳过改密继续操作。

### [ ] P0-02 改用 SSH 密钥和主机指纹校验，删除可逆密码方案

证据：

- `.agents/skills/gonyik-deploy/scripts/deploy.mjs:25-28` 将服务器地址、用户和路径写死在源码。
- 同文件 `66-78` 使用可逆字符偏移读取密码，这不属于加密。
- 同文件 `183-190` 使用 `hostVerifier: () => true`，无法识别伪造服务器。
- 部署技能与 server-info 文档记录了源码规则明确禁止记录的服务器连接信息。

实施：

- 使用专用非 root 部署用户、SSH key 和最小目录/PM2 权限。
- 使用系统 `known_hosts` 或在 CI secret 中保存并核验主机公钥指纹。
- 服务器地址、用户和部署目录改为环境配置或本机 SSH config，不再提交到仓库。
- 删除 `.deploy-key.md` 的字符偏移解密逻辑和相关说明。

验收：

- 部署脚本不读取密码，不自动接受未知主机。
- 仓库和部署文档不出现服务器地址、root 登录方式或凭据算法。

### [ ] P0-03 让部署脚本真正执行发布门禁，并停止自动提交整个工作区

证据：

- PRD `files/PRD.md:379-387` 要求执行 `npm run test:release` 或复用同一指纹的验证结果。
- `.agents/skills/gonyik-deploy/scripts/deploy.mjs:206-212` 在没有验证戳时只运行 `npm run build`，漏掉单测和质量审计。
- 同文件 `223-229` 执行 `git add -A`，会把用户无关改动一并提交；随后捕获所有 `git commit` 失败并统一解释成“没有变更”，会掩盖 hooks、签名、权限等真实错误。

实施：

- 将无验证戳的分支改为 `npm run test:release`。
- 部署只允许干净工作树中的已提交 `HEAD`。提交与部署分离，部署脚本不再执行 `git add -A` 和 `git commit`。
- 如必须保留自动提交，先列出并确认待提交文件，使用 `git diff --cached --quiet` 判断是否为空，不捕获并吞掉其他 commit 错误。
- 记录并显示待部署 commit，在服务器健康检查中返回或校验该 commit。

验收：

- 单测或质量审计失败时无法进入 push/远端阶段。
- 工作区存在未提交文件时部署明确中止，不会夹带无关修改。
- commit 失败保留真实退出码和错误信息。

### [ ] P0-04 隔离测试数据库，禁止测试读写工作区 `db.json`

证据：

- `server/db.ts:9-10` 在模块加载时将数据库和 uploads 固定到当前工作目录。
- `tests/server.smoke.test.ts:15` 直接调用 `initDatabase()`，因此 `npm test` 会读取并可能迁移、重写本地运营数据。
- `server/db.ts` 的迁移包含大量 `saveDb()`，测试通过不代表未修改数据。

实施：

- 测试启动前创建临时目录，将数据库路径与上传目录指向临时位置。
- 允许 `server/db.ts` 从测试环境变量读取这两个路径，生产默认路径保持不变。
- 测试结束清理临时目录，并断言工作区 `db.json` 的 mtime/hash 未变化。
- 迁移测试使用经过脱敏的生产数据快照副本，不使用开发者当前数据库。

验收：

- 连续运行 `npm test` 不创建或修改仓库根目录的 `db.json`、`public/uploads`。
- 测试可并行运行且互不共享数据。

### [ ] P0-05 修复 SMTP 配置读取/保存链路，并收紧联系表单服务端校验

证据：

- `src/admin/ContactConfig.tsx:13-15` 使用公开的 `getContactConfig()` 初始化管理表单。
- `server/routes/config.ts:286-289` 的公开接口只返回公开联系信息，不返回 SMTP 字段。
- `src/admin/ContactConfig.tsx:19-31` 保存时仍提交这些缺失字段，可能把已有 SMTP 配置写成空值或从 JSON 中移除，导致邮件通知静默失效。
- `src/pages/Contact.tsx:50-53` 要求公司和至少 10 个字留言，但 `server/routes/config.ts:554-559` 只校验姓名、邮箱、主题、留言是否非空。
- PRD `files/PRD.md:171-176` 要求服务端校验和蜜罐字段，当前没有蜜罐。
- `position` 在前台没有输入框；`cooperation_type` 始终与 `subject` 相同，却仍被重复存储和展示。

实施：

- 新增鉴权的 `GET /api/admin/contact-config`。返回 SMTP 主机、端口、用户名、secure 和“密码已配置”布尔值，不把现有 SMTP 密码发回浏览器。
- 更新时只有管理员明确输入新密码才改 `smtp_pass`，空值表示保持原值。
- 服务端对实际可见字段做 trim、长度、邮箱格式、主题白名单和留言 10-500 字校验；公司是否必填与前端保持一致。
- 加一个隐藏蜜罐字段，不增加客户可见字段，不把第一步询盘变复杂。
- 新提交链路删除 `position` 与 `cooperation_type`；历史记录只读兼容，后台仅在历史值确有内容且不等于主题时显示。

验收：

- 只修改电话或地址不会清空 SMTP 配置。
- 配置过 SMTP 后可发送测试邮件；错误可见但不泄露密码或收件地址。
- 绕过前端提交非法邮箱、超长正文、未知主题或命中蜜罐时返回 400。

### [ ] P0-06 只保留一个生产部署触发器，并在迁移前做可恢复备份

证据：

- `.agents/skills/gonyik-deploy/scripts/deploy.mjs:142-153` 会 push 后立即连接服务器部署。
- `scripts/server-setup.sh:52-64` 同时安装每 5 分钟运行的自动拉取任务。
- `scripts/auto-deploy.sh` 没有文件锁，可能与直接部署同时执行 pull、build 和 PM2 restart。
- 两条路径都会在服务启动时触发数据库迁移，但部署前没有 `db.json` 快照。

实施：

- 建议保留当前即时部署方式，移除 cron 自动拉取。若选择保留 cron，则即时脚本只 push，不再远端部署，并用 `flock` 防止重入。
- 每次重启前备份 `db.json`，备份名包含时间和待部署 commit；每日独立备份 uploads 并保留恢复说明。
- 部署日志记录旧 commit、新 commit、数据备份路径、健康检查结果。
- 不做复杂自动数据回滚。健康检查失败时停止后续动作，输出明确的代码回滚和数据恢复命令。

验收：

- 同一时刻只能存在一个部署进程。
- 任一发布都能定位到发布前数据库快照和对应 commit。

## 3. P1：删除废代码并收敛真实重复

### [ ] P1-01 清理并压缩 `server/db.ts` 的历史迁移

证据：

- `server/db.ts` 共 2546 行，包含 19 个版本字段、约 60 个版本门和 85 次 `saveDb()` 调用。
- 默认数据库的 `technology_sections_version` 仍为 `7`，而现存迁移已到 `24`；新环境会先创建旧默认内容，再顺序执行大量历史迁移。
- `server/db.ts:1915` 开始的中文文案迁移对整块 CMS 内容执行覆盖式 `Object.assign`，违反 PRD `files/PRD.md:262-269` 的“只补缺失字段、不覆盖 CMS 已维护内容”。
- 若干旧图片只被历史迁移字符串引用，例如早期 PFAS Hero、纤维 Hero 和测试 Hero。

实施顺序：

1. 先导出生产数据副本并记录全部版本字段。
2. 在副本上跑当前迁移，比较迁移前后 CMS 字段，确认没有意外覆盖。
3. 将 `createDefaultDb()` 直接更新为当前结构和当前默认文案，版本号写到当前值。
4. 只保留仍可能遇到的最旧生产版本到当前版本之间的必要结构迁移；已确认所有环境越过的内容迁移直接删除。
5. 迁移统一用 `changed` 标记，在初始化末尾最多写盘一次。不要建立通用迁移框架或 ORM。
6. 生产数据和媒体引用确认不再使用旧资源后，再删除仅供历史迁移使用的图片。

验收：

- 全新数据库启动不需要回放历史文案迁移。
- 同一生产快照连续初始化两次，第二次文件 hash 不变。
- CMS 已维护文案不被默认文案覆盖。

### [ ] P1-02 删除旧服务器兼容回退和失去消费者的公开 API

证据：

- `src/api/client.ts:27-47` 为旧服务器构造 Axios 伪响应。
- `getFabricCatalog`、`getEquipmentCatalog`、`getServicesBootstrap` 在聚合接口 404 时退回旧多请求流程；当前发布总是同时部署客户端和服务端，不存在长期新客户端配旧服务器的产品场景。
- 该回退保留了 `/api/equipment/categories`、`/api/equipment/products` 等旧公开接口。
- `/api/fabrics/sku/:id` 和 `/api/translations/:locale` 在仓库内没有运行时消费者。
- `cachedGet` 中的 `typeof window === 'undefined'` 分支针对当前 Vite SPA 不会发生的 SSR 场景。

实施：

- 先确认生产已经提供三个聚合接口，并检查近期访问日志没有外部 API 消费者。
- 删除 `withLegacy404Fallback`、`localDataResponse` 及三个聚合请求的 fallback。
- 删除确认无消费者的 `/equipment/categories`、`/equipment/products`、`/fabrics/sku/:id`、`/translations/:locale`。
- `cachedGet` 直接使用浏览器路径，不保留 SSR 分支。

验收：

- 前台页面只调用 PRD 中的聚合接口和确有必要的详情接口。
- 质量审计和烟雾测试不再通过旧 fallback 间接“证明”废路由有消费者。

### [ ] P1-03 删除已确认的废导出、废字段和假设性组件参数

已确认清单：

- `src/components/CatalogCard.tsx:51-72` 的 `CatalogCardSkeleton` 无消费者。
- `server/db.ts:29,447` 的 `test_reports` 无消费者。
- `src/i18n/SiteLocale.tsx:253-255` 的 `stripEnglishPrefix` 无消费者。
- `localizePath` 只有测试消费者，生产逻辑已经统一使用 `marketPath`。
- `src/components/SkuCard.tsx:18` 的 `getSkuDisplayCode` 只在同文件使用，不应导出。
- `CatalogCardMedia` 的 `application` ratio 只被废弃 skeleton 使用。
- `CatalogCardShell.railEndCard` 只生成一个没有 CSS/JS 消费者的 `data-rail-end-card` 属性。
- 联系表单的 `position` 和 `cooperation_type` 对新提交分别是永远为空、与 `subject` 重复。

实施：

- 逐项删除，不为这些能力添加 deprecated wrapper。
- 对历史联系记录只保留读取兼容，不继续生成空字段或重复字段。

验收：

- `rg` 找不到上述符号或无意义数据属性。
- 类型检查、单测和生产构建通过。

### [ ] P1-04 内联两个单消费者抽象，避免为单一用途保留通用 API

目标：

- `src/components/CatalogCollection.tsx` 只有 `EndUseEquipment` 一个调用方，且仅包装一行 grid class。直接内联到页面后删除文件。
- `src/components/ReadingProgress.tsx` 只有 `PageScrollProgress` 一个调用方，但实现了未使用的默认横向模式、可选 label 和通用 className。将实际需要的竖向进度条直接写进 `PageScrollProgress` 后删除。
- `src/components/AnimatedDisclosure.tsx` 只有 FAQ 一个调用方，`replayKey` 和 `scrollOnExpand` 从未传入。优先把 FAQ 改为原生 `<details>/<summary>` 并删除该组件；如必须保留当前动画，只保留 `open`、`children` 和实际使用的参数。

验收：

- 没有为了“以后可能用”保留 orientation、replayKey、scrollOnExpand、desktopColumns 等当前无第二消费者的接口。
- FAQ 的键盘操作、展开语义和 reduced motion 行为不回退。

### [ ] P1-05 合并材料保养与成衣保养的重复页面逻辑

证据：

- `src/pages/services/MaterialCare.tsx` 与 `GarmentCare.tsx` 的 section 查找、数据请求、FAQ 请求、缺失重定向、页面骨架和 FAQ 渲染基本一致，仅保养步骤的排版不同。

实施：

- 新建一个 `CareServicePage`，参数只包含 `moduleType`、guide 请求函数、FAQ category 和 `layout: 'grid' | 'editorial-list'`。
- 两个路由文件保留为很薄的配置入口，继续支持现有 lazy route。
- 不把 `DigitalFabrics` 强行并入，因为其数据和页面结构不同。

验收：

- 相同的加载、空 section 处理和 FAQ 逻辑只保留一份。
- 两种保养页面仍保留各自不同的编辑式排版。

### [ ] P1-06 修复未知市场路径导致的永久加载

证据：

- `src/App.tsx:129-161` 使用 `/:marketCode` 接收任意首段路径。
- `src/config/markets.ts:44-57` 会把任何不在静态路由集合内的首段当作市场代码。
- 服务端对未知市场回退到默认市场；`SiteLocaleProvider` 又要求 `bootstrap.current_market === routeMarketCode`，因此未知路径可能永远停在 bootstrap gate。

实施：

- bootstrap 返回后校验 URL marketCode 是否属于启用市场。
- 未知市场进入明确 404；已禁用市场可重定向到默认站点。不要继续重试同一个必然不匹配的 bootstrap。
- 增加未知一级路径、禁用市场和合法自定义市场测试。

验收：

- `/not-a-market` 不会永久加载。
- CMS 新增并启用的市场仍能使用同一页面路由。

### [ ] P1-07 让页面数据失败可恢复，但不要建立通用状态机

证据：

- `TechnologyPage` 请求失败时直接把 sections 设为空，用户看到缺内容而不是错误。
- `ServicesLayout` 请求失败时没有 catch，可能一直显示加载状态。
- 多个页面只在 `finally` 中结束 loading，失败后渲染空目录。

实施：

- 在每个聚合页面保留简单的 `loading | ready | error` 三态和重试按钮。
- 复用现有全页加载视觉，但错误文案留在页面内；不引入全局请求状态库或通用异步状态机。

验收：

- 聚合接口 500、超时或离线时不会无限 loading，也不会伪装成“没有内容”。

### [ ] P1-08 降低全局滚动进度的运行成本，并限定在公开站

证据：

- `PageScrollProgress` 位于 `App` 根节点，CMS 也会挂载它，但 CMS 使用内部滚动容器，窗口进度没有业务意义。
- `src/components/PageScrollProgress.tsx:5-24` 在 window scroll 时持续更新两个 React state。

实施：

- 将进度条移入 `PublicLayout`，后台不挂载。
- 优先使用 CSS scroll timeline；若浏览器基线不允许，则直接用 DOM ref 更新 transform，不在每帧触发 React render。
- 首页与系列页的“下滑探索”提示是明确产品要求，继续保留，不纳入删除范围。

验收：

- 滚动时 React Profiler 不显示根组件逐帧重渲染。
- 首页和系列页的下滑提示仍存在，reduced motion 下无循环位移动画。

## 4. P2：文档、测试和类型收口

### [ ] P2-01 修正 PRD 与实现不一致的事实

需要更新：

- `files/PRD.md:171-176` 联系表单字段仍是旧的复杂询盘设计。改成当前可见字段：姓名、公司、邮箱、电话或微信、咨询方向、简短留言；SKU/series/source 为链接预填的隐藏上下文。
- PRD 的蜜罐与服务端校验要求应保留，并在 P0-05 落地。
- `files/PRD.md:224-229` 的 `MarketVisibility` 示例与真实的 `Record<marketCode, 'inherit' | 'public' | 'hidden'>` 模型不一致。
- PRD 声明管理员账号和密码维护，但当前只有未使用的 API。完成 P0-01 后补齐真实入口与验收。
- PRD 部署章节补充唯一触发器、发布前数据快照、部署 commit 和失败恢复步骤。
- PRD 自动审计章节不得再把“完全相同文件检查”表述成“近似组件复用检查”。

### [ ] P2-02 将过期项目日志降级为历史记录，不再与 PRD 争夺事实源

`files/PROJECT_LOG.md` 当前错误包括：

- 宣称 B2B 与 B2C 双端，PRD 的主要获客任务实际是 B2B。
- 宣称字体来自 Google/jsDelivr CDN，实际已由 fontsource 自托管。
- 宣称技术页只有五个分支，实际配置为七个页面。
- 公开默认后台凭据。
- 把多语言写成未来 TODO，实际市场与翻译 CMS 已存在。

实施：

- 删除凭据内容。
- 将文件标题改为“历史变更日志”，只保留按日期发生的事实；当前架构、路由、部署只链接 PRD，不重复维护另一套说明。

### [ ] P2-03 统一部署文档并修正互相矛盾的命令

需要处理：

- `files/AGENTS.md`/PRD 禁止记录服务器地址，部署技能和 server-info 当前却记录了这些信息。
- 部署技能手工流程、server-info 和 `scripts/server-setup.sh` 混用 `npm install`、`npm ci`、`npm run build`、`npm run build:client`。
- `files/SECURITY_AND_LOAD.md` 一处建议先扩为 2 个实例，末尾又说明 JSON DB 和内存限流在多实例前必须迁移，逻辑冲突。当前架构必须固定 1 个实例，直到数据库与限流外置。

实施：

- 仓库文档只描述变量名和流程，不记录实际主机信息。
- 新机安装统一 `npm ci`，发布统一以锁文件变化决定是否再执行 `npm ci`。
- 明确当前只支持单实例；不要为尚未存在的集群场景继续添加应用内防御代码。

### [ ] P2-04 扩展质量审计的确定性检查，但不自建复杂静态分析器

现有脚本 `scripts/quality-audit.mjs` 的边界应明确写入输出和文档。建议只增加可稳定判断的规则：

- 命名导出在项目内是否有消费者，允许显式 allowlist。
- 公共路由是否只有 API client fallback 消费，输出人工复核清单而非直接阻断。
- public 资源是否只被已退休迁移引用。
- 测试前后工作区 `db.json` 是否变化。

不要实现：

- 自制完整 TypeScript import graph、相似度打分器或通用 lint 框架。
- 将“两个组件视觉相似”自动判为必须合并。

### [ ] P2-05 补充高价值测试，不追求低价值覆盖率

新增测试：

- 新数据库不存在固定管理员密码。
- 修改公开联系信息不会清空 SMTP 设置。
- 联系表单服务端长度、邮箱、主题和蜜罐校验。
- 未知市场不会永久加载。
- 三个聚合接口响应结构与页面消费者一致。
- 脱敏生产快照的迁移幂等性及 CMS 文案不覆盖。
- 部署脚本在脏工作树、测试失败、commit 失败和主机指纹不匹配时中止。

不建议为纯展示 JSX 逐行写快照测试。

### [ ] P2-06 在本次清理触及的边界逐步去掉 `any`

- `Database` 当前大量集合为 `any[]`，使缺字段、重复字段和公开/管理配置混用难以在编译期发现。
- 优先为 `ContactConfig`、`ContactMessage`、`PageConfig`、迁移版本和三个 catalog 响应建立明确类型。
- 不做一次性全仓“泛型 Repository”重构；只在迁移、联系配置和聚合接口改动时同步收紧相关类型。

## 5. 明确保留，不做错误合并

- 保留 `MarkupParser`。它有多个真实消费者，且负责 CMS 标记协议，不是单用途包装。
- 保留 `MotionInView`。它在首页、系列页和技术叙事中多处使用，并正确清理 IntersectionObserver。
- 保留 `CatalogCardShell` 与 `CatalogCardMedia` 的共同骨架，但删除未使用 variant/prop；`SkuCard` 与 `ApplicationCard` 的内容和交互不同，不合并成一个万能卡片。
- 保留 `PageHero`。技术详情页的特殊 Hero 具有独立结构和叙事字段，不要为了形式复用给 `PageHero` 增加只服务技术页的复杂 variant。
- 保留 `ServiceSectionHeader`、`RelatedAction`、`PublicContentLoader` 和后台的 `Modal`、`FormField`、`PrimaryButton`、`SaveButton`、`CatalogCrudSection` 等多消费者组件。
- 不把 fabrics、equipment、services 三套 CRUD 强行塞入通用 Repository。它们的关系约束、上传和校验不同；现有 `services.registerContentCollection` 已经只在四个同构集合中复用，边界合理。
- 保留首页和系列页的下滑提示，这是已明确确认的产品交互。

## 6. 推荐执行顺序

1. P0-01 至 P0-06：凭据、SSH、发布门禁、测试隔离、SMTP/表单、部署互斥与备份。
2. P1-01：用生产副本收口迁移，再做其他删除，避免提前删掉迁移仍引用的字段和资源。
3. P1-02 至 P1-08：删除旧 API 和废导出，内联单用途抽象，合并两页真实重复，修复市场与错误状态。
4. P2-01 至 P2-06：PRD、历史日志、部署文档、质量审计、测试和类型同步收口。

每一批都运行：

```bash
npm test
npm run typecheck
npm run build
npm run audit:quality
```

涉及迁移或部署的批次，必须额外用生产数据副本演练，并保存演练前后 diff。
