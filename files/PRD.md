# GONYIK 高性能防护材料品牌官网 — 产品需求文档 & 视觉/内容策略 v2

---

## 1. 项目概述

### 1.1 项目背景
港怡科技面料品牌官网是面向 B2B 与 B2C 双端用户的品牌数字门户。全站所有展示内容（文字、图片、多媒体、产品数据）均通过内置后台管理系统维护，无需改动代码即可更新。系统启动时自动注入默认数据，用户通过后台维护后，所有数据即时生效。

### 1.2 目标用户画像
| 用户类型 | 关注点 | 典型行为 |
|---------|--------|---------|
| 品牌采购经理 | 面料参数、环保认证、价格区间 | 浏览面料系列，下载测试报告 |
| 产品设计师 | 手感、色彩、应用场景 | 浏览终端装备品类，查看产品特点 |
| 终端消费者 | 功能性、可持续性故事 | 阅读关于我们、洗护指南 |
| 内容管理员 | 内容更新效率、多媒体管理 | 通过后台 CMS 维护全站文案与素材 |

### 1.3 设计原则

1. **高性能材料品牌感**：视觉语言接近 GORE-TEX / eVent / Arc'teryx 材料技术页，强调真实材料质感、户外应用场景、膜层结构与测试验证；
2. **内容即配置**：所有展示层内容抽离为数据库配置，后台修改即时生效，零代码更新；
3. **智能兜底**：未配置数据时，系统自动生成符合品牌定位的默认内容（Logo、背景图、产品数据等）；
4. **物理对象优先**：首屏与关键区块必须使用真实面料、膜层、测试场景等物理对象，禁止纯抽象科技背景；
5. **中英双语预留**：数据结构支持多语言扩展，首期仅展示中文。

> **参考风格**：GORE-TEX / eVent / Arc'teryx 材料技术页 — 真实材料质感、户外应用场景、膜层结构、测试验证与品牌级克制排版。
---

## 2. 技术栈

### 2.1 前端
| 层级 | 技术选型 | 说明 |
|------|---------|------|
| 框架 | React 19 + TypeScript 5.x | 类型安全，组件化开发 |
| 构建工具 | Vite 6.x | 快速冷启动 |
| 样式 | Tailwind CSS 4.x | 原子化工具类 |
| 路由 | React Router v7 | 多页路由，懒加载 |
| 动画 | Framer Motion | 交互动画 |
| 图标 | Lucide React | 统一图标体系 |
| 字体 | Inter (Google Fonts) | 英文标题与正文 |
| 状态管理 | Zustand | 轻量全局状态 |
| PDF 渲染 | react-pdf + pdfjs-dist | 测试报告 PDF 翻页浏览 |
| HTTP 客户端 | Axios | API 请求 |

### 2.2 后端（一体化极简方案）
| 技术 | 说明 |
|------|------|
| Express.js 4.x | 轻量 Web 框架 |
| better-sqlite3 | 高性能 SQLite 驱动，零配置单文件数据库 |
| multer | 文件上传处理 |
| bcryptjs | 密码哈希 |
| jsonwebtoken | JWT 认证 |
| sharp | 图片处理（缩略图生成） |
| pdf-lib / pdf-poppler | PDF 第一页缩略图生成 |

### 2.3 架构特点（傻瓜式部署）
```
project/
├── web/                    # 前端 + 后端同仓库
│   ├── src/                # React 前端代码
│   ├── server/             # Express 后端代码
│   ├── public/uploads/     # 上传文件存储目录
│   └── db.sqlite           # 单文件数据库
```
- **单仓库**：前端和后端代码在一起，一条命令同时启动；
- **单文件数据库**：`db.sqlite`，无需安装 MySQL/PostgreSQL；
- **本地文件存储**：上传的图片/PDF 直接存 `public/uploads/`，通过 CDN 或 Nginx 可快速切换为云存储；
- **默认数据自动注入**：首次启动检测到空表时，自动插入完整的默认数据；
- **部署**：一条 `npm run build && npm start` 即可运行。

---

## 3. 默认数据生成策略

> **核心原则**：所有展示内容在数据库为空时，系统自动生成美观的默认数据。一旦管理员在后台修改并保存，立即以后台数据为准。

### 3.1 Logo 默认生成
- **未上传 Logo 时**：前端用 SVG 动态渲染"港怡科技"四字作为文字 Logo；
- 字体：Inter + PingFang SC，font-weight: 700，白色；
- 尺寸自适应，支持缩放；
- 后台上传 Logo 后，立即替换为上传文件。

### 3.2 首页背景图默认生成

- **未上传背景图时**：前端使用真实面料/雨水微距占位图或视频，确保首屏第一判断是“高性能材料品牌”；
- 背景图为深色、低饱和、材料细节清晰，禁止使用抽象科技纹理、网格线、漂浮光斑粒子；
- 后台上传背景图/视频/GIF 后，立即替换。
### 3.3 面料系列默认数据

| 系列名 | 默认描述 | 默认 SKU 数量 |
|--------|---------|--------------|
| Otter | PFAS-free waterproof-breathable laminated fabrics：全流程无氟防水透湿复合体系 | 6 款 |
| Kais | Protective textile composites：高强防护复合体系，面向防刺、防切割、抗冲击场景 | 6 款 |
| Rayo | Sun-protective moisture-management fabrics：高防晒、高导湿、轻量舒适的功能织物体系 | 6 款 |

每个 SKU 生成默认参数（静水压、透湿、剥离强力、克重、UPF 等），用程序随机生成合理数值。

> **命名过渡说明**：旧版系列名 Osmo / Kinetic / Lumix / Tread 已统一替换为 Otter / Kais / Rayo。如 CMS 中仍有旧数据，后台可直接重命名或替换。
### 3.4 终端装备品类默认数据
| 品类名 | 默认描述 | 默认产品数量 |
|--------|---------|------------|
| Latent | 隐形防护层，日常通勤与商务场景的低调选择 | 4 款 |
| U-Line | 城市机能线，都市探索者的功能美学 | 4 款 |
| P-Line | 专业性能线，为极限环境打造的旗舰装备 | 4 款 |
| A-Line | 全天候适应线，一件应对多变气候 | 4 款 |

### 3.5 社交媒体默认数据
| 平台 | 默认展示 |
|------|---------|
| 微信 | hover 显示"请关注港怡科技公众号"文字占位 |
| 小红书 | hover 显示"@港怡科技"占位 |
| 抖音 | hover 显示"@港怡科技"占位 |

后台上传二维码和填写账号后，立即替换。

### 3.6 其他默认数据
- **关于我们**：生成默认公司定位、Slogan、理念文本；
- **里程碑**：生成 5 个默认里程碑（2020-2026）；
- **新闻**：生成 3 条默认新闻；
- **洗护指南**：生成 5 条默认指南；
- **FAQs**：生成 6 条默认问答；
- **测试报告**：生成 2 条默认测试报告占位记录（提示"请上传真实报告"）。

---

## 4. 全局组件规范

### 4.1 Header（导航栏）

> **参考风格**：GORE-TEX 官网 header — 纯黑背景、极简、logo + 导航 + 图标，无多余装饰。

**布局与行为**
- 固定定位，`top: 0`，z-index: 50，宽度 100%；
- 高度：60px（桌面）/ 56px（移动端）；
- 背景色：始终 `#0D0D0D`，下边框 1px `rgba(255,255,255,0.08)`；
- 页面水平内边距：48px（桌面）/ 24px（移动端）；
- 最大内容宽度：1440px，居中；
- Flex 布局：`justify-content: space-between`，三栏结构。

**三栏结构**
```
[左栏: Logo]        [中栏: 导航链接]              [右栏: 功能图标]
港怡科技             首页  面料数据库  终端装备      🌐  🔍
                     探索无氟未来  服务与支持
```

