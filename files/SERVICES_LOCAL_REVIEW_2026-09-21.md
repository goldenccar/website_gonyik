# 专业支持本地审阅

日期：2026-09-21。仅本地实现，未发布生产。

## 页面与内容

- 材料与性能支持：复合结构图解、三条判断建议、按主题分组的七条问答。区分表面拒水、功能层防水、透湿/透气/导湿；按 OTTER 专业户外、RAYO 轻户外的场景定义选材；KAIS 的结构与防护验证单独对待。
- 使用与养护：四步操作配四张近景照片；八条问答分为清洗准备、洗涤与漂洗、干燥与拒水三组。只给可水洗功能外套的一般指导，水温、熨烫、烘干与干洗由成衣洗标决定。
- 数字面料与虚拟打样：材料向数字网格过渡的概念图、三项资料说明、紧凑的软件格式列表、咨询入口。没有把概念图写成真实仿真结果，没有承诺所有型号都有可下载文件。保留现有格式记录，具体兼容性与交付范围按项目确认。
- 共用 Hero、次级导航及其他页面内容保持不变。正文改为通栏背景内的统一宽度容器；没有增加图片图注和装饰性英文小标签。

## 参考依据

2026-09-21 核对的公开一手资料：

- [GORE-TEX 外套护理](https://www.gore-tex.com/support/care/outerwear)：先看成衣说明、清洗与漂洗、干燥、拒水恢复的组织方式。
- [eVent 面料护理](https://eventfabrics.com/care-instructions/)：护理顺序及 DWR 状态检查。其干洗、熨烫建议与 GORE-TEX 不同，因此不复制品牌特定参数。
- [CLO 文件格式](https://support.clo3d.com/hc/en-us/articles/115000470688-CLO-File-Formats)：核对 .zfab 的颜色、贴图和物理属性范围。
- 港翼：现有 RPO 膜、纤维及复合结构内容，以及业务已确认的 OTTER/RAYO 场景定义。没有新增数值性能、认证结论、量产承诺或公开 TDS。

## CMS 与数据

页面说明、图解图片、要点、FAQ 标题、咨询文案/链接存于服务页面的 `content_blocks`，在服务与支持管理的页面编辑弹窗内维护。护理图片/替代文本在洗涤步骤内维护；问答分组在每条 FAQ 内维护；文件格式沿用原有集合编辑器。图解和数字示意图均可替换为上传图片。

内容稿：`files/content/services-review-20260921.json`。
本地数据：`preview.local/production-preview-db.json`。
手动应用：停止本地预览后运行 `node scripts/apply-services-review.mjs --apply`，再启动 `node --import tsx scripts/preview-local.ts`。脚本备份旧数据库，只更新专业支持的指定内容；不会在应用启动或生产部署时自动运行。不要在 CMS 编辑后无意重复应用初稿。

生产发布时必须另外准备并核对内容差异，不能只推前端程序，也不能直接用本地数据库覆盖线上数据库。

## 素材与性能

素材保存在 `public/visuals/support/`：

| 文件 | 用途 | 大小 |
|---|---|---:|
| prepare-v1.webp | 检查洗标与接缝 | 60,642 B |
| wash-v1.webp | 少量清洁剂 | 54,808 B |
| dry-v1.webp | 晾挂干燥 | 48,378 B |
| repellency-v1.webp | 表面水滴 | 96,786 B |
| digital-v1.webp | 数字面料概念 | 215,950 B |
| material-structure-v1.svg | 面层、薄膜、内层的结构示意 | 约 3 KB |

五张位图使用内置 Imagegen 生成，保留原图，以 Sharp 仅缩放/转 WebP。结构示意直接用 SVG 绘制，无商业文案嵌入图中；不按真实厚度比例，不表示微孔结构。位图均使用延迟加载和固定宽高。没有增加运行时依赖或网页字体。

### Imagegen 完整提示词

每张使用下列共同前缀，加上相应主题提示：

> Create one landscape 3:2 natural editorial photograph for a premium functional textile care guide. Restrained navy blue, soft neutral gray, real tactile matte fabric, soft window light, quiet practical studio, no dramatic lighting, no glossy CGI, no excessive perfection, no logos, NO TEXT, NO WATERMARK, no face. Close composition, candid accurate material textures. One coherent photograph, not collage.

1. prepare: Macro photograph of fingers inspecting the inside seam and plain white care label of a navy technical shell jacket lying on pale stone table. Garment zipper and velcro cuff visible. The label is turned away so NO writing or symbols are readable. Natural hands cropped at wrist.
2. wash: Top-down photograph of navy technical shell fabric beside a small unbranded clear liquid detergent bottle and a modest measure of clear detergent in its cap on light stone laundry counter. No hands. No bubbles, no flowers, no cleaning marketing packaging.
3. dry: Detail photograph of a navy technical shell jacket hanging from a broad wooden hanger near a softly lit neutral window. Crop close to shoulder, open collar and upper front zipper, showing fine matte woven texture and natural folds. Calm soft background, no person.
4. repellency: Very close macro photograph of a few clear water beads on a matte navy fine woven technical shell sleeve. Different droplet sizes, real understated light reflections, sharply resolved weave and a seam, subtle imperfections. No giant splashes or oily shine.
5. digital: High-end textile development illustration rendered with restrained realistic studio lighting: a single matte navy blue cloth swatch draped in two broad natural folds on a pale cool gray surface. Left half photorealistically woven; right half transitions seamlessly into a fine cyan-gray polygon wireframe following the EXACT same folds, illustrating physical fabric to digital model. Not a software screenshot, no interface, no text, no labels, no futuristic glow. Wide horizontal balanced composition with cloth centered and generous breathing room. The wireframe should be subtle but visible.

## 验证

- 33 项测试通过；包括新增的专业支持 CMS 页面模块、配图、替代文本与 FAQ 分组往返检查，媒体引用识别。
- 类型检查、构建及质量审计通过；无零引用组件、废导出或超出性能预算的资源。
- 1440px 桌面及 390px 手机端逐页检查图文布局、加载与横向溢出；问答展开正常。
- 与修改前的本地备份比较：共用 Hero、其他页面、用户数据与站点设置未变。
