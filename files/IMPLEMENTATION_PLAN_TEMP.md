# GONYIK 官网升级临时实施参考

> 用途：后续 Plan mode 拆解与执行参考。产品、内容、UI 和验收要求仍以 `files/PRD.md` 为唯一依据；本文只记录实施顺序、代码收敛和风险，不是第二份 PRD。

## 1. 已确认的实施边界

- 本阶段不改代码，只整理方案。
- 保留 React、Express、JSON DB、MediaLibrary、Multer、`react-image-crop` 和现有认证。
- 不增加轮播库、拖拽排序库、Sharp、云图片服务、低代码页面搭建器或第二套媒体库。
- 数据迁移只做增量字段和兼容读取，不通过删除 `db.json` 重建。
- 先完成共享骨架和共享组件，再改业务页面，避免页面各写一套。

## 2. PRD 一致性审计结果

已在 PRD 中消除以下冲突：

1. 面料数据库由“民用/特种范围切换”统一为分组系列按钮：OTTER/RAYO | KAIS。
2. SKU 固定网格统一为原生横向轨道，并追加开发中尾卡。
3. 终端装备固定网格统一为同一个横向轨道，不再展示面料结构模块。
4. “了解系列”和空提示删除；当前没有独立系列页。
5. TechnologyPath 只用于首页，不再声明技术创新页存在 full 模式。
6. 技术页统一命名为“技术创新”，RPO-TEX 只属于膜技术分支，Rayo 属于无氟染整/功能整理。
7. 服务页只保留洗涤保养、FAQ、联系我们，新闻和关于我们退出服务页。
8. 后台预览统一要求调用真实前台组件，不再接受近似预览。
9. 图片裁剪统一扩展现有 ImageCropper，不再新建第二套裁剪器。
10. 前台公开文案与内部字段/权限规则明确分离。

## 3. 代码库冗余与处理方案

### 3.1 删除或合并

| 现有模块 | 问题 | 改造 |
|---|---|---|
| `SceneSelector.tsx` | 同时承担面料和装备选择，语义混杂，颜色硬编码 | 迁移后删除；面料使用 SceneFilter，系列/装备分类使用 GroupedBrowseNav |
| `EquipmentSceneManager.tsx` | 与 SceneManager 结构高度重复，且新装备页不需要独立场景映射后台 | 删除页面和路由；应用内容并入 EquipmentManager |
| `NewsManager.tsx` | 新闻只存在旧服务页，新的信息架构无消费入口 | 删除后台入口与页面；旧数据保留但不公开，确认无需求后再清理 |
| ServicesSupport 的 about/news/dev/fluorine tabs | 内容职责混乱且与首页、技术页重复 | 删除，只保留 care、FAQ、contact CTA |
| 各后台表单的裸文件输入 | 上传、裁剪、预览逻辑重复且效果不一致 | 统一替换为 AdminImageField |
| HomeEditor/FluorineManager 的自制预览 | 与真实前台组件不一致 | 使用 PageHero/MediaFrame 等真实组件的 preview 模式 |
| 页面散落的 `max-w/px/py` | 每页骨架尺寸不同 | 收敛到 PageShell/PageSection/SectionHeader |
| App main 与 PageHero 双 60px 偏移 | 内页顶部重复留白 | 只由 PublicLayout 处理一次 |
| FabricManager 的 JSON 文本框 | 维护人员需理解内部结构，容易写坏数据 | 改为结构化字段和可增删行 |

### 3.2 保留并扩展

| 模块 | 处理 |
|---|---|
| MediaLibrary | 保留，增加选择模式、引用提示、原图/衍生图关系 |
| ImageCropper | 保留，增加槽位比例、缩放、重置、通用真实预览 |
| FabricManager | 保留，增加系列/SKU结构化字段、轨道维护与预览 |
| EquipmentManager | 保留，语义由“产品”改为“应用”，吸收装备场景维护 |
| `equipment_products` | 暂时复用为应用项，避免新表；API 对外改名不要求立即迁移底层键名 |
| `order_index` | 继续排序，后台提供左移/右移 |
| Multer 与实体上传接口 | 第一阶段保留兼容；新图片优先从 MediaLibrary 选择 |

## 4. 新增的最小共享模块

### 前台

1. `PageShell / PageSection / SectionHeader / PageCTA / MediaFrame / AsyncBoundary`
2. `GroupedBrowseNav`
3. `SceneFilter`
4. `HorizontalRail`
5. `SkuCard`
6. `SkuDetailPanel`
7. `SceneCard`
8. `EvidenceGrid`

### 后台

1. `AdminImageField`：媒体选择、上传、裁剪、预览和保存。
2. `ContentRailEditor`：真实轨道预览、顺序、显隐和尾卡配置。

不创建通用页面编辑器、万能卡片配置或通用表单 schema。

## 5. 数据增量

- `fabric_series/fabric_sku/equipment application/page config` 增加 `image_placement`。
- 页面配置增加 `rail_config`。
- SKU 增加结构化状态、可见性、收益句、技术标签、洗护关联。
- 报告增加结构化指标、适用 SKU、公开级别和发布状态。
- 旧图片 URL 继续兼容；存在 `image_placement.cropped_url` 时优先读取。
- 原图与裁剪图分开保存；原图被引用时禁止直接删除。

## 6. 推荐实施顺序

### 阶段 A：安全与基础

1. 备份当前 JSON DB 和上传目录。
2. 添加增量字段与兼容读取。
3. 建立最小数据迁移自检。
4. 修复重复 60px 偏移。

### 阶段 B：公共骨架

1. PublicLayout、PageShell、PageHero、PageSection、SectionHeader、PageCTA。
2. MediaFrame 和 AsyncBoundary。
3. 回归全部公共路由，确认骨架一致。

### 阶段 C：图片维护

1. 扩展 MediaLibrary 选择模式和引用信息。
2. 扩展现有 ImageCropper。
3. 新增 AdminImageField。
4. 先接入 Hero、SKU、装备场景三个槽位。
5. 验证原图保留、再次裁剪、透明 PNG 和前台预览。

### 阶段 D：横向轨道

1. 实现 HorizontalRail 和开发中尾卡。
2. 实现 ContentRailEditor。
3. 接入 FabricManager 与 EquipmentManager。
4. 验证滚动条、触摸、键盘、顺序和显隐。

### 阶段 E：业务页面

1. 首页。
2. 面料数据库与 SkuDetailPanel。
3. 终端装备应用页。
4. 技术创新。
5. 服务与支持。
6. 联系我们。

### 阶段 F：删除冗余

1. 删除 SceneSelector。
2. 删除 EquipmentSceneManager 及入口。
3. 删除 NewsManager 及无消费入口。
4. 删除旧服务页 tabs 与重复预览。
5. 清理内部语言和无效默认数据。

## 7. 每阶段最小检查

- `npm run build`。
- 375px 与桌面端关键页面。
- 旧数据升级后不丢失。
- 后台草稿预览不写入公共接口。
- T31 性能不泄漏到其他 SKU。
- Rayo 不关联 RPO-TEX 膜。
- 归档/隐藏内容不公开。
- 图片裁剪结果、原图和引用关系可追溯。
- 横向轨道真实顺序与后台预览一致。

## 8. 明确暂缓

- 拖拽排序：左移/右移足够，出现大量内容后再评估。
- 服务端图片处理：浏览器 Canvas 足够，遇到超大图性能问题再加 Sharp。
- 云媒体服务/CDN变换：当前上传规模不需要。
- 任意比例裁剪：固定槽位比例避免破坏设计。
- 通用低代码 CMS：当前页面结构固定，不需要。