**Logo**
- 未上传时：显示 SVG 文字 Logo"港怡科技"，高 28px，白色；
- 上传后：显示图片 Logo，高 28px，宽度自适应；
- 点击返回首页 `/`。

**导航链接**
- 字体：13px，font-weight: 500，`#AAAAAA`；
- 间距：gap: 32px；
- Hover：`#FFFFFF`，过渡 0.25s；
- 当前页面：`#FFFFFF`，底部 1px 白色下划线（opacity: 0.6）；
- 导航项由后台 `navigation` 表配置，默认 5 项。

**功能图标（右栏）**
- 地球图标（`Globe`，语言切换）+ 搜索图标（`Search`），20px，`#AAAAAA`；
- Hover：`#FFFFFF`；
- 先占位，二期实现功能。

**移动端**
- 汉堡菜单图标，点击展开全屏黑色遮罩；
- 菜单项纵向排列，22px，`#FFFFFF`，行高 2.5。

**动效**
- 页面加载时：导航栏从上方滑入（`y: -100% → 0`，0.5s，delay 0.2s）。

### 4.2 Footer（页脚）

**布局**
- 背景色：`#0D0D0D`；
- 上边框：1px `rgba(255,255,255,0.08)`；
- 页面水平内边距：48px（桌面）/ 24px（移动端）；
- 上内边距：40px，下内边距：32px；
- 最大内容宽度：1440px，居中；
- Flex：`justify-content: space-between`，桌面单行，移动端换行。

**内容结构**
```
[左栏]                              [右栏: 社交媒体]
© 2026 港怡科技 版权所有             [微信] [小红书] [抖音]
隐私政策 | ICP备案号（占位）
```

**左栏**
- 版权文字：12px，`#666666`；
- 链接：隐私政策、ICP 备案号，12px，`#666666`，hover `#AAAAAA`；
- 内容由 `footer_config` 表维护。

**右栏：社交媒体**
- 图标：微信（自定义 SVG）、小红书（自定义 SVG）、抖音（自定义 SVG），22px，`#666666`；
- 微信 hover：向上弹出二维码浮层（200×200px，白色背景，圆角 8px，阴影）；
  - 未上传二维码时：浮层显示"请关注港怡科技公众号"文字；
- 小红书/抖音 hover：向上弹出账号信息浮层（背景 `#1A1A1A`，文字 `#FFFFFF`）；
- 浮层动画：`opacity 0.2s, transform 0.2s`。

**后台管理入口（隐蔽）**
- 位置：footer 内部最右侧（社交媒体图标右侧），或作为 `position: fixed` 悬浮于右下角；
- 图标：`Settings`（齿轮），16px；
- 颜色：`#333333`（几乎不可见），hover `#666666`；
- 点击跳转 `/admin`。

---

## 5. 页面模块详细设计

---

### 5.1 首页 (Home) — 高性能防护材料品牌入口

> **参考风格**：GORE-TEX / eVent / Arc'teryx 材料技术页 — 真实面料、膜层结构、户外应用场景、克制排版。

#### Hero Section

**布局**
- 全屏高度（`100vh` / `100dvh`），全屏宽度；
- 背景层：
  - 有数据时：CMS 配置的图片/视频，`object-fit: cover`；
  - 无数据时：使用深色真实面料微距/雨水视频占位（或静态图），而非抽象科技纹理；
- 背景叠加层：线性渐变 `rgba(0,0,0,0.4)` → `rgba(0,0,0,0.65)`，确保文字可读；
- 内容层：绝对定位居中，`text-align: center`。

**内容**
```
[标签 — 10px，uppercase，letter-spacing: 3px，Technical Green 薄荷绿]
PFAS-FREE PERFORMANCE MATERIALS

[主标题 — 48px–56px，font-weight: 700，#FFFFFF，行高 1.15]
UHMWPE 微孔膜
构建下一代无氟防护面料

[副标题 — 18px–20px，font-weight: 400，#CCCCCC，行高 1.6，max-width: 560px]
以超薄 UHMWPE 微孔膜、无氟复合体系与功能织物结构为核心，为户外、通勤、防护与运动装备提供轻量、防水透湿、高强度的材料解决方案。

[按钮组 — flex，gap: 16px，margin-top: 40px]
[查看材料体系]    [申请样品测试]
```

**按钮样式**

| 按钮 | 样式 |
|------|------|
| **查看材料体系（主按钮）** | 背景 `#FFFFFF`，文字 `#1A1A1A`，padding: 14px 36px，font: 14px/500，无圆角。Hover：背景 `#EDEDED`，`scale(1.02)`。 |
| **申请样品测试（次按钮）** | 背景 `rgba(255,255,255,0.12)`，文字 `#FFFFFF`，边框 1px `rgba(255,255,255,0.25)`，padding: 14px 36px，font: 14px/500，无圆角。Hover：背景 `rgba(255,255,255,0.2)`。 |

**动效**
- 背景：从 `scale(1.08) opacity: 0` → `scale(1) opacity: 1`，1.2s；
- 内容依次入场（stagger 0.15s），缓动 `cubic-bezier(0.22, 1, 0.36, 1)`。

**CMS 字段**
| 字段 | 类型 | 默认值 |
|------|------|--------|
| hero_tag | string | "PFAS-FREE PERFORMANCE MATERIALS" |
| hero_title | string | "UHMWPE 微孔膜\n构建下一代无氟防护面料" |
| hero_slogan | string | "以超薄 UHMWPE 微孔膜、无氟复合体系与功能织物结构为核心，为真实装备提供可测试、可复合、可导入的材料解决方案。" |
| hero_background | media | 真实面料/雨水微距占位 |
| primary_btn_text | string | "查看材料体系" |
| primary_btn_link | string | "/fabrics" |
| secondary_btn_text | string | "申请样品测试" |
| secondary_btn_link | string | "/contact?sample=1" |

#### 首页其它区块

首页后续区块结构按《视觉与文案策略 v2》执行：

- **Block 2 — Material System**：从膜到面料的无氟防护体系（外层织物 / UHMWPE 微孔膜 / 复合胶层 / 内层织物）
- **Block 3 — Product Platforms**：三大材料平台（Otter / Kais / Rayo）
- **Block 4 — Verified by Testing**：性能测试验证（静水压、透湿、剥离强力、洗后耐久等）
- **Block 5 — Applications**：真实装备应用场景（户外硬壳、城市通勤、防护装备、鞋材与装备）
- **Block 6 — Sample Request**：申请样品，进入测试
---

### 5.2 面料数据库 (FabricDatabase)

#### 5.2.1 页面结构

```
[页面标题区 — 深黑背景]
  标签: PERFORMANCE MATERIAL SYSTEMS
  标题: 材料体系
  描述: 三大核心平台，覆盖防水透湿、防护复合与高防晒导湿应用

[材料平台展示 — 卡片网格]
  Otter 平台卡片 → 点击展开系列详情
  Kais 平台卡片
  Rayo 平台卡片

[性能测试与认证 — 独立区块]
  测试报告列表（PDF/图片）
  点击打开文件浏览器（支持翻页）
```

#### 5.2.2 页面标题区
- 背景：`#0D0D0D`，高度 35vh（最小 240px）；
- 标签、标题、描述居中或左对齐（80px 内边距）；
- **CMS 字段**：`page_tag`, `page_title`, `page_subtitle`。

#### 5.2.3 材料平台卡片网格

**布局**
- 背景：`#EDEDED`；
- 内边距：80px 48px；
- 网格：3 列（桌面）/ 1 列（移动端），gap: 24px。

