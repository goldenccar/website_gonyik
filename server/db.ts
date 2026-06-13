import fs from 'fs'
import path from 'path'
import bcrypt from 'bcryptjs'

const DB_PATH = path.resolve(process.cwd(), 'db.json')
const UPLOADS_DIR = path.resolve(process.cwd(), 'public/uploads')

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true })
}

export interface Database {
  home_config: any
  site_config: any
  page_configs: any[]
  navigation: any[]
  footer_config: any
  social_media: any[]
  fabric_series: any[]
  fabric_sku: any[]
  fabric_scenes: any[]
  digital_assets: any[]
  media_items: any[]
  test_reports: any[]
  equipment_categories: any[]
  equipment_products: any[]
  equipment_scenes: any[]
  about_us: any
  philosophies: any[]
  milestones: any[]
  news: any[]
  care_guides: any[]
  faqs: any[]
  contact_config: any
  fluorine_sections: any[]
  fluorine_value_chain: any
  inquiry_subjects: any[]
  contact_messages: any[]
  users: any[]
}

function createDefaultDb(): Database {
  const defaultDb: Database = {
    home_config: {
      id: 1,
      hero_tag: 'PFAS-FREE PERFORMANCE MATERIALS',
      hero_title: '以固纳 RPO 无氟材料科技\n创造更安全的高性能织物',
      hero_slogan: '固纳 RPO 无氟材料平台，融合先进复合技术与结构设计，赋予面料持久防护、舒适透气与多功能表现。',
      hero_background: null,
      primary_btn_text: '探索材料平台',
      primary_btn_link: '/fabrics',
      secondary_btn_text: '了解无氟未来',
      secondary_btn_link: '/fluorine-free',
      hero_features: [
        { icon: 'ShieldCheck', title: '100% PFAS-FREE', subtitle: '全系无氟' },
        { icon: 'Droplets', title: '防水透湿', subtitle: '平衡舒适' },
        { icon: 'Layers', title: '多功能复合', subtitle: '应对多元场景' },
        { icon: 'Leaf', title: '可持续创新', subtitle: '安全·耐用·可信赖' },
      ],
      platform_section_title: '技术来源与材料平台',
      platform_section_subtitle: '源自科研，成就可靠材料解决方案。',
      platform_section_link_text: '了解更多',
      platform_section_link: '/fluorine-free',
      platform_cards: [
        {
          icon: 'Building2',
          title: '科研来源',
          subtitle: '香港科技大学（广州）科创成果转化',
          description: '先进材料与工程研究基础\n创新驱动，工程化商落地',
          footer: 'HKUST(GZ) Origin',
        },
        {
          icon: 'Atom',
          title: '固纳 RPO',
          subtitle: 'GONYIK 专有无氟材料平台',
          description: '以配方与工艺创新\n实现高性能与可持续的平衡',
          footer: 'GONYIK Proprietary Platform',
        },
        {
          icon: 'Hexagon',
          title: '无氟复合体系',
          subtitle: 'PFAS-FREE 复合材料体系',
          description: '在防护、耐久与舒适之间\n达成可靠平衡',
          footer: 'PFAS-Free by Design',
        },
        {
          icon: 'Shirt',
          title: '功能织物结构设计',
          subtitle: '以纤维与结构设计',
          description: '放大材料潜能\n服务多样化应用需求',
          footer: 'Engineered for Performance',
        },
      ],
      series_section_title: '核心面料平台',
      series_section_subtitle: '面向多元应用的材料平台，让高性能更可持续。',
      series_section_link_text: '查看全部系列',
      series_section_link: '/fabrics',
      scenarios_section_title: '应用场景提示',
      scenarios: [
        { icon: 'Shirt', label: '冲锋衣', link: '/fabrics/otter' },
        { icon: 'Shield', label: '防护服', link: '/fabrics/kais' },
        { icon: 'Backpack', label: '背负系统', link: '/equipment' },
        { icon: 'Sun', label: '防晒轻量单品', link: '/fabrics/rayo' },
      ],
      verification_section_title: '验证与标准',
      verification_section_subtitle: '平台级验证，安心选择。',
      verification_section_link_text: '具体指标见系列',
      verification_section_link: '/fabrics',
      verifications: [
        { icon: 'Award', title: '平台级验证', subtitle: '面料通过多维性能验证' },
        { icon: 'Droplets', title: '防水透湿性能', subtitle: '在防护中保持舒适干爽' },
        { icon: 'Sun', title: '抗紫外线防护', subtitle: '有效阻隔紫外线' },
        { icon: 'Leaf', title: 'PFAS 检测（LC-MS）', subtitle: '未检出，全系无氟' },
      ],
    },
    site_config: {
      logo_url: null,
      logo_text: '港翼科技',
      favicon_url: null,
    },
    page_configs: [
      { id: 1, page_key: 'fabrics', page_tag: 'FABRIC DATABASE', page_title: '面料数据库', page_subtitle: '四大核心系列，覆盖户外、运动、工装全场景', hero_background: null },
      { id: 2, page_key: 'equipment', page_tag: 'END USE & EQUIPMENT', page_title: '终端装备', page_subtitle: '四大品类，覆盖全场景功能需求', hero_background: null },
      { id: 3, page_key: 'fluorine-free', page_tag: 'RPO MATERIAL PLATFORM', page_title: 'RPO材料平台 · 探索无氟未来', page_subtitle: '以科技创新推动可持续发展，告别 PFAS，拥抱绿色未来', hero_background: null },
      { id: 4, page_key: 'services', page_tag: 'SERVICES & SUPPORT', page_title: '服务与支持', page_subtitle: '全方位服务体系，助力您的每一个项目', hero_background: null },
    ],
    navigation: [
      { id: 2, label: '面料数据库', link: '/fabrics', order_index: 0 },
      { id: 3, label: '终端装备', link: '/equipment', order_index: 1 },
      { id: 4, label: '探索无氟未来', link: '/fluorine-free', order_index: 2 },
      { id: 5, label: '服务与支持', link: '/services', order_index: 3 },
      { id: 6, label: '联系我们', link: '/contact', order_index: 4 },
    ],
    footer_config: {
      id: 1,
      copyright: '© 2026 港翼科技 GONYIK 版权所有',
      privacy_policy_link: '/privacy-policy',
      icp_number: 'ICP备案号（占位）',
      icp_link: '#',
      police_number: '',
      police_link: 'https://beian.mps.gov.cn/#/query/webSearch?code=44011502001610',
      privacy_policy_content: '<h2>隐私政策</h2><p>港翼科技（GONYIK）重视您的隐私保护。本政策说明我们如何收集、使用和保护您的个人信息。</p><h3>信息收集</h3><p>我们可能收集您在使用我们服务时自愿提供的信息，包括但不限于姓名、联系方式、公司名称等。</p><h3>信息使用</h3><p>我们仅将收集的信息用于提供和改善服务、回复您的咨询、发送相关产品信息等目的。</p><h3>信息保护</h3><p>我们采用行业标准的安全措施保护您的个人信息，防止未经授权的访问、使用或泄露。</p><h3>联系我们</h3><p>如您对隐私政策有任何疑问，请通过网站联系方式与我们取得联系。</p>',
    },
    contact_config: {
      id: 1,
      email: 'contact@gangyi.tech',
      phone: '400-XXX-XXXX',
      address: '上海市',
      response_text: '提交表单后，我们的面料顾问将在 3 个工作日内与您取得联系',
      smtp_host: '',
      smtp_port: 587,
      smtp_user: '',
      smtp_pass: '',
      smtp_secure: false,
    },
    inquiry_subjects: [
      { id: 1, label: '功能咨询', order_index: 0 },
      { id: 2, label: '样品申请', order_index: 1 },
      { id: 3, label: '合作洽谈', order_index: 2 },
      { id: 4, label: '技术支持', order_index: 3 },
      { id: 5, label: '其他', order_index: 4 },
    ],
    fluorine_sections: [
      {
        id: 1,
        page_key: 'fluorine-free',
        order_index: 0,
        title: '什么是 RPO 材料技术平台？',
        subtitle: '阻断"永久化学品"，重构 PFAS-free 性能基盘',
        content: 'PFAS 类物质因其极难降解被称为"永久化学品"，在人体内长期富集将引发严重健康隐患<note>永久化学品的隐患：ECHA / EPA 官方文件</note>/h<i>"PFAS are characterized by the carbon-fluorine bond, which is one of the strongest chemical bonds in organic chemistry. This makes them highly persistent in the environment and the human body, leading to their designation as \'forever chemicals\'."</i><i>"PFAS 的特征在于碳-氟键，这是有机化学中最强的化学键之一。这使得它们在环境和人体中具有极高的持久性，因此被称为"永久化学品"。"</i>/h<i>"Exposure to certain PFAS has been linked to adverse health effects, including liver damage, thyroid disease, reproductive issues, and certain types of cancer (e.g., kidney and testicular cancer). Due to their high bioaccumulation potential, they do not naturally degrade and accumulate in blood and organs over time."</i><i>"暴露于某些 PFAS 与不良健康影响有关，包括肝脏损伤、甲状腺疾病、生殖问题以及某些类型的癌症。由于其高生物富集潜力，它们无法自然降解，并会随时间推移在血液和器官中积聚。"</i>/hECHA Annex XV 限制提案原文：<i>"At the end of their service life, the waste management of PFAS-containing products poses significant environmental risks. Incomplete or inappropriate incineration of PFAS requires extremely high temperatures for complete mineralisation. Standard incineration processes can lead to the release of greenhouse gases (e.g., tetrafluoromethane CF4) and highly toxic hydrogen fluoride (HF) into the environment."</i><i>"在其使用寿命结束时，含 PFAS 产品的废物管理构成了重大的环境风险。不完全或不当的 PFAS 焚烧需要极高的温度才能完全矿化。标准的焚烧过程会导致温室气体及剧毒的氟化氢（HF）释放到环境中。"</i>/h<b>RPO 平台从高分子底层科学出发</b>，打造涵盖RPO二维薄膜、RPO一维纱线、复合到助剂的 <b>100% PFAS-Free 闭环</b>，为行业提供全生命周期的工程级解法，无需在环保合规与极限防护之间妥协。不仅解决环保合规，<b>RPO材料平台 更是极限防护的基盘</b>，直接支持军警与高危特种防护材料开发<note>防刺防割面料，满足 GA68-2024 标准</note><note>防火阻燃中间层，满足xx标准</note>',
        image_url: null,
        image_fit: 'cover',
      },
      {
        id: 2,
        page_key: 'fluorine-free',
        order_index: 1,
        title: '超微孔纳米薄膜',
        subtitle: '极致微孔结构与力学稳定性',
        content: '采用极精密超倍率拉伸工艺，构建近纳米级<note>孔径仅为传统高性能微孔薄膜约十分之一</note>超微孔网络，确立纯粹的物理透湿与极高水压屏障。/h薄膜具备<b>顶级的力学稳定性</b>，在复杂形变、拉伸下依然保持微观结构完整，彻底规避常规无氟替代方案在水洗后极易发生的孔隙塌陷与滑移问题。',
        image_url: null,
        image_fit: 'cover',
      },
      {
        id: 3,
        page_key: 'fluorine-free',
        order_index: 2,
        title: '无氟科技纱线',
        subtitle: '一维 RPO 骨架与多维基材共融织造体系',
        content: '以<b>极高强度的一维 RPO 材料</b>构筑核心防护骨架，提供极致的拉伸与抗切割性能。/h通过创新的<b>多维基材共融织造体系</b>，将常规锦纶、涤纶、氨纶等成熟基材无缝接入专属的无氟染整闭环。客户在维持原有面料触感与设计语言的同时，即可完成全线产品的无氟化升级。',
        image_url: null,
        image_fit: 'cover',
      },
      {
        id: 4,
        page_key: 'fluorine-free',
        order_index: 3,
        title: '无氟界面粘接',
        subtitle: '突破低表面能复合难题',
        content: '针对RPO材料极低表面能（约 28-31 dynes/cm）的物理特性，开发<b>专属无氟粘接技术</b>。/h在不引入有毒含氟交联剂前提下，实现卓越的物理剥离力。赋予多层复合面料<b>极高的加工宽容度与结构耐用性</b>，历经严苛工业水洗与高频摩擦，各层结构依然紧密贴合。',
        image_url: null,
        image_fit: 'cover',
      },
      {
        id: 5,
        page_key: 'fluorine-free',
        order_index: 4,
        title: '无氟科技助剂',
        subtitle: '系统级防护',
        content: '专属无氟助剂体系构建<b>持久防泼水外层拦截</b>，偶发渗入的低表面张力油污无法与基材形成强化学键。/h依托薄膜卓越的力学稳定性，仅需常规清洗，即可利用流体置换孔内污染物，复原超微孔结构，实现<b>可循环的长效防护</b>。',
        image_url: null,
        image_fit: 'cover',
      },
    ],
    fluorine_value_chain: {
      id: 1,
      page_key: 'fluorine-free',
      module_tag: 'MODULE 01 · VALUE CHAIN',
      title: '无氟产业链全景图',
      subtitle: '从原料端到终端装备，每一个环节严格无氟，构建完整的绿色材料闭环。',
      columns: [
        {
          tag: 'RAW INPUT',
          tag_cn: '上游基底',
          title: 'RPO 高性能薄膜',
          description: '从高分子母粒出发，自主精密合成，构建无氟防水透汽屏障的最小单元。',
          items: ['高分子母粒', 'RPO 薄膜成形', '微孔结构控制'],
        },
        {
          tag: 'INTEGRATION',
          tag_cn: '中游协同',
          title: '无氟基布 + 无氟 DWR',
          description: '精选功能性无氟基布与顶级无氟拒水助剂，通过特殊界面复合工艺完成技术融合。',
          items: ['无氟功能基布', '顶级无氟 DWR', '界面粘接体系'],
        },
        {
          tag: 'HIGH-PERF OUTPUT',
          tag_cn: '下游输出',
          title: 'SOTEX 面料矩阵',
          description: '最终交付跨代际防护能力——OS、KS、LS 全系列面料，覆盖从都市到极端环境的全场景需求。',
          items: ['SOTEX OS', 'SOTEX KS', 'SOTEX LS', 'SOTEX Tread'],
        },
      ],
    },
    social_media: [
      { id: 1, platform: 'wechat', account: '港翼科技GONYIK', qrcode_url: null },
      { id: 2, platform: 'xiaohongshu', account: '港翼科技GONYIK', qrcode_url: null },
      { id: 3, platform: 'douyin', account: '港翼科技GONYIK', qrcode_url: null },
    ],
    fabric_series: [
      { id: 1, name: 'Otter', slug: 'otter', description: '无氟高性能复合面料 3L，Solidgood RPO Membrane 中间层，香港科技大学前沿纳米材料 / 日内瓦国际发明展金奖技术', tagline: '新一代无氟防护 · 高性能复合', sub_series_data: null, cover_image: '/uploads/otter-logo.svg', home_image: null, order_index: 0 },
      { id: 2, name: 'Kais', slug: 'kais', description: '专业防护平台，基于 UHMWPE 纤维基材的防刺/防火/防化解决方案', tagline: '专业防护平台 · 防刺/防火/防化', sub_series_data: '[{"slug":"kais-edge","name":"Kais-Edge","subtitle":"铠 · 锋","description":"防切割抗穿刺，通过公安部 D3/D2 认证","accent_color":"#8B3A3A","link":"/fabrics/kais-edge"},{"slug":"kais-ignis","name":"Kais-Ignis","subtitle":"铠 · 焰","description":"阻燃隔热，芳纶 + UHMWPE/TPU 复合膜结构","accent_color":"#C45D3A","link":"/fabrics/kais-ignis"}]', cover_image: null, home_image: null, order_index: 1 },
      { id: 3, name: 'Rayo', slug: 'rayo', description: '原生防晒导湿系列，Coolmax + TiO2 原纱处理，UPF 150+', tagline: '原生防晒 · 导湿凉感', sub_series_data: null, cover_image: null, home_image: null, order_index: 2 },
      { id: 4, name: 'Tread', slug: 'tread', description: '鞋材级耐磨抗撕裂面料，户外鞋与安全鞋专用', tagline: '鞋材级 · 耐磨抗撕裂', sub_series_data: null, cover_image: null, home_image: null, order_index: 3 },
    ],
    fabric_scenes: [
      { id: 1, category: '都市生活', label: '日常通勤', series_slug: 'rayo', order_index: 0 },
      { id: 2, category: '都市生活', label: '商务差旅', series_slug: 'otter', order_index: 1 },
      { id: 3, category: '都市生活', label: '城市轻户外', series_slug: 'rayo', order_index: 2 },
      { id: 4, category: '轻户外', label: '徒步旅行', series_slug: 'otter', order_index: 3 },
      { id: 5, category: '轻户外', label: '露营休闲', series_slug: 'otter', order_index: 4 },
      { id: 6, category: '轻户外', label: '城市骑行', series_slug: 'rayo', order_index: 5 },
      { id: 7, category: '专业运动', label: '滑雪登山', series_slug: 'otter', order_index: 6 },
      { id: 8, category: '专业运动', label: '水域活动', series_slug: 'otter', order_index: 7 },
      { id: 9, category: '专业运动', label: '越野跑步', series_slug: 'rayo', order_index: 8 },
      { id: 10, category: '特种防护', label: '战术防护', series_slug: 'kais-edge', order_index: 9 },
      { id: 11, category: '特种防护', label: '阻燃工装', series_slug: 'kais-ignis', order_index: 10 },
      { id: 12, category: '特种防护', label: '工业安全', series_slug: 'kais-edge', order_index: 11 },
      { id: 13, category: '特种防护', label: '鞋材应用', series_slug: 'tread', order_index: 12 },
    ],
    digital_assets: [],
    media_items: [],
    fabric_sku: [
      { id: 1, series_id: 1, name: 'Otter-T31', sku_code: 'GY-OTTER-T31', image: null, features: '["无氟","3L复合","防水透气","RPO膜","再生材料"]', specifications: '{"结构":"3L","面层":"88% PA6 [REC] + 12% SP","中间层":"100% Solidgood RPO Membrane","底层":"100% PES [REC]","克重":"188 g/m²","规格":"80D","认证":"SGS / CTTC / OEKO-TEX 100 / GRS"}', order_index: 0 },
      { id: 2, series_id: 1, name: 'Otter-T32', sku_code: 'GY-OTTER-T32', image: null, features: '["无氟","3L复合","防水透气","RPO膜","再生材料"]', specifications: '{"结构":"3L","面层":"88% PA6 [REC] + 12% SP","中间层":"100% Solidgood RPO Membrane","底层":"100% PES [REC]","克重":"165 g/m²","规格":"70D","认证":"SGS / CTTC / OEKO-TEX 100 / GRS"}', order_index: 1 },
      { id: 3, series_id: 1, name: 'Otter-T33', sku_code: 'GY-OTTER-T33', image: null, features: '["无氟","3L复合","防水透气","RPO膜","再生材料"]', specifications: '{"结构":"3L","面层":"88% PA6 [REC] + 12% SP","中间层":"100% Solidgood RPO Membrane","底层":"100% PES [REC]","克重":"210 g/m²","规格":"100D","认证":"SGS / CTTC / OEKO-TEX 100 / GRS"}', order_index: 2 },
      { id: 3, series_id: 2, name: 'Kinetic-100', sku_code: 'GY-KINETIC-100', image: null, features: '["高弹","速干"]', specifications: '{"stretch":"30%","breathable":"12000g/m²/24h","weight":"100g/m²"}', order_index: 0 },
      { id: 4, series_id: 2, name: 'Kinetic-101', sku_code: 'GY-KINETIC-101', image: null, features: '["高弹","速干"]', specifications: '{"stretch":"40%","breathable":"15000g/m²/24h","weight":"110g/m²"}', order_index: 1 },
      { id: 5, series_id: 3, name: 'Lumix-100', sku_code: 'GY-LUMIX-100', image: null, features: '["轻量化","透光"]', specifications: '{"weight":"60g/m²","transparency":"15%","uv":"UPF50+"}', order_index: 0 },
      { id: 6, series_id: 3, name: 'Lumix-101', sku_code: 'GY-LUMIX-101', image: null, features: '["轻量化","透光"]', specifications: '{"weight":"70g/m²","transparency":"20%","uv":"UPF50+"}', order_index: 1 },
      { id: 7, series_id: 4, name: 'Tread-100', sku_code: 'GY-TREAD-100', image: null, features: '["耐磨","防风"]', specifications: '{"abrasion":"50000+","windproof":"100%","weight":"200g/m²"}', order_index: 0 },
      { id: 8, series_id: 4, name: 'Tread-101', sku_code: 'GY-TREAD-101', image: null, features: '["耐磨","防风"]', specifications: '{"abrasion":"80000+","windproof":"100%","weight":"220g/m²"}', order_index: 1 },
    ],
    test_reports: [],
    equipment_categories: [
      { id: 1, name: 'Latent', slug: 'latent', description: '隐形防护层，日常通勤与商务场景的低调选择', bg_image: null, image_fit: 'cover', order_index: 0 },
      { id: 2, name: 'U-Line', slug: 'u-line', description: '城市机能线，都市探索者的功能美学', bg_image: null, image_fit: 'cover', order_index: 1 },
      { id: 3, name: 'P-Line', slug: 'p-line', description: '专业性能线，为极限环境打造的旗舰装备', bg_image: null, image_fit: 'cover', order_index: 2 },
      { id: 4, name: 'A-Line', slug: 'a-line', description: '全天候适应线，一件应对多变气候', bg_image: null, image_fit: 'cover', order_index: 3 },
    ],
    equipment_products: [
      { id: 1, category_id: 1, name: 'Latent Pro 1', image: null, features: '["轻量化","防风","透气"]', order_index: 0 },
      { id: 2, category_id: 1, name: 'Latent Pro 2', image: null, features: '["轻量化","防风","透气"]', order_index: 1 },
      { id: 3, category_id: 2, name: 'U-Line Pro 1', image: null, features: '["城市机能","防水","透气"]', order_index: 0 },
      { id: 4, category_id: 2, name: 'U-Line Pro 2', image: null, features: '["城市机能","防水","透气"]', order_index: 1 },
      { id: 5, category_id: 3, name: 'P-Line Pro 1', image: null, features: '["专业性能","耐磨","保暖"]', order_index: 0 },
      { id: 6, category_id: 3, name: 'P-Line Pro 2', image: null, features: '["专业性能","耐磨","保暖"]', order_index: 1 },
      { id: 7, category_id: 4, name: 'A-Line Pro 1', image: null, features: '["全天候","防水","透气"]', order_index: 0 },
      { id: 8, category_id: 4, name: 'A-Line Pro 2', image: null, features: '["全天候","防水","透气"]', order_index: 1 },
    ],
    equipment_scenes: [
      { id: 1, category: '都市生活', label: '日常通勤', equipment_slug: 'latent', order_index: 0 },
      { id: 2, category: '都市生活', label: '商务差旅', equipment_slug: 'latent', order_index: 1 },
      { id: 3, category: '都市生活', label: '城市轻户外', equipment_slug: 'u-line', order_index: 2 },
      { id: 4, category: '轻户外', label: '徒步旅行', equipment_slug: 'p-line', order_index: 3 },
      { id: 5, category: '轻户外', label: '露营休闲', equipment_slug: 'a-line', order_index: 4 },
      { id: 6, category: '轻户外', label: '城市骑行', equipment_slug: 'u-line', order_index: 5 },
      { id: 7, category: '专业运动', label: '滑雪登山', equipment_slug: 'p-line', order_index: 6 },
      { id: 8, category: '专业运动', label: '水域活动', equipment_slug: 'p-line', order_index: 7 },
      { id: 9, category: '专业运动', label: '越野跑步', equipment_slug: 'p-line', order_index: 8 },
      { id: 10, category: '特种防护', label: '战术防护', equipment_slug: 'p-line', order_index: 9 },
      { id: 11, category: '特种防护', label: '阻燃工装', equipment_slug: 'a-line', order_index: 10 },
      { id: 12, category: '特种防护', label: '工业安全', equipment_slug: 'p-line', order_index: 11 },
      { id: 13, category: '特种防护', label: '鞋材应用', equipment_slug: 'p-line', order_index: 12 },
    ],
    about_us: {
      id: 1,
      positioning_title: '公司定位',
      positioning_content: '港翼科技（GONYIK）是一家专注于高性能科技面料研发与生产的创新型企业。我们致力于将尖端材料科学与可持续环保理念相结合，为户外、运动、工装及都市时尚领域提供卓越的功能性面料解决方案。',
      slogan_text: '科技之翼，赋能无限可能',
    },
    philosophies: [
      { id: 1, number: 1, title: '科技驱动', description: '以材料科学为核心，持续突破功能性面料的性能边界', order_index: 0 },
      { id: 2, number: 2, title: '可持续未来', description: '100% 无氟承诺，从源头减少环境负担', order_index: 1 },
      { id: 3, number: 3, title: '极致品质', description: '每一米面料都经过严苛测试，确保终端产品表现卓越', order_index: 2 },
    ],
    milestones: [
      { id: 1, year: '2018', event: '港翼科技成立，专注功能性面料研发', order_index: 0 },
      { id: 2, year: '2020', event: '首款无氟防水面料投入量产', order_index: 1 },
      { id: 3, year: '2022', event: 'Osmo 系列问世，进军高端户外市场', order_index: 2 },
      { id: 4, year: '2024', event: '通过 bluesign® 系统合作伙伴认证', order_index: 3 },
      { id: 5, year: '2026', event: '发布 100% 无氟产品路线图', order_index: 4 },
    ],
    news: [
      { id: 1, title: '港翼科技发布 2026 春夏面料系列', cover_image: null, content: '<p>本季新品涵盖 Osmo、Kinetic、Lumix、Tread 四大系列，在保持卓越功能性的同时，全面采用无氟防水技术。</p>', images: null, status: 'published', published_at: new Date().toISOString(), created_at: new Date().toISOString() },
      { id: 2, title: '荣获 bluesign® 系统合作伙伴认证', cover_image: null, content: '<p>标志着港翼科技在可持续生产和环境管理方面达到国际领先水平。</p>', images: null, status: 'published', published_at: new Date(Date.now() - 7 * 86400000).toISOString(), created_at: new Date(Date.now() - 7 * 86400000).toISOString() },
      { id: 3, title: '无氟防水技术白皮书正式发布', cover_image: null, content: '<p>详细阐述了港翼科技在无氟防水领域的研发路径、测试数据与环保效益。</p>', images: null, status: 'published', published_at: new Date(Date.now() - 14 * 86400000).toISOString(), created_at: new Date(Date.now() - 14 * 86400000).toISOString() },
    ],
    care_guides: [
      { id: 1, icon: 'Droplets', title: '常规清洗', content: '使用中性洗涤剂，水温不超过 30°C，反面洗涤以保护面料功能层。避免使用柔顺剂。', order_index: 0 },
      { id: 2, icon: 'Sun', title: '自然晾干', content: '洗后置于通风阴凉处自然晾干，避免暴晒和高温烘干，以保持面料的防水透气性能。', order_index: 1 },
      { id: 3, icon: 'Wind', title: '恢复防泼水', content: '随着穿着和洗涤，防泼水效果会逐渐减弱。低温熨烫或使用专业 DWR 喷雾可恢复。', order_index: 2 },
      { id: 4, icon: 'Ban', title: '避免事项', content: '请勿干洗、漂白或干烘。避免接触油性物质和尖锐物品，以防损伤面料表层。', order_index: 3 },
    ],
    faqs: [
      { id: 1, question: '如何索取面料样品？', answer: '您可以通过服务与支持页面的联系表单提交样品申请，或直接与我们的销售团队联系。通常在 3-5 个工作日内寄出。', category: null, order_index: 0 },
      { id: 2, question: '最小起订量（MOQ）是多少？', answer: '不同系列的 MOQ 有所不同，常规系列通常为 500 米起订，具体请与业务人员确认。', category: null, order_index: 1 },
      { id: 3, question: '打样周期需要多久？', answer: '标准打样周期为 7-15 个工作日，复杂工艺或定制开发可能需要更长时间。', category: null, order_index: 2 },
      { id: 4, question: '是否支持定制开发？', answer: '是的，我们拥有完整的研发实验室，支持从纤维选材到后整理的全流程定制开发。', category: null, order_index: 3 },
      { id: 5, question: '面料的环保认证有哪些？', answer: '我们的产品已通过 bluesign®、OEKO-TEX® Standard 100、GRS 等多项国际环保认证。', category: null, order_index: 4 },
      { id: 6, question: '如何验证面料的真伪？', answer: '每批面料均配有唯一批次号，可通过官网或联系客服进行溯源验证。', category: null, order_index: 5 },
    ],
    contact_messages: [],
    users: [
      { id: 1, username: 'admin', password_hash: bcrypt.hashSync('888888', 10), must_change_password: 0, created_at: new Date().toISOString() },
    ],
  }

  fs.writeFileSync(DB_PATH, JSON.stringify(defaultDb, null, 2))
  return defaultDb
}

