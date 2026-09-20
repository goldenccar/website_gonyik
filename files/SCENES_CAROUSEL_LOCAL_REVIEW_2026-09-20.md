# 场景轮播与 RPO 系列同步 · 本地审阅

- RPO-Tech 的 `series` 版式从公共 bootstrap 的已发布系列数据读取名称、定位、介绍、图片和顺序。删除本地概览与初始化内容中的旧卡片副本；CMS 对应模块说明改为在面料系列管理维护。
- 户外、轻户外分别新增两张，共六张。桌面四张、手机两张；箭头或方向键每次移动一张，触屏原生横向滑动，首尾循环，不自动播放。保持图片无标题、无图注。
- 场景资源、替代文本、顺序继续保存在应用 CMS 的 `scene_images`，本地内容副本见 `application-scenes-local-content.json`。
- 本地数据库已备份至 `preview.local/db-before-six-scenes-*.json`，未部署生产。

## 新资源

使用内置 image_gen 生成，生成提示集见 [APPLICATION_SCENE_EXPANSION_PROMPTS.json](APPLICATION_SCENE_EXPANSION_PROMPTS.json)。原始生成稿保留，交付资源为压缩后的 960×640 WebP：

- `public/visuals/application-scene-alpine-v1.webp`：雪山攀登冲锋衣近景，80,184 bytes。
- `public/visuals/application-scene-cliff-v1.webp`：大风海崖远景，118,244 bytes。
- `public/visuals/application-scene-running-v1.webp`：城市跑步近景，54,590 bytes。
- `public/visuals/application-scene-motorcycle-v1.webp`：摩托车通勤近景，71,254 bytes。

## 验证

- 构建、类型检查、31 项现有测试及质量审计通过。
- 场景 API 两类均为六张，12 个资源地址返回 200。
- 浏览器验证桌面四张、首张前退接末张与末张后进回首张；390px 手机两张，页面无横向溢出。
- RPO 概览实测读取新版三系列配图、定位与介绍，链接跳到对应系列锚点。

本地入口：`http://127.0.0.1:5180/equipment#application-9`、`http://127.0.0.1:5180/pfas-free-innovation/rpo-material-platform#series`。