**平台卡片样式**
- 背景：`#FFFFFF`；
- 宽高比：4:3 或 16:10；
- 无圆角；
- 内边距：32px；
- 内容：
  - 平台名称：28px，bold，`#1A1A1A`；
  - 平台副标题（英文）：12px，uppercase，`#888888`；
  - 平台描述：14px，`#666666`，2 行截断；
  - 底部箭头：→，hover 右移 4px。
- hover：`translateY(-4px)`，过渡 0.3s，左侧出现 4px Technical Green 竖条装饰。

**点击交互**
- 点击卡片 → 在当前页展开/或路由到系列详情；
- 系列详情页/抽屉：
  - 顶部：系列大图 + 系列名称 + 系列描述；
  - 下方：该系列所有 SKU 的货架卡片网格；
  - SKU 卡片：产品图（1:1 或 3:4）、SKU 名称、产品特点关键词标签。

**默认数据**
- 3 个平台（Otter / Kais / Rayo）
- 每个平台 6 个 SKU，参数随机生成合理值。

**CMS 维护**
- 系列/平台：增删改查（名称、slug、描述、封面图、排序）；
- SKU：增删改查（名称、SKU 编码、所属系列、图片、特点标签 JSON、参数 JSON）。

#### 5.2.4 性能测试与认证

**布局**
- 背景：`#FFFFFF`；
- 上下内边距：80px；
- 标题：性能测试与认证（28px，bold）；
- 副标题：我们的每一款面料均通过严格的国际标准测试（14px，`#666666`）。

**测试报告列表**
- 网格：3 列（桌面）/ 2 列（平板）/ 1 列（移动端），gap: 24px；
- 报告卡片：
  - 缩略图区：宽高比 3:4，背景 `#F5F5F5`；
    - 图片文件：直接显示图片；
    - PDF 文件：显示第一页缩略图（后端生成）；
    - 无文件：灰色占位 + 文档图标；
  - 报告名称：16px，bold；
  - 文件类型标签：11px，uppercase，背景 `#EDEDED`，padding: 4px 8px；
  - 上传日期：13px，`#888888`。

**文件浏览器（点击报告卡片后）**
- 在当前页打开，使用模态层/全屏覆盖；
- 背景：`#0D0D0D`（95% 不透明遮罩）；
- 内容区：
  - **图片文件**：居中展示，最大宽度 90vw，最大高度 80vh，支持缩放拖拽；
    - 如有多张图片：底部缩略图条 + 左右箭头翻页；
  - **PDF 文件**：使用 `react-pdf` 渲染，页面居中；
    - 顶部工具栏：当前页码 / 总页码、上一页、下一页、放大、缩小、下载；
    - 键盘支持：← → 翻页，ESC 关闭；
    - 触摸支持：滑动翻页；
  - **SVG 文件**：直接嵌入，可缩放；
- 关闭按钮：右上角 ×，40px，白色。
---

### 5.3 终端装备 (EndUseEquipment)

#### 5.3.1 页面结构

```
[页面标题区 — 深黑背景]

[Tab 导航栏 — 粘性定位]
  [All] [Latent] [U-Line] [P-Line] [A-Line]

[品类卡片列表 — 横条卡片]
  Latent 卡片 → 点击展开产品货架
  U-Line 卡片
  P-Line 卡片
  A-Line 卡片

[产品货架浮层/展开区]
  品类名称
  产品卡片网格（产品图 + 名称 + 特点标签）
```

#### 5.3.2 页面标题区
- 背景：`#0D0D0D`，高度 35vh；
- 标签：END USE & EQUIPMENT；
- 标题：终端装备；
- 描述：四大品类，覆盖全场景功能需求；
- **CMS 字段**：`page_tag`, `page_title`, `page_subtitle`。

#### 5.3.3 Tab 导航栏

**布局**
- 背景：`#FFFFFF`；
- 粘性定位（`top: 60px`），z-index: 40；
- 下边框：1px `#E8E8E8`；
- 内容居中或左对齐（48px 内边距）。

**Tab 选项**
- All / Latent / U-Line / P-Line / A-Line；
- 字体：13px，font-weight: 500；
- 未选中：`#888888`；
- 选中：`#1A1A1A`，底部 2px 粗线；
- 切换：内容区淡入淡出（0.3s）。

**数据**
- Tab 名称由 `equipment_categories` 表维护。

#### 5.3.4 品类横条卡片

**布局**
- 每个品类一个横条卡片，全宽；
- 高度：200px（桌面）/ 160px（移动端）；
- 卡片间距：16px；
- 点击展开该品类的产品货架。

**卡片视觉效果（核心设计）**
```
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│  [白色区域 30%]                    [渐变过渡区]     [无色区域]   │
│                                                                │
│   Latent                        渐变白→透明      （透出页面背景）│
│   隐形防护层，日常通勤与商务                     或显示背景图    │
│   场景的低调选择                                                │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

**具体样式**
- 卡片容器：`position: relative`，`overflow: hidden`；
- 默认状态：
  - 左侧 30%：纯白色背景 `#FFFFFF`；
  - 中间：线性渐变 `linear-gradient(to right, #FFFFFF 30%, rgba(255,255,255,0) 70%)`；
  - 右侧：透明，透出下方页面背景（`#EDEDED`）；
  - 左侧文字区：padding: 40px；
- Hover 状态：
  - 背景图淡入显示（`opacity: 0 → 1`），图片 `object-fit: cover`，覆盖整个卡片；
  - 叠加一层从左到右的渐变遮罩：`linear-gradient(to right, rgba(255,255,255,0.95) 25%, rgba(255,255,255,0.4) 60%, rgba(0,0,0,0.3) 100%)`，确保左侧文字始终可读；
  - 左侧文字：品类名 `scale(1.02)`，描述文字 opacity 提升；
  - 整体：`translateX(8px)` 或轻微放大，过渡 0.4s `cubic-bezier(0.22, 1, 0.36, 1)`；
- 无背景图时：
  - Hover 背景变为 `#E8E8E8`（左侧白色区域过渡到灰色）；
  - 右侧显示微妙的几何纹理（CSS pattern）。

**左侧文字区**
- 品类名：24px，bold，`#1A1A1A`；
- 品类描述：14px，`#666666`，max-width: 280px，2-3 行；
- 产品数量：11px，uppercase，`#888888`，"4 款产品"。

**点击交互**
- 点击卡片 → 在该卡片下方展开产品货架区（手风琴效果）；
- 展开动画：`height: 0 → auto`，`opacity: 0 → 1`，0.4s；
- 再次点击 → 收起；
- 同时只能展开一个品类（或允许多个，根据体验决定，推荐单个）。

#### 5.3.5 产品货架区

**布局**
- 展开后显示在对应品类卡片下方；
- 背景：`#FFFFFF`；
- 内边距：48px；
- 顶部显示品类名称 + 关闭按钮。

**产品卡片网格**
- 网格：4 列（桌面）/ 2 列（平板）/ 1 列（移动端），gap: 20px；
- 产品卡片：
  - 背景：`#F9F9F9`；
  - 无圆角；
  - 图片区：1:1 比例，背景 `#EDEDED`；
  - 内容区：padding: 20px；
  - 产品名：16px，bold；
  - 特点标签：flex wrap，gap: 8px；
    - 每个标签：11px，uppercase，背景 `#EDEDED`，padding: 4px 10px；
  - hover：图片 `scale(1.05)`，卡片 `translateY(-4px)`。

**CMS 维护**
- 品类：增删改查（名称、slug、描述、背景图、排序）；
- 产品：增删改查（名称、所属品类、图片、特点标签 JSON、排序）。

**默认数据**
- 4 个品类（Latent / U-Line / P-Line / A-Line）
- 每个品类 4 个产品，名称和特点随机生成。

---

### 5.4 探索无氟未来 (FluorineFreeFuture)