export let db: Database

export function initDatabase() {
  if (fs.existsSync(DB_PATH)) {
    db = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'))
    // Backward compatibility: ensure new fields exist
    if (!db.contact_config) {
      db.contact_config = { id: 1, email: 'contact@gangyi.tech', phone: '400-XXX-XXXX', address: '上海市', response_text: '提交表单后，我们的面料顾问将在 3 个工作日内与您取得联系' }
    }
    if (!db.fluorine_sections) db.fluorine_sections = []
    if (!db.fluorine_value_chain) {
      db.fluorine_value_chain = {
        id: 1,
        page_key: 'fluorine-free',
        module_tag: 'MODULE 01 · VALUE CHAIN',
        title: '无氟产业链全景图',
        subtitle: '从原料端到终端装备，每一个环节严格无氟，构建完整的绿色材料闭环。',
        columns: [
          { tag: 'RAW INPUT', tag_cn: '上游基底', title: 'RPO 高性能薄膜', description: '从高分子母粒出发，自主精密合成，构建无氟防水透汽屏障的最小单元。', items: ['高分子母粒', 'RPO 薄膜成形', '微孔结构控制'] },
          { tag: 'INTEGRATION', tag_cn: '中游协同', title: '无氟基布 + 无氟 DWR', description: '精选功能性无氟基布与顶级无氟拒水助剂，通过特殊界面复合工艺完成技术融合。', items: ['无氟功能基布', '顶级无氟 DWR', '界面粘接体系'] },
          { tag: 'HIGH-PERF OUTPUT', tag_cn: '下游输出', title: 'SOTEX 面料矩阵', description: '最终交付跨代际防护能力——OS、KS、LS 全系列面料，覆盖从都市到极端环境的全场景需求。', items: ['SOTEX OS', 'SOTEX KS', 'SOTEX LS', 'SOTEX Tread'] },
        ],
      }
      saveDb()
    }
    if (db.fluorine_sections.length > 0 && !db.fluorine_sections[0].image_fit) {
      db.fluorine_sections = db.fluorine_sections.map((s: any) => ({ ...s, image_fit: 'cover' }))
      saveDb()
    }
    if (!db.fabric_scenes) db.fabric_scenes = []
    if (!db.digital_assets) db.digital_assets = []
    if (!db.media_items) {
      // Migrate existing uploads to media_items
      const uploadsDir = path.resolve(process.cwd(), 'public/uploads')
      const migrated: any[] = []
      if (fs.existsSync(uploadsDir)) {
        fs.readdirSync(uploadsDir).forEach((filename) => {
          if (filename.startsWith('.')) return
          const filepath = path.join(uploadsDir, filename)
          const stat = fs.statSync(filepath)
          migrated.push({
            id: migrated.length + 1,
            filename,
            url: `/uploads/${filename}`,
            category: 'other',
            description: '',
            file_type: '',
            size: stat.size,
            created_at: stat.birthtime.toISOString(),
          })
        })
      }
      db.media_items = migrated
      saveDb()
    }
    if (!db.inquiry_subjects) {
      db.inquiry_subjects = [
        { id: 1, label: '功能咨询', order_index: 0 },
        { id: 2, label: '样品申请', order_index: 1 },
        { id: 3, label: '合作洽谈', order_index: 2 },
        { id: 4, label: '技术支持', order_index: 3 },
        { id: 5, label: '其他', order_index: 4 },
      ]
      saveDb()
    }
    if (!db.equipment_scenes) {
      db.equipment_scenes = [
        { id: 1, category: '都市生活', label: '日常通勤', equipment_slug: 'latent', order_index: 0 },
        { id: 2, category: '都市生活', label: '商务差旅', equipment_slug: 'latent', order_index: 1 },
        { id: 3, category: '都市生活', label: '城市轻户外', equipment_slug: 'u-line', order_index: 2 },
        { id: 4, category: '轻户外', label: '徒步旅行', equipment_slug: 'p-line', order_index: 3 },
        { id: 5, category: '轻户外', label: '露营休闲', equipment_slug: 'a-line', order_index: 4 },
        { id: 6, category: '轻户外', label: '城市骑行', equipment_slug: 'u-line', order_index: 5 },
        { id: 7, category: '专业运动', label: '滑雪登山', equipment_slug: 'p-line', order_index: 6 },
        { id: 8, category: '专业运动', label: '水域活动', equipment_slug: 'p-line', order_index: 7 },
        { id: 9, category: '专业运动', label: '越野跑步', equipment_slug: 'p-line', order_index: 8 },
        { id: 10, category: '特种防护', label: '战术防护', equipment_slug: 'p-line', order_index: 9 },
        { id: 11, category: '特种防护', label: '阻燃工装', equipment_slug: 'a-line', order_index: 10 },
        { id: 12, category: '特种防护', label: '工业安全', equipment_slug: 'p-line', order_index: 11 },
        { id: 13, category: '特种防护', label: '鞋材应用', equipment_slug: 'p-line', order_index: 12 },
      ]
      saveDb()
    }
    if (!db.page_configs) {
      db.page_configs = [
        { id: 1, page_key: 'fabrics', page_tag: 'FABRIC DATABASE', page_title: '面料数据库', page_subtitle: '四大核心系列，覆盖户外、运动、工装全场景', hero_background: null },
        { id: 2, page_key: 'equipment', page_tag: 'END USE & EQUIPMENT', page_title: '终端装备', page_subtitle: '四大品类，覆盖全场景功能需求', hero_background: null },
        { id: 3, page_key: 'fluorine-free', page_tag: 'RPO MATERIAL PLATFORM', page_title: 'RPO材料平台 · 探索无氟未来', page_subtitle: '以科技创新推动可持续发展，告别 PFAS，拥抱绿色未来', hero_background: null },
        { id: 4, page_key: 'services', page_tag: 'SERVICES & SUPPORT', page_title: '服务与支持', page_subtitle: '全方位服务体系，助力您的每一个项目', hero_background: null },
      ]
      saveDb()
    }
    if (!db.contact_messages) db.contact_messages = []
    // Backward compatibility: ensure new home_config fields exist
    if (db.home_config) {
      const homeDefaults: Record<string, any> = {
        hero_features: [
          { icon: 'ShieldCheck', title: '100% PFAS-FREE', subtitle: '全系无氟' },
          { icon: 'Droplets', title: '防水透湿', subtitle: '平衡舒适' },
          { icon: 'Layers', title: '多功能复合', subtitle: '应对多元场景' },
          { icon: 'Leaf', title: '可持续创新', subtitle: '安全·耐用·可信赖' },
        ],
        platform_section_title: '技术来源与材料平台',
        platform_section_subtitle: '源自科研，成就可靠材料解决方案。',
        platform_section_link_text: '了解更多',
        platform_section_link: '/fluorine-free',
        platform_cards: [
          { icon: 'Building2', title: '科研来源', subtitle: '香港科技大学（广州）科创成果转化', description: '先进材料与工程研究基础\n创新驱动，工程化商落地', footer: 'HKUST(GZ) Origin' },
          { icon: 'Atom', title: '固纳 RPO', subtitle: 'GONYIK 专有无氟材料平台', description: '以配方与工艺创新\n实现高性能与可持续的平衡', footer: 'GONYIK Proprietary Platform' },
          { icon: 'Hexagon', title: '无氟复合体系', subtitle: 'PFAS-FREE 复合材料体系', description: '在防护、耐久与舒适之间\n达成可靠平衡', footer: 'PFAS-Free by Design' },
          { icon: 'Shirt', title: '功能织物结构设计', subtitle: '以纤维与结构设计', description: '放大材料潜能\n服务多样化应用需求', footer: 'Engineered for Performance' },
        ],
        series_section_title: '核心面料平台',
        series_section_subtitle: '面向多元应用的材料平台，让高性能更可持续。',
        series_section_link_text: '查看全部系列',
        series_section_link: '/fabrics',
        scenarios_section_title: '应用场景提示',
        scenarios: [
          { icon: 'Shirt', label: '冲锋衣', link: '/fabrics/otter' },
          { icon: 'Shield', label: '防护服', link: '/fabrics/kais' },
          { icon: 'Backpack', label: '背负系统', link: '/equipment' },
          { icon: 'Sun', label: '防晒轻量单品', link: '/fabrics/rayo' },
        ],
        verification_section_title: '验证与标准',
        verification_section_subtitle: '平台级验证，安心选择。',
        verification_section_link_text: '具体指标见系列',
        verification_section_link: '/fabrics',
        verifications: [
          { icon: 'Award', title: '平台级验证', subtitle: '面料通过多维性能验证' },
          { icon: 'Droplets', title: '防水透湿性能', subtitle: '在防护中保持舒适干爽' },
          { icon: 'Sun', title: '抗紫外线防护', subtitle: '有效阻隔紫外线' },
          { icon: 'Leaf', title: 'PFAS 检测（LC-MS）', subtitle: '未检出，全系无氟' },
        ],
      }
      let homeChanged = false
      for (const [key, value] of Object.entries(homeDefaults)) {
        if (db.home_config[key] === undefined) {
          db.home_config[key] = value
          homeChanged = true
        }
      }
      // Migrate old default hero content to new optimized defaults
      if (
        db.home_config.hero_tag === 'TECHNOLOGY FABRIC' &&
        db.home_config.hero_title === '科技面料\n定义未来' &&
        db.home_config.hero_slogan === '以创新材料科技，重塑户外与运动的边界'
      ) {
        db.home_config.hero_tag = 'PFAS-FREE PERFORMANCE MATERIALS'
        db.home_config.hero_title = '以固纳 RPO 无氟材料科技\n创造更安全的高性能织物'
        db.home_config.hero_slogan = '固纳 RPO 无氟材料平台，融合先进复合技术与结构设计，赋予面料持久防护、舒适透气与多功能表现。'
        db.home_config.primary_btn_text = '探索材料平台'
        db.home_config.primary_btn_link = '/fabrics'
        db.home_config.secondary_btn_text = '了解无氟未来'
        db.home_config.secondary_btn_link = '/fluorine-free'
        homeChanged = true
      }
      if (homeChanged) saveDb()
    }
    // Backward compatibility: ensure home_image exists on fabric_series
    if (db.fabric_series && db.fabric_series.length > 0 && db.fabric_series[0].home_image === undefined) {
      db.fabric_series = db.fabric_series.map((s: any) => ({ ...s, home_image: s.home_image ?? null }))
      saveDb()
    }
    // Backward compatibility: ensure police_number / police_link exist on footer_config
    if (db.footer_config && db.footer_config.police_number === undefined) {
      db.footer_config = { ...db.footer_config, police_number: '', police_link: 'https://www.beian.gov.cn/portal/registerSystemInfo' }
      saveDb()
    }
    // Backward compatibility: ensure image_fit exists on equipment_categories
    if (db.equipment_categories.length > 0 && db.equipment_categories[0].image_fit === undefined) {
      db.equipment_categories = db.equipment_categories.map((c: any) => ({ ...c, image_fit: 'cover' }))
      saveDb()
    }
    // Backward compatibility: ensure cooperation_type exists on existing messages
    if (db.contact_messages.length > 0 && db.contact_messages[0].cooperation_type === undefined) {
      db.contact_messages = db.contact_messages.map((m: any) => ({ ...m, cooperation_type: m.cooperation_type || '' }))
      saveDb()
    }
  } else {
    db = createDefaultDb()
  }
}

export function saveDb() {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2))
}

// Helper functions
export function getNextId(arr: any[]): number {
  return arr.length > 0 ? Math.max(...arr.map((i) => i.id)) + 1 : 1
}

export function sortByOrderIndex<T extends { order_index?: number }>(a: T, b: T): number {
  return (a.order_index ?? 0) - (b.order_index ?? 0)
}

export function updateById<T extends { id: number }>(arr: T[], id: number, patch: Partial<T>): boolean {
  const idx = arr.findIndex((item) => item.id === id)
  if (idx < 0) return false
  arr[idx] = { ...arr[idx], ...patch }
  return true
}

export function deleteById<T extends { id: number }>(arr: T[], id: number): boolean {
  const idx = arr.findIndex((item) => item.id === id)
  if (idx < 0) return false
  arr.splice(idx, 1)
  return true
}

export function uploadUrl(file: { filename: string }): string {
  return `/uploads/${file.filename}`
}

export function nextOrderIndex(arr: { length: number }): number {
  return arr.length
}
