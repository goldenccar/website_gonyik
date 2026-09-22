# 多语言与复合技术本地审阅

日期：2026-09-21。仅本地实现，未部署生产。

## 内容维护

- `/admin/localizations`：选择 English 或繁體中文，搜索原文/译文并保存。清空英文译文会回退中文原文，不会恢复隐藏在代码里的旧译文；繁体留空使用服务器转换。
- `/admin/fluorine`：在后台「材料科技」选择复合技术。Hero、四段内容、用途结构切换、视觉类型和咨询链接仍使用现有技术内容块。
- 译文导入种子位于 `server/content/localizations-20260921.json`，只在首次迁移时补缺。运行中的内容事实源是 CMS 数据库，修改种子不会覆盖已保存的运营内容。
- `files/content/lamination-review-20260921.json` 为此次中文内容包，研究依据见 `LAMINATION_CONTENT_PROPOSAL_2026-09-21.md`。正文不搬用文献中的数值、配方或他方认证。

## 译文风格

简洁、专业、通俗；OTTER = technical outdoor，RAYO = everyday outdoor，KAIS = specialist protection。透湿采用 water-vapor transmission，透气采用 air permeability，导湿采用 moisture wicking；场景介绍可使用 moisture management，但不替代测试指标。防割为 cut resistance，防刺为 stab resistance，不擅自升级为 ballistic protection。

保留现有业务事实与报告范围，不借翻译扩张认证、制造能力或材料参数。繁体按原义转换并保存，统一使用「濕」等用字。

## 检查

- 已清除两个前台固定英文词典，翻译及章节数据走同一 CMS。
- 英文逐页浏览检查涵盖首页、系列、型号、应用、六个技术页、三页支持、联系与隐私页；修复数字面料「交换格式」字段漏收集问题。
- 支持、复合页面的中/英/繁正文及标记完整性有可重复测试；CMS 覆盖优先级、清空译文和重复迁移也有回归测试。
- 初版构建主脚本压缩体积由约 58.7 KB 降至约 37.3 KB，移除了浏览器固定英文内容；这不是实际网络速度测试。

中文内容后续新增或改写后，英文需要在后台补译。未建立自动机器翻译服务，不向第三方发送 CMS 内容。

最终验收：当前 CMS 的 591 条翻译源，英文与繁体均无缺项；40 项测试通过，生产构建与质量审计通过。桌面核对繁体护理与英文复合工艺排版，手机核对英文数字面料与复合结构切换。已恢复浏览器默认视口。预览停留在中文复合技术页。