#### 页面说明
- 目前为**空页面占位**，预留科技展示页框架；
- 背景：`#0D0D0D`；
- 居中显示：
  - 标签：FLUORINE FREE FUTURE
  - 标题：探索无氟未来
  - 描述：页面建设中，敬请期待
  - 返回首页按钮
- **CMS 字段**：`page_tag`, `page_title`, `page_subtitle`, `is_under_construction`（布尔值）。

---

### 5.5 服务与支持 (ServicesSupport)

#### 5.5.1 页面结构

```
[页面标题区 — 深黑背景]

[双栏布局]
  [左侧：侧栏导航 — 固定/粘性]
    关于我们
    新闻中心
    开发者支持
    洗护指南
    FAQs

  [右侧：内容区 — Tab 切换]
    ├─ 关于我们
    │   ├─ 公司定位
    │   ├─ Slogan
    │   ├─ 公司理念
    │   └─ 发展里程碑（可视化时间线）
    │
    ├─ 新闻中心
    │   └─ 新闻卡片网格
    │
    ├─ 开发者支持
    │   └─ 占位页面
    │
    ├─ 洗护指南
    │   └─ 图标+文本列表
    │
    └─ FAQs
        └─ 手风琴问答
```

#### 5.5.2 页面标题区
- 背景：`#0D0D0D`，高度 35vh；
- 标签：SERVICES & SUPPORT；
- 标题：服务与支持；
- 描述：全方位服务体系，助力您的每一个项目；
- **CMS 字段**：`page_tag`, `page_title`, `page_subtitle`。

#### 5.5.3 侧栏导航

**布局**
- 左侧固定宽度：240px（桌面）；
- 移动端：横向滚动 Tab 或下拉选择；
- 背景：`#FFFFFF`（内容区背景为 `#EDEDED`）；
- 内边距：24px 0。

**导航项**
| 项 | 图标 |
|----|------|
| 关于我们 | Building2 |
| 新闻中心 | Newspaper |
| 开发者支持 | Code2 |
| 洗护指南 | Droplets |
| FAQs | HelpCircle |

**样式**
- 导航项：padding: 14px 24px，14px，font-weight: 500；
- 未选中：`#888888`；
- 选中：`#1A1A1A`，左侧 3px `#1A1A1A` 竖条，背景 `#F5F5F5`；
- hover：背景 `#F9F9F9`；
- 过渡：0.2s。

#### 5.5.4 关于我们模块

**布局**
- 背景：`#EDEDED`；
- 内边距：48px；
- 各区块垂直排列，间距 60px。

**公司定位**
- 标签：POSITIONING（10px）；
- 标题：公司定位（28px，bold）；
- 内容：大段文本（15px，`#666666`，line-height: 1.8）；
- **CMS 字段**：`positioning_title`, `positioning_content`。

**Slogan**
- 背景：`#111111`；
- 内边距：60px 48px；
- 文字居中：
  - 引号装饰：大号 `"` 符号，`#333333`，绝对定位；
  - Slogan 文本：28px，font-weight: 700，`#FFFFFF`，italic；
- **CMS 字段**：`slogan_text`。

**公司理念**
- 三列网格（桌面）/ 单列（移动端），gap: 24px；
- 每个理念卡片：
  - 背景：`#FFFFFF`；
  - 内边距：32px；
  - 编号：48px，font-weight: 900，`#EDEDED`；
  - 理念标题：18px，bold；
  - 理念描述：14px，`#666666`；
- **CMS 字段**：理念列表 JSON（编号、标题、描述）。

**发展里程碑（可视化时间线）**
- 垂直时间线，居中轴线（2px `#E8E8E8`）；
- 左右交替排列（桌面），单侧排列（移动端）；
- 每个节点：
  - 圆点：12px，`#1A1A1A`，边框 3px `#FFFFFF`；
  - 年份：18px，bold；
  - 事件：14px，`#666666`；
  - 卡片背景：`#FFFFFF`，padding: 24px，无圆角；
- 入场动画：滚动到视口时，节点从对应方向滑入；
- **CMS 字段**：里程碑列表（年份、事件、排序）。

#### 5.5.5 新闻中心模块

**布局**
- 背景：`#EDEDED`；
- 内边距：48px。

**新闻卡片网格**
- 网格：3 列（桌面）/ 2 列（平板）/ 1 列（移动端），gap: 24px；
- 新闻卡片：
  - 背景：`#FFFFFF`；
  - 头图区：16:10 比例，背景 `#F5F5F5`；
  - 内容区：padding: 24px；
  - 日期：11px，uppercase，`#888888`；
  - 标题：18px，bold，2 行截断；
  - 摘要：14px，`#666666`，3 行截断；
  - hover：图片 `scale(1.05)`，卡片 `translateY(-4px)`。

**新闻详情**
- 点击卡片 → 在当前页右侧滑出抽屉 / 或展开全文；
- 抽屉内容：头图、标题、日期、正文（富文本 HTML）、插图网格；
- **CMS 字段**：标题、封面图、正文 HTML、插图列表、发布日期。

**后台编辑器**
- 富文本编辑器：TipTap 或 React Quill；
- 支持：加粗、斜体、标题、列表、链接、图片插入（从媒体库选择）、引用；
- 图片上传：直接调用媒体库 API。

#### 5.5.6 开发者支持模块

- 目前为**占位页面**；
- 显示：开发者文档与 API 即将开放，敬请期待；
- 提供一个邮箱联系入口。

#### 5.5.7 洗护指南模块

**布局**
- 背景：`#FFFFFF`；
- 内边距：48px；
- 网格：2 列（桌面）/ 1 列（移动端），gap: 24px。

**指南项**
- 每个指南：
  - 图标：40px，`#1A1A1A`（Lucide 图标，如 `Droplets`, `Sun`, `Wind`, `Ban` 等）；
  - 标题：18px，bold；
  - 内容：14px，`#666666`，line-height: 1.8；
  - 分隔：底部 1px `#E8E8E8`。
- **CMS 字段**：图标名、标题、内容、排序。

#### 5.5.8 FAQs 模块

**布局**
- 背景：`#EDEDED`；
- 内边距：48px；
- 最大宽度：800px。

**手风琴列表**
- 每个问答：
  - 问题：16px，bold，`#1A1A1A`，padding: 20px 0；
  - 下边框：1px `#E8E8E8`；
  - 右侧：+ / - 图标；
  - 回答：14px，`#666666`，展开时淡入；
- 同时只展开一项（或允许多项）；
- **CMS 字段**：问题、答案、分类、排序。

---

## 6. 后台管理系统 (Admin)

### 6.1 入口与登录

- **入口**：Footer 右下角齿轮图标 → `/admin`；
- **登录页**：
  - 背景：`#0D0D0D`；
  - 居中卡片：背景 `#1A1A1A`，padding: 48px，宽 400px；
  - 标题：管理后台（24px，bold，`#FFFFFF`）；
  - 字段：用户名、密码；
  - 输入框：背景 `rgba(255,255,255,0.05)`，边框 `#333333`，文字 `#FFFFFF`；
  - 提交按钮：背景 `#FFFFFF`，文字 `#1A1A1A`，width: 100%；
  - 首次启动默认账号：`admin / admin123`（强制首次登录后修改密码）。
- **认证**：JWT Token 存 `localStorage`，API 请求头携带 `Authorization: Bearer <token>`；
- **路由守卫**：未登录访问 `/admin/*` 重定向到 `/admin/login`。

### 6.2 Admin Dashboard

**布局**
- 左侧固定侧边栏（宽 240px，背景 `#1A1A1A`）；
- 右侧内容区（背景 `#0D0D0D`，padding: 40px）；
- 顶部栏：页面标题 + 管理员名称 + 退出按钮。

**侧边栏导航**
```
📊 概览
─────────────────
📝 首页管理
🧵 面料系列管理
📄 测试报告管理
🏔️ 终端装备管理
🌱 无氟未来管理
🛠️ 服务与支持管理
📰 新闻管理
🖼️ 多媒体资源库
⚙️ 系统设置
```

### 6.3 各管理模块功能

#### 6.3.1 首页管理
- 表单编辑：hero_tag, hero_title, hero_slogan, hero_background（图片上传/选择）, 主/次按钮文案与链接；
- 实时预览按钮：新开窗口带 `?preview=true`。

#### 6.3.2 面料系列管理
- **系列列表**：表格展示（名称、SKU 数量、排序、操作）；
- **系列编辑/新增**：名称、slug、描述、封面图；
- **SKU 管理（嵌套在系列内）**：
  - 表格：SKU 名称、编码、图片、操作；
  - 编辑：名称、编码、图片上传、特点标签（逗号分隔或标签输入）、参数 JSON 编辑（可视化表单）；
  - 支持拖拽排序。

#### 6.3.3 测试报告管理
- 列表：缩略图、标题、文件类型、上传日期、操作；
- 新增：标题、文件上传（PDF/PNG/JPG/JPEG/SVG）、分类；
- 上传后后端自动生成缩略图；
- 支持替换文件。

#### 6.3.4 终端装备管理
- **品类列表**：名称、slug、描述、背景图、产品数量、排序；
- **品类编辑**：名称、slug、描述、背景图上传、排序；
- **产品管理（嵌套在品类内）**：
  - 表格：产品名、图片、特点标签、操作；
  - 编辑：名称、图片、特点标签（标签输入组件）；
  - 支持拖拽排序。

#### 6.3.5 无氟未来管理
- 目前简单：是否显示"建设中"开关、页面文案编辑；
- 预留扩展字段。

#### 6.3.6 服务与支持管理
- **关于我们**：公司定位、Slogan、理念列表（动态增删）、里程碑列表（动态增删）；
- **洗护指南**：图标选择器（Lucide 图标下拉）、标题、内容、排序；
- **FAQs**：问题、答案、分类、排序，支持批量增删；
- **开发者支持**：占位文案编辑。

#### 6.3.7 新闻管理
- 列表：封面缩略图、标题、发布日期、操作；
- 编辑：
  - 标题、封面图上传；
  - 富文本编辑器（TipTap）：支持格式、链接、图片插入；
  - 插图管理：从媒体库选择或上传；
  - 发布日期选择器；
- 支持草稿/已发布状态。

#### 6.3.8 多媒体资源库
- **网格展示**：缩略图、文件名、尺寸、上传时间、引用状态；
- **上传**：拖拽上传或多选上传，支持图片/GIF/PDF；
- **操作**：预览、复制链接、删除（被引用时提示警告）、替换；
- **搜索**：按文件名过滤；
- **筛选**：按类型（图片/PDF/全部）。

#### 6.3.9 系统设置
- **导航配置**：拖拽排序导航项，编辑名称和链接；
- **页脚配置**：版权文字、隐私政策链接、ICP 信息；
- **社交媒体**：上传微信二维码、填写各平台账号；
- **Logo 上传**：替换网站 Logo；
- **管理员密码修改**：当前密码、新密码、确认密码。

### 6.4 通用编辑界面规范

```
[页面标题]                    [保存按钮] [预览按钮]

┌─────────────────────────────────────────────────────────┐
│ 表单区域                                                 │
│                                                         │
│  标题              [输入框 ▓▓▓▓▓▓▓▓▓▓▓▓▓▓]              │
│  Slogan            [文本域 ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓]        │
│  背景图片          [缩略图] [更换] [删除]                │
│  按钮文案 1        [输入框]                              │
│  按钮链接 1        [输入框]                              │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

- 未保存字段用黄色边框 `#FFAA00` 高亮；
- 保存成功后 Toast 提示，2s 自动消失；
- 所有列表支持分页（每页 20 条）。

---

## 7. 数据库设计（SQLite）

```sql
-- 首页配置
CREATE TABLE home_config (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  hero_tag TEXT DEFAULT 'TECHNOLOGY FABRIC',
  hero_title TEXT DEFAULT '科技面料\n定义未来',
  hero_slogan TEXT DEFAULT '以创新材料科技，重塑户外与运动的边界',
  hero_background TEXT,
  primary_btn_text TEXT DEFAULT '探索无氟科技面料',
  primary_btn_link TEXT DEFAULT '/fluorine-free',
  secondary_btn_text TEXT DEFAULT '探索终端装备',
  secondary_btn_link TEXT DEFAULT '/equipment',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 页面通用配置
CREATE TABLE page_configs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  page_key TEXT UNIQUE NOT NULL, -- home, fabrics, equipment, fluorine-free, services
  page_tag TEXT,
  page_title TEXT,
  page_subtitle TEXT,
  hero_background TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 导航
CREATE TABLE navigation (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  label TEXT NOT NULL,
  link TEXT NOT NULL,
  order_index INTEGER DEFAULT 0
);

-- 页脚配置
CREATE TABLE footer_config (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  copyright TEXT DEFAULT '© 2026 港怡科技 版权所有',
  privacy_policy_link TEXT DEFAULT '#',
  icp_number TEXT DEFAULT 'ICP备案号（占位）',
  icp_link TEXT DEFAULT '#',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 社交媒体
CREATE TABLE social_media (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  platform TEXT UNIQUE NOT NULL, -- wechat, xiaohongshu, douyin
  account TEXT,
  qrcode_url TEXT
);

-- 面料系列
CREATE TABLE fabric_series (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  cover_image TEXT,
  order_index INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 面料 SKU
CREATE TABLE fabric_sku (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  series_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  sku_code TEXT,
  image TEXT,
  features TEXT, -- JSON ["防水透气", "无氟"]
  specifications TEXT, -- JSON {"waterproof": "20000mm", ...}
  order_index INTEGER DEFAULT 0,
  FOREIGN KEY (series_id) REFERENCES fabric_series(id) ON DELETE CASCADE
);

-- 测试报告
CREATE TABLE test_reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT, -- pdf, png, jpg, jpeg, svg
  thumbnail_url TEXT,
  category TEXT,
  order_index INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 终端装备品类
CREATE TABLE equipment_categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  bg_image TEXT,
  order_index INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 终端装备产品
CREATE TABLE equipment_products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  image TEXT,
  features TEXT, -- JSON ["轻量化", "防风"]
  order_index INTEGER DEFAULT 0,
  FOREIGN KEY (category_id) REFERENCES equipment_categories(id) ON DELETE CASCADE
);

-- 关于我们
CREATE TABLE about_us (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  positioning_title TEXT DEFAULT '公司定位',
  positioning_content TEXT,
  slogan_text TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 理念
CREATE TABLE philosophies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  number INTEGER,
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER DEFAULT 0
);

-- 里程碑
CREATE TABLE milestones (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  year TEXT NOT NULL,
  event TEXT NOT NULL,
  order_index INTEGER DEFAULT 0
);

-- 新闻
CREATE TABLE news (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  cover_image TEXT,
  content TEXT, -- HTML
  images TEXT, -- JSON ["url1", "url2"]
  status TEXT DEFAULT 'published', -- draft, published
  published_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 洗护指南
CREATE TABLE care_guides (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  icon TEXT, -- Lucide icon name
  title TEXT NOT NULL,
  content TEXT,
  order_index INTEGER DEFAULT 0
);

-- FAQs
CREATE TABLE faqs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT,
  order_index INTEGER DEFAULT 0
);

-- 管理员
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  must_change_password INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## 8. API 设计（RESTful）

### 8.1 公共 API（无需认证）

```
GET  /api/config/home              → 首页配置
GET  /api/config/page/:pageKey     → 页面通用配置
GET  /api/config/navigation        → 导航列表
GET  /api/config/footer            → 页脚配置
GET  /api/config/social            → 社交媒体

GET  /api/fabric-series            → 面料系列列表
GET  /api/fabric-series/:slug      → 系列详情（含 SKU）
GET  /api/fabric-sku/:id           → SKU 详情

GET  /api/test-reports             → 测试报告列表
GET  /api/test-reports/:id         → 报告详情（含文件 URL）

GET  /api/equipment-categories     → 装备品类列表
GET  /api/equipment-categories/:slug/products → 品类产品列表

GET  /api/about-us                 → 关于我们完整数据
GET  /api/news                     → 新闻列表
GET  /api/news/:id                 → 新闻详情
GET  /api/care-guides              → 洗护指南列表
GET  /api/faqs                     → FAQs 列表
```

### 8.2 管理 API（需 JWT）

所有管理 API 前缀 `/api/admin`，需 Header: `Authorization: Bearer <token>`

```
POST /api/admin/login              → 登录，返回 JWT
POST /api/admin/logout             → 登出

-- 首页管理
PUT  /api/admin/config/home        → 更新首页配置

-- 面料管理
GET    /api/admin/fabric-series
POST   /api/admin/fabric-series
PUT    /api/admin/fabric-series/:id
DELETE /api/admin/fabric-series/:id

GET    /api/admin/fabric-sku?series_id=
POST   /api/admin/fabric-sku
PUT    /api/admin/fabric-sku/:id
DELETE /api/admin/fabric-sku/:id

-- 测试报告管理
GET    /api/admin/test-reports
POST   /api/admin/test-reports     → 支持 multipart 文件上传
DELETE /api/admin/test-reports/:id

-- 终端装备管理
GET    /api/admin/equipment-categories
POST   /api/admin/equipment-categories
PUT    /api/admin/equipment-categories/:id
DELETE /api/admin/equipment-categories/:id

GET    /api/admin/equipment-products?category_id=
POST   /api/admin/equipment-products
PUT    /api/admin/equipment-products/:id
DELETE /api/admin/equipment-products/:id

-- 关于我们 / 新闻 / 洗护指南 / FAQs / 里程碑 / 理念
类似的 CRUD...

-- 系统设置
PUT  /api/admin/config/navigation
PUT  /api/admin/config/footer
PUT  /api/admin/config/social
PUT  /api/admin/config/logo       → Logo 上传
PUT  /api/admin/users/password    → 修改密码

-- 文件上传
POST /api/admin/upload            → 通用文件上传，返回 URL
GET  /api/admin/media             → 媒体库列表
DELETE /api/admin/media/:filename → 删除文件
```

---

## 9. 响应式断点

| 断点 | 宽度 | 关键变化 |
|------|------|---------|
| 桌面大屏 | ≥1440px | 页面内边距 48px，最大内容宽度 1280px |
| 桌面 | 1024px–1439px | 页面内边距 48px |
| 平板 | 768px–1023px | 页面内边距 32px，网格降为 2 列 |
| 移动端 | <768px | 页面内边距 24px，单列，汉堡菜单，侧栏变顶部 Tab |

---

## 10. UI 设计规范

### 10.1 色彩系统

**主色（占 85%–90%）**

| 名称 | 色值 | 用途 |
|------|------|------|
| Graphite Black / 石墨黑 | `#0D0D0D` | Hero 背景、Header/Footer 背景 |
| Deep Charcoal / 深炭灰 | `#1A1A1A` | 主文字、深区块背景 |
| Mist White / 雾白 | `#F5F5F5` | 浅背景、内容区 |
| Cool Silver / 冷银灰 | `#EDEDED` / `#CCCCCC` | 主背景、分割线、次要信息 |
| 纯白 | `#FFFFFF` | 按钮、卡片、高对比文字 |

**点缀色（占 5%–10%，仅作局部强调）**

| 名称 | 色值 | 用途 |
|------|------|------|
| Technical Green / 技术薄荷绿 | `#2DD4A0` 或类似低饱和薄荷绿 | 技术标签、参数高亮、按钮 hover、局部线条、图表重点 |

**功能色**

| 用途 | 色值 |
|------|------|
| 成功 | `#22AA66` |
| 错误 | `#FF4444` |
| 警告 | `#FFAA00` |

**使用规则**

- 薄荷绿只能用于技术标签、参数高亮、按钮 hover、局部线条、图表重点数据；
- 禁止大面积铺满薄荷绿，避免页面看起来像环保公益或软件仪表盘；
- 深色背景用于 Hero 与头部/底部，浅灰内容区形成节奏。
### 10.2 字体规范

- **英文**：Inter（Google Fonts）
- **中文**：PingFang SC / Microsoft YaHei
- **字体栈**：`'Inter', 'PingFang SC', 'Microsoft YaHei', sans-serif`
- **标题**：短句、重量感，不使用夸张营销语；避免“未来”“颠覆”“重新定义”等泛化表达；
  - 一级：48px–56px / font-weight: 700
  - 二级：32px–36px / font-weight: 700
  - 三级：28px / font-weight: 700
  - 四级：22px / font-weight: 700
  - 五级：18px / font-weight: 700
- **正文**：每段只讲一个物理事实或应用价值，优先使用材料、结构、测试、应用场景相关词汇；
  - 字号：13px–16px（line-height: 1.7–1.9）
- **标签**：10px–11px（letter-spacing: 2px–3px，uppercase）

**推荐表达**

UHMWPE microporous film、PFAS-free laminated system、waterproof-breathable composite、hydrostatic pressure、moisture vapor transmission、peel strength、wash durability、fabric construction、field-ready material solution。

**减少表达**

科技赋能、定义未来、颠覆传统、智能材料生态、打造边界、全场景解决方案、革命性创新。
### 10.3 间距规范

- **页面水平内边距**：48px（桌面）/ 32px（平板）/ 24px（移动端）
- **区块垂直间距**：80px / 60px / 48px
- **卡片内边距**：24px–40px
- **网格间距**：16px–24px

### 10.4 圆角与阴影

- **卡片/按钮**：无圆角（`0px`）
- **例外**：二维码浮层圆角 8px，阴影 `0 8px 32px rgba(0,0,0,0.4)`

---

## 11. 交互与动效规范

### 11.1 通用过渡

| 场景 | 参数 |
|------|------|
| 颜色 | `transition: color 0.25s ease` |
| 背景 | `transition: background-color 0.25s ease` |
| 位移 | `transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1)` |
| 透明度 | `transition: opacity 0.3s ease` |

### 11.2 页面动效

- **淡入上移**：`opacity: 0 → 1`，`translateY(24px) → 0`，0.6s；
- **数字滚动**：统计数字从 0 到目标值，1.5s；
- **交错入场**：stagger 0.08s–0.12s；
- **首页背景**：`scale(1.08) → scale(1)`，1.2s；
- **终端装备卡片 hover**：`translateX(8px)`，背景图淡入 0.4s。

### 11.3 按钮状态

| 状态 | 样式 |
|------|------|
| Hover | 背景色变化 + `scale(1.02)` |
| Active | `scale(0.98)` |
| 禁用 | `opacity: 0.4` |

---

## 12. 性能与可访问性

- 首屏 < 2s，图片懒加载，WebP 格式；
- 路由级代码分割；
- 语义化 HTML，alt 文本必填；
- 对比度 ≥ 4.5:1；
- 键盘导航，focus 可见；
- `prefers-reduced-motion` 支持。

---

## 13. 项目结构

```
web-gangyi/
├── src/
│   ├── components/           # 全局组件
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── SideNav.tsx       # 服务与支持侧栏
│   │   ├── FabricCard.tsx
│   │   ├── EquipmentCard.tsx # 终端装备横条卡片
│   │   ├── ProductShelf.tsx  # 产品货架
│   │   ├── FileViewer.tsx    # PDF/图片文件浏览器
│   │   ├── AnimatedCounter.tsx
│   │   └── Toast.tsx
│   ├── pages/                # 官网页面
│   │   ├── Home.tsx
│   │   ├── FabricDatabase.tsx
│   │   ├── EndUseEquipment.tsx
│   │   ├── FluorineFreeFuture.tsx
│   │   └── ServicesSupport.tsx
│   ├── admin/                # 后台管理
│   │   ├── Login.tsx
│   │   ├── Dashboard.tsx
│   │   ├── HomeEditor.tsx
│   │   ├── FabricManager.tsx
│   │   ├── EquipmentManager.tsx
│   │   ├── ReportManager.tsx
│   │   ├── NewsEditor.tsx
│   │   ├── MediaLibrary.tsx
│   │   └── Settings.tsx
│   ├── hooks/
│   ├── api/                  # 前端 API 封装
│   ├── types/
│   └── styles/
├── server/                   # Express 后端
│   ├── index.ts              # 入口
│   ├── db.ts                 # SQLite 初始化 + 默认数据
│   ├── middleware/
│   │   ├── auth.ts           # JWT 验证
│   │   └── upload.ts         # 文件上传
│   └── routes/
│       ├── config.ts
│       ├── fabrics.ts
│       ├── equipment.ts
│       ├── reports.ts
│       ├── services.ts
│       ├── news.ts
│       ├── media.ts
│       └── admin.ts
├── public/uploads/           # 上传文件目录
├── db.sqlite                 # 数据库文件（gitignore）
├── package.json
├── vite.config.ts
└── tailwind.config.ts
```

---

## 14. 待确认事项

| 序号 | 事项 | 状态 |
|------|------|------|
| 1 | CMS 方案：Express + SQLite 单文件数据库，一条命令启动，是否接受？ | 待确认 |
| 2 | 首页背景图：未上传时前端 Canvas 生成科技纹理，是否接受？ | 待确认 |
| 3 | 面料系列默认 SKU 数量：每个系列 6 款，是否足够？ | 待确认 |
| 4 | 终端装备品类默认产品数量：每个品类 4 款，是否足够？ | 待确认 |
| 5 | 测试报告 PDF 缩略图：后端生成第一页 PNG，是否接受？ | 待确认 |
| 6 | 首次登录默认账号：admin / admin123，首次登录强制改密，是否接受？ | 待确认 |

---

*文档版本：v3.0*  
*更新日期：2026-04-28*  
*技术栈：React 19 + TypeScript + Vite + Tailwind CSS + Express + SQLite*

---

# 附录 A：GONYIK Website Visual Style & Copy Strategy v2（完整策略原文）

# GONYIK Website Visual Style & Copy Strategy v2

> 目标：把 GONYIK 官网从“科技软件感”调整为“高性能防护材料品牌感”。  
> 核心判断：GONYIK 不是 SaaS，不是 AI 平台，也不是普通纺织厂；GONYIK 是以 UHMWPE 微孔膜、复合面料和功能性织物结构为核心的高性能防护材料品牌。

---

## 1. 品牌视觉定位

GONYIK 的官网视觉应该接近：

- 高性能材料品牌
- 户外功能面料 ingredient brand
- 防水透湿 / 防护 / 防晒材料解决方案
- 可被品牌、面料厂、成衣厂、鞋材厂采用的技术平台

不应该接近：

- SaaS 软件官网
- AI 科技平台
- 区块链 / 半导体 / 数字基础设施官网
- 抽象未来科技展示页

视觉关键词：

膜、面料、雨水、风、雪、织物纹理、复合层、实验室测试、样布、膜卷、成衣应用、户外环境、材料剖面、真实验证。

避免关键词：

发光粒子、抽象网格、漂浮卡片、玻璃拟态、渐变光球、软件仪表盘、过度动效、无实体对象的科技背景。

---

## 2. 首页首屏方向

### 当前问题

原首页方向是：

- TECHNOLOGY FABRIC
- 科技面料
- 定义未来
- 以创新材料科技，重塑户外与运动的边界

这组文案过于泛化。它可以用于任何科技纺织、AI 面料、软件平台、设计工作室，不能立刻建立 GONYIK 的材料身份。

### 新首页首屏文案

标签：

PFAS-FREE PERFORMANCE MATERIALS

主标题：

UHMWPE 微孔膜  
构建下一代无氟防护面料

副标题：

以超薄 UHMWPE 微孔膜、无氟复合体系与功能织物结构为核心，为户外、通勤、防护与运动装备提供轻量、防水透湿、高强度的材料解决方案。

主按钮：

查看材料体系

副按钮：

申请样品测试

英文备用版本：

PFAS-Free Protection, Engineered from UHMWPE Microporous Film.

副标题英文备用：

A material platform for lightweight waterproof-breathable fabrics, protective composites, and next-generation performance apparel.

---

## 3. 首页视觉要求

首页首屏必须有明确的物理对象，不允许只用抽象科技背景。

优先级从高到低：

1. 雨水打在深色复合面料上的微距视频或图片
2. UHMWPE 膜卷展开，局部叠加微孔结构
3. 三层复合面料剖面：外层织物 / UHMWPE 微孔膜 / 内层织物
4. 冲锋衣、滑雪服、通勤外套等真实成衣应用
5. 实验室测试场景：静水压、透湿、剥离强力、洗后测试

禁止使用：

- 纯黑背景上的发光线条
- 蓝绿渐变科技粒子
- 大面积玻璃拟态卡片
- 像数据平台一样的 dashboard
- 没有材料实物的抽象 3D 图形

首页的第一视觉判断必须是：

“这是一个高性能材料和功能面料品牌。”

而不是：

“这是一个科技软件公司。”

---

## 4. 色彩方向

主色：

- Graphite Black / 石墨黑
- Deep Charcoal / 深炭灰
- Mist White / 雾白
- Cool Silver / 冷银灰
- Technical Green / 技术薄荷绿，仅作点缀

色彩比例：

- 黑、灰、白：85%–90%
- 薄荷绿：5%–10%
- 其他强调色：不超过 5%

薄荷绿只能用于：

- 技术标签
- 参数高亮
- 按钮 hover
- 局部线条
- 图表重点数据

不要大面积铺满薄荷绿。大面积高饱和绿会削弱材料的高级感，使页面更像环保公益或软件仪表盘。

---

## 5. 字体与版式

整体版式应偏“材料 datasheet + 户外品牌官网”，不是“软件产品 landing page”。

标题：

- 短句
- 重量感
- 不使用夸张营销语
- 避免“未来”“颠覆”“重新定义”泛化表达

正文：

- 每段只讲一个物理事实或应用价值
- 优先使用材料、结构、测试、应用场景
- 不堆空泛形容词

推荐表达：

- UHMWPE microporous film
- PFAS-free laminated system
- waterproof-breathable composite
- hydrostatic pressure
- moisture vapor transmission
- peel strength
- wash durability
- fabric construction
- field-ready material solution

减少表达：

- 科技赋能
- 定义未来
- 颠覆传统
- 智能材料生态
- 打造边界
- 全场景解决方案
- 革命性创新

---

## 6. 首页结构建议

### Block 1 — Hero

目的：3 秒内让访客知道 GONYIK 是做高性能无氟防护材料的。

内容：

- 标签：PFAS-FREE PERFORMANCE MATERIALS
- 主标题：UHMWPE 微孔膜，构建下一代无氟防护面料
- 副标题：以超薄 UHMWPE 微孔膜、无氟复合体系与功能织物结构为核心，为户外、通勤、防护与运动装备提供轻量、防水透湿、高强度的材料解决方案。
- CTA 1：查看材料体系
- CTA 2：申请样品测试

视觉：

- 深色真实面料微距
- 雨水滚落
- 局部膜层剖面
- 不使用抽象科技粒子背景

---

### Block 2 — Material System

标题：

从膜到面料的无氟防护体系

副标题：

GONYIK 不只提供单一面料，而是围绕 UHMWPE 微孔膜、PUR 复合、无氟整理和织物结构设计，形成可打样、可测试、可导入的材料平台。

模块：

1. 外层织物  
负责耐磨、手感、外观与应用场景适配。

2. UHMWPE 微孔膜  
提供防水、透湿、轻量和高强度的核心功能层。

3. 复合胶层  
连接膜与织物，影响剥离强力、透湿保持率和洗后耐久。

4. 内层织物  
影响穿着舒适性、排湿效率、噪音和整体手感。

视觉：

- 三层结构剖面图
- 真实面料切片或工程示意图
- 每一层用材料语言标注，不做软件图标卡片

---

### Block 3 — Product Platforms

标题：

三大材料平台

副标题：

覆盖防水透湿、防护复合和高防晒导湿三类应用方向。

平台一：

Otter  
PFAS-free waterproof-breathable laminated fabrics  
全流程无氟防水透湿复合体系，面向冲锋衣、通勤外套、滑雪服和户外装备。

平台二：

Kais  
Protective textile composites  
高强防护复合体系，面向防刺、防切割、抗冲击和特种防护场景。

平台三：

Rayo  
Sun-protective moisture-management fabrics  
高防晒、高导湿、轻量舒适的功能织物体系，面向跑步、骑行、城市运动和夏季通勤。

视觉：

- 每个平台一张真实材料或应用图
- 不用图标代替材料图
- 不用“软件功能卡片”式排版

---

### Block 4 — Verified by Testing

标题：

性能必须被测试验证

副标题：

高性能面料不应只停留在概念层面。GONYIK 以静水压、透湿、剥离强力、洗后耐久和应用场景测试作为材料开发依据。

数据模块：

- Hydrostatic Pressure / 静水压
- MVTR / 透湿
- Peel Strength / 剥离强力
- Wash Durability / 洗后耐久
- PFAS-free Process / 无氟体系
- Composite Stability / 复合稳定性

视觉：

- 实验室照片
- 测试仪器
- 测试报告局部
- 样布编号
- 数据表格

版式应类似材料测试报告，不要类似软件 dashboard。

---

### Block 5 — Applications

标题：

为真实装备而开发

副标题：

从户外硬壳到城市通勤，从鞋材到防护装备，GONYIK 的材料体系面向真实产品导入，而不是概念展示。

场景：

1. Outdoor Shells  
冲锋衣、滑雪服、登山外套

2. Urban Commuting  
行政夹克、城市机能外套、轻量雨衣

3. Protective Apparel  
防刺、防切割、抗冲击复合装备

4. Footwear & Gear  
鞋面、背包、装备外层和增强部位

视觉：

- 真实成衣
- 真实户外环境
- 局部细节：拉链、压胶、缝线、水珠、面料折痕
- 不用过度干净的 3D 渲染图

---

### Block 6 — Sample Request

标题：

申请样品，进入测试

副标题：

向我们说明应用场景、目标性能和复合结构需求，GONYIK 可提供面料样品、测试数据和材料导入建议。

CTA：

申请样品测试

辅助 CTA：

联系技术团队

---

## 7. 产品系列命名修正

当前网站如继续使用 Osmo / Kinetic / Lumix / Tread，可以作为过渡。但对外建议逐步切换到更贴合项目真实体系的命名：

- Otter：无氟防水透湿复合体系
- Kais：特种防护复合体系
- Rayo：高防晒高导湿功能织物体系

命名原则：

1. 系列名可以有品牌感，但副标题必须材料化。
2. 不要让用户猜系列是什么。
3. 每个系列都必须回答三个问题：
   - 这是什么材料体系？
   - 解决什么性能问题？
   - 用在哪些产品上？

---

## 8. 禁用文案

以下表达不要作为首屏或核心模块标题：

- 科技面料，定义未来
- 以创新材料科技，重塑户外与运动的边界
- 未来已来
- 颠覆传统面料
- 重新定义一切
- 打造全场景生态
- 智能材料平台
- 赋能户外新体验
- 科技改变穿着

这些表达过于泛化，容易让网站失去材料行业可信度。

---

## 9. 推荐文案库

### 品牌总句

GONYIK develops PFAS-free performance material systems based on UHMWPE microporous film and functional textile construction.

中文：

GONYIK 基于 UHMWPE 微孔膜与功能织物结构，开发全流程无氟的高性能防护材料体系。

---

### Otter 系列

标题：

Otter 无氟防水透湿复合体系

副标题：

以 UHMWPE 微孔膜为核心，通过无氟整理、PUR 复合和织物结构设计，实现轻量、防水、透湿与洗后耐久的平衡。

应用：

适用于冲锋衣、滑雪服、通勤外套、轻量雨衣和户外装备面料。

---

### Kais 系列

标题：

Kais 高强防护复合体系

副标题：

基于 UHMWPE 纤维织物与抗冲击膜层的复合设计，面向防刺、防切割、抗冲击等特种防护场景。

应用：

适用于防护服、防刺内胆、工业防切割装备、战术防护和增强部位材料。

---

### Rayo 系列

标题：

Rayo 高防晒高导湿织物体系

副标题：

通过原纱防晒、导湿纱线和织物结构设计，在轻量面料中实现高 UPF、防晒耐久和快速导湿。

应用：

适用于跑步、骑行、夏季通勤、防晒外套和高温环境运动服。

---

## 10. 图片与视频制作准则

必须优先制作：

1. 首页 Hero：雨水落在深色面料上的微距视频或照片
2. Otter：三层复合结构剖面图
3. Otter：静水压 / 透湿 / 剥离强力测试照片
4. Kais：刀尖接触 UHMWPE 织物的防刺示意图
5. Rayo：纱线截面与导湿路径示意图
6. 样布平铺图：统一暗灰背景、低反光、带编号标签
7. 膜卷 / 薄膜实物图：用于建立材料真实性

图片风格：

- 真实
- 冷静
- 高对比
- 低饱和
- 材料细节清楚
- 不过度商业广告化

不要使用：

- 过度精修的假户外照片
- 夸张合成光效
- 纯 AI 生成但没有材料真实感的图
- 软件官网常见的抽象 3D 背景

---

## 11. 最终判断标准

每一屏上线前问三个问题：

1. 用户能不能在 3 秒内判断这是“材料 / 面料 / 防护体系”？
2. 这张图里有没有真实物理对象？
3. 文案是否讲清楚了材料结构、性能或应用，而不是只讲愿景？

只要答案有一个是否定，就需要重做。

原：
参考风格：Apple 官网首页 — 全屏高质量背景、居中巨型标题、精炼副标题、底部双按钮、大量留白。

改：
参考风格：GORE-TEX / eVent / Arc'teryx 材料技术页 — 真实材料质感、户外应用场景、膜层结构、测试验证与品牌级克制排版。首页可以保持全屏 Hero，但必须以真实面料、膜层或应用场景作为视觉锚点，不使用纯抽象科技纹理作为主视觉。

原：
TECHNOLOGY FABRIC  
科技面料  
定义未来  
以创新材料科技，重塑户外与运动的边界

改：
PFAS-FREE PERFORMANCE MATERIALS  
UHMWPE 微孔膜  
构建下一代无氟防护面料  
以超薄 UHMWPE 微孔膜、无氟复合体系与功能织物结构为核心，为真实装备提供可测试、可复合、可导入的材料解决方案。
