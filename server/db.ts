import fs from 'fs'
import path from 'path'
import bcrypt from 'bcryptjs'
import { DEFAULT_FABRIC_CAPABILITIES } from '../src/config/fabricCapabilities'

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
  fabric_capabilities: any[]
  fabric_sku: any[]
  product_code_registry?: { sku_code: string; internal_code: string }[]
  media_items: any[]
  test_reports: any[]
  equipment_categories: any[]
  equipment_products: any[]
  care_guides: any[]
  faqs: any[]
  contact_config: any
  fluorine_sections: any[]
  technology_sections_version?: number
  rpo_sotex_naming_version?: number
  brand_identity_version?: number
  product_dual_code_version?: number
  fabric_card_positioning_version?: number
  service_sections_version?: number
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
      hero_mobile_background: null,
      primary_btn_text: '探索材料平台',
      primary_btn_link: '/fabrics',
      secondary_btn_text: '了解无氟未来',
      secondary_btn_link: '/pfas-free-innovation',
      platform_section_title: '技术来源与材料平台',
      platform_section_subtitle: '源自科研，成就可靠材料解决方案。',
      platform_section_link_text: '了解更多',
      platform_section_link: '/pfas-free-innovation',
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
          subtitle: '固纳高性能材料平台',
          description: '以配方与工艺创新\n实现高性能与可持续的平衡',
          footer: 'SOLIDGOOD RPO',
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
      verification_image: null,
      verification_section_title: '测试与认证',
      verification_section_subtitle: '内部验证用于研发与过程控制，关键结果由独立第三方检测提供依据。',
      verification_section_link_text: '查看测试与认证',
      verification_section_link: '/pfas-free-innovation#technology-testing-certification',
      verifications: [
        { title: '内部实验室', subtitle: '依托香港科技大学（广州）多功能高聚物薄膜中央实验室，开展材料筛选、结构开发、样品对比与耐久验证。' },
        { title: '第三方测试认证', subtitle: '根据具体产品与项目要求，委托 SGS、中纺标 CTTC 等专业机构检测，结果以正式报告为准。' },
      ],
    },
    site_config: {
      logo_url: null,
      logo_text: '港翼科技',
      favicon_url: null,
    },
    page_configs: [
      { id: 1, page_key: 'fabrics', page_tag: 'FABRIC DATABASE', page_title: '按使用环境，找到合适的材料', page_subtitle: '从日常与户外使用到特种专业场景，查看材料系列、具体型号与验证依据。', hero_background: null, core_performance_title: '核心性能' },
      { id: 2, page_key: 'equipment', page_tag: 'END-USE APPLICATIONS', page_title: '从面料到真实应用', page_subtitle: '查看不同装备采用的港翼面料，以及材料如何构成完整的穿着体验。', hero_background: null },
      { id: 3, page_key: 'pfas-free-innovation', page_tag: 'TECHNOLOGY INNOVATION', page_title: '技术，从材料开始', page_subtitle: '探索膜、复合、功能整理、供应链与测试验证。', hero_background: null },
      { id: 4, page_key: 'services', page_tag: 'CARE & SUPPORT', page_title: '服务与支持', page_subtitle: '从洗涤保养到常见问题，为材料使用与项目沟通提供支持。', hero_background: null },
      { id: 5, page_key: 'contact', page_tag: 'CONTACT US', page_title: '联系我们', page_subtitle: '如有材料需求或合作意向，欢迎与我们取得联系。', hero_background: null },
    ],
    navigation: [
      { id: 2, label: '面料数据库', link: '/fabrics', order_index: 0 },
      { id: 3, label: '终端装备', link: '/equipment', order_index: 1 },
      { id: 4, label: '技术创新', link: '/pfas-free-innovation', order_index: 2 },
      { id: 5, label: '服务与支持', link: '/services', order_index: 3 },
      { id: 6, label: '联系我们', link: '/contact', order_index: 4 },
    ],
    footer_config: {
      id: 1,
      brand_tag: 'GONYIK',
      brand_title: '港翼科技',
      brand_description: '专注无氟高性能面料与专业防护材料，围绕膜技术、面料复合、功能整理与测试验证，为日常户外及特种专业场景提供材料解决方案。',
      material_title: '材料与应用',
      support_title: '服务与支持',
      contact_title: '联系',
      contact_subtitle: '材料与合作咨询',
      copyright: '© 2026 港翼科技 GONYIK 版权所有',
      privacy_policy_link: '/privacy-policy',
      icp_number: '粤ICP备2026056006号-1',
      icp_link: 'https://beian.miit.gov.cn/',
      police_number: '粤公网安备44011502001610号',
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
        page_key: 'pfas-free-innovation',
        order_index: 0,
        title: '无氟技术体系',
        subtitle: '从材料选择，到完整产品路径',
        content: '无氟并不是对传统方案的简单删减，而是从材料选择、功能构建到成品结构的一次系统重组。港翼以无氟为重要技术方向，围绕膜材料、高性能纤维、功能整理与面料复合建立多条技术路径，根据不同使用环境组织材料与工艺，让防护、舒适、耐久与更负责任的材料选择在同一产品中取得平衡。/h这套体系贯穿研发、生产与验证。材料从实验室出发，经织造、染整与复合进入产品，再通过测试确认其在具体结构和使用条件下的实际表现。',
        image_url: null,
        image_fit: 'cover',
      },
      {
        id: 2,
        page_key: 'pfas-free-innovation',
        order_index: 1,
        title: '膜技术',
        subtitle: 'RPO-SOTEX 无氟纳米膜',
        content: '真正的防护，来自一层几乎不可见的材料界面。RPO-SOTEX 是固纳面向高性能纺织应用研发的无氟纳米膜技术，被置入面料结构之中，在抵御外部雨水的同时，为人体产生的湿气保留向外传递的路径。/hRPO-SOTEX 不以一层孤立的膜材定义产品性能，而是与基布、复合结构及加工工艺协同工作，在防护与舒适之间建立平衡。它进入具体面料，并通过结构设计与测试验证发挥作用。',
        image_url: null,
        image_fit: 'cover',
      },
      {
        id: 3,
        page_key: 'pfas-free-innovation',
        order_index: 2,
        title: '纤维与功能整理',
        subtitle: '让功能从纤维与基布开始',
        content: '不同的功能目标，并不都需要依赖膜层。港翼通过高性能纤维、功能纱线、织物结构与无氟整理的组合，在基布阶段构建导湿、速干、防晒、凉感及专业防护等差异化能力。/h从纤维选择到织物成形，我们根据穿着环境和应用需求设计材料路径，让功能成为面料结构的一部分，并为后续复合、加工与成衣应用保留更大的设计空间。',
        image_url: null,
        image_fit: 'cover',
      },
      {
        id: 4,
        page_key: 'pfas-free-innovation',
        order_index: 3,
        title: '面料复合技术',
        subtitle: '让不同材料协同成为完整面料',
        content: '一块高性能面料的表现，从来不由单一材料决定。港翼围绕面层、功能层与内层进行结构设计，通过基布选择、复合方式与层间结合，让不同材料在同一套面料系统中协同工作。/h我们根据具体应用，在防护、透湿、手感、重量与耐久之间寻找合适的结构平衡，使实验室中的材料能力转化为能够被裁剪、缝制、穿着并稳定使用的完整面料。',
        image_url: null,
        image_fit: 'cover',
      },
      {
        id: 5,
        page_key: 'pfas-free-innovation',
        order_index: 4,
        title: '供应链管理',
        subtitle: '让技术稳定进入产品',
        content: '技术只有被稳定制造，才真正具备产品价值。港翼与具备织造、染整、复合及质量管理能力的合作伙伴协同，围绕材料来源、规格、批次与工艺要求进行持续管理，让经过确认的技术方案能够从样品开发进入稳定生产。/h在材料选择上，我们重视来源可追溯性、质量稳定性及相关环境资质。部分供应链材料可提供 bluesign®、GRS 或 OEKO-TEX® 相关认证信息，为材料选择和项目交付提供更清晰的依据。',
        image_url: null,
        image_fit: 'cover',
      },
      {
        id: 6,
        page_key: 'pfas-free-innovation',
        section_key: 'testing-certification',
        order_index: 5,
        title: '测试与验证',
        subtitle: '从研发测试到独立第三方检测',
        content: '依托固纳实验室、香港科技大学（广州）多功能高聚物薄膜中央实验室，以及合作伙伴升佳纺织的织造与染整实验室，我们围绕材料筛选、结构开发、样品对比、耐久表现与生产过程开展测试，让产品在进入市场之前经过多层验证。/h对于需要独立验证的关键性能，我们根据具体产品与项目要求，委托 SGS、中纺标 CTTC 等专业机构进行检测。相关结果对应具体样品、测试方法与适用范围，并以正式检测报告为准。',
        image_url: null,
        image_fit: 'cover',
      },
      {
        id: 7,
        page_key: 'services',
        section_key: 'care',
        module_type: 'care',
        order_index: 0,
        nav_label: '洗涤保养',
        eyebrow: 'CARE',
        title: '洗涤与保养',
        subtitle: '正确清洗与保养，有助于维持材料的防护和舒适表现。',
        content: '',
        image_url: null,
        image_fit: 'cover',
      },
      {
        id: 8,
        page_key: 'services',
        section_key: 'faq',
        module_type: 'faq',
        order_index: 1,
        nav_label: '常见问题',
        eyebrow: 'Q&A',
        title: '常见问题',
        subtitle: '',
        content: '',
        image_url: null,
        image_fit: 'cover',
      },
      {
        id: 9,
        page_key: 'services',
        section_key: 'contact',
        module_type: 'contact',
        order_index: 2,
        nav_label: '联系我们',
        eyebrow: 'CONTACT',
        title: '材料建议、样品与合作咨询',
        subtitle: '告诉我们使用环境、目标性能和项目阶段，我们会根据已有材料或开发需求提供对应支持。',
        content: '',
        image_url: null,
        image_fit: 'cover',
      },
    ],
    technology_sections_version: 4,
    rpo_sotex_naming_version: 1,
    brand_identity_version: 1,
    product_dual_code_version: 1,
    fabric_card_positioning_version: 1,
    service_sections_version: 1,
    social_media: [
      { id: 1, platform: 'wechat', account: '港翼科技GONYIK', qrcode_url: null },
      { id: 2, platform: 'xiaohongshu', account: '港翼科技GONYIK', qrcode_url: null },
      { id: 3, platform: 'douyin', account: '港翼科技GONYIK', qrcode_url: null },
    ],
    fabric_capabilities: DEFAULT_FABRIC_CAPABILITIES.map((item, index) => ({ ...item, id: index + 1, order_index: index })),
    fabric_series: [
      { id: 1, name: 'Otter', slug: 'otter', description: '无氟高性能复合面料 3L，Solidgood RPO Membrane 中间层，香港科技大学前沿纳米材料 / 日内瓦国际发明展金奖技术', tagline: '新一代无氟防护', home_image: null, home_badge_image: '/brandmarks/otter-label.svg', order_index: 0 },
      { id: 2, name: 'Kais', slug: 'kais', description: '专业防护平台，基于 UHMWPE 纤维基材的防刺/防火/防化解决方案', tagline: '专业防护平台 · 防刺/防火/防化', home_image: null, home_badge_image: '/brandmarks/kais-label.svg', order_index: 1 },
      { id: 3, name: 'Rayo', slug: 'rayo', description: '原生防晒导湿系列，Coolmax + TiO2 原纱处理，UPF 150+', tagline: '原生防晒 · 导湿凉感', home_image: null, home_badge_image: '/brandmarks/rayo-label.svg', order_index: 2 },
    ],
    media_items: [],
    fabric_sku: [
      { id: 1, series_id: 1, name: 'OT-01（原T31）', sku_code: 'OT-01', internal_code: 'OT3-PAEL70-V15-PES50-B', public_name: 'OTTER T70', product_type: '三层防护复合面料', position_performance: 7, position_durability: 7, position_handfeel: 4, image: '/visuals/otter-t70-texture.png', features: '["durable-waterproof","high-moisture-permeability","all-weather-protection"]', specifications: '{"结构":"3L Tri-layer","面层":"70D锦氨梭织面料","理论克重":"253 g/m²","中层":"V1.5膜 · 4 g/m²","底层":"50D纯涤佳积布 · 95 g/m²","胶量":"两面各12 g/m²，合计24 g/m²","复合纹路":"篮球纹"}', card_summary: '', visibility: 'public', status: 'active', order_index: 0 },
      { id: 2, series_id: 1, name: 'OT-02', sku_code: 'OT-02', internal_code: 'OT3-PAEL50-V20-PES30-D', public_name: 'OTTER T50', product_type: '轻量三层防护复合面料', position_performance: null, position_durability: null, position_handfeel: null, image: null, features: '["无氟","3L复合","RPO膜"]', specifications: '{"结构":"3L Tri-layer","面层":"50D锦氨梭织面料","理论克重":"183 g/m²","中层":"V2.0膜 · 4 g/m²","底层":"30D纯涤高密精编可特 · 55 g/m²","胶量":"两面各12 g/m²，合计24 g/m²","复合纹路":"小菱形纹"}', card_summary: '', visibility: 'public', status: 'active', order_index: 1 },
    ],
    product_code_registry: [
      { sku_code: 'OT-01', internal_code: 'OT3-PAEL70-V15-PES50-B' },
      { sku_code: 'OT-02', internal_code: 'OT3-PAEL50-V20-PES30-D' },
    ],
    test_reports: [],
    equipment_categories: [
      { id: 1, name: '日常休闲', slug: 'daily', description: '面向通勤与日常穿着的舒适、防风雨和轻量应用。', bg_image: null, image_fit: 'cover', order_index: 0 },
      { id: 2, name: '户外运动', slug: 'outdoor', description: '面向徒步、骑行和多变天气的功能装备应用。', bg_image: null, image_fit: 'cover', order_index: 1 },
      { id: 3, name: '特种专业', slug: 'special', description: '面向防刺与消防等明确任务的专业装备应用。', bg_image: null, image_fit: 'cover', order_index: 2 },
    ],
    equipment_products: [
      { id: 1, category_id: 1, name: '通勤防护外套', image: null, features: '["日常风雨","舒适穿着","Otter"]', related_sku_ids: [1], order_index: 0 },
      { id: 2, category_id: 1, name: '夏季轻量外层', image: null, features: '["防晒","导湿","Rayo"]', related_sku_ids: [], order_index: 1 },
      { id: 3, category_id: 2, name: '风雨户外服装', image: null, features: '["防水透湿","耐用","Otter"]', related_sku_ids: [1, 2], order_index: 0 },
      { id: 4, category_id: 2, name: '运动防晒服装', image: null, features: '["轻量","导湿","Rayo"]', related_sku_ids: [], order_index: 1 },
      { id: 5, category_id: 3, name: '防刺装备', image: null, features: '["明确任务","防刺内层","Kais"]', related_sku_ids: [], order_index: 0 },
      { id: 6, category_id: 3, name: '消防装备', image: null, features: '["消防场景","专业防护","Kais"]', related_sku_ids: [], order_index: 1 },
    ],
    care_guides: [
      { id: 1, title: '常规清洗', content: '使用中性洗涤剂，水温不超过 30°C，反面洗涤以保护面料功能层。避免使用柔顺剂。', order_index: 0 },
      { id: 2, title: '自然晾干', content: '洗后置于通风阴凉处自然晾干，避免暴晒和高温烘干，以保持面料的防水透气性能。', order_index: 1 },
      { id: 3, title: '恢复防泼水', content: '随着穿着和洗涤，防泼水效果会逐渐减弱。低温熨烫或使用专业 DWR 喷雾可恢复。', order_index: 2 },
      { id: 4, title: '避免事项', content: '请勿干洗、漂白或干烘。避免接触油性物质和尖锐物品，以防损伤面料表层。', order_index: 3 },
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

function replaceLegacyRpoName(value: any): any {
  if (typeof value === 'string') return value.replaceAll('RPO-TEX', 'RPO-SOTEX')
  if (Array.isArray(value)) return value.map(replaceLegacyRpoName)
  if (value && typeof value === 'object') {
    for (const key of Object.keys(value)) value[key] = replaceLegacyRpoName(value[key])
  }
  return value
}

function replaceLegacyBrandIdentity(value: any): any {
  if (typeof value === 'string') {
    return value
      .replaceAll('固纳科技旗下', '固纳旗下')
      .replaceAll('GONYIK 专有无氟材料平台', '固纳高性能材料平台')
      .replaceAll('GONYIK Proprietary Platform', 'SOLIDGOOD RPO')
  }
  if (Array.isArray(value)) return value.map(replaceLegacyBrandIdentity)
  if (value && typeof value === 'object') {
    for (const key of Object.keys(value)) value[key] = replaceLegacyBrandIdentity(value[key])
  }
  return value
}

function migrateProductDualCode(database: Database) {
  const otterSeries = database.fabric_series?.find((series: any) => series.slug === 'otter')
  if (!otterSeries) return

  const existingSkus = Array.isArray(database.fabric_sku) ? database.fabric_sku : []
  const source = existingSkus.find((sku: any) => sku.sku_code === 'OT-001')
    || existingSkus.find((sku: any) => sku.series_id === otterSeries.id && /T31|N70|PAEL70/i.test(`${sku.name || ''} ${sku.sku_code || ''}`))
    || existingSkus.find((sku: any) => sku.series_id === otterSeries.id)
  let sourceSpecs: Record<string, string> = {}
  try { sourceSpecs = typeof source?.specifications === 'string' ? JSON.parse(source.specifications) : (source?.specifications || {}) } catch { sourceSpecs = {} }

  const firstId = source?.id ?? getNextId(existingSkus)
  const secondId = Math.max(firstId + 1, getNextId(existingSkus))
  database.fabric_sku = [
    {
      id: firstId,
      series_id: otterSeries.id,
      name: 'OT-01（原T31）',
      sku_code: 'OT-01',
      internal_code: 'OT3-PAEL70-V15-PES50-B',
      image: source?.image || null,
      features: source?.features || '["无氟","3L复合","RPO膜"]',
      specifications: JSON.stringify({
        ...sourceSpecs,
        '结构': '3L',
        '面层': '70D锦氨面布 · 130 g/m²',
        '中层': 'V1.5膜 · 4 g/m²',
        '底层': '50D纯涤佳积布 · 95 g/m²',
        '胶量': '两面各12 g/m²，合计24 g/m²',
        '复合纹路': '篮球纹',
        '理论成品克重': '253 g/m²',
      }),
      card_summary: source?.card_summary || '',
      visibility: 'public',
      status: 'active',
      order_index: 0,
    },
    {
      id: secondId,
      series_id: otterSeries.id,
      name: 'OT-02',
      sku_code: 'OT-02',
      internal_code: 'OT3-PAEL50-V20-PES30-D',
      image: null,
      features: '["无氟","3L复合","RPO膜"]',
      specifications: JSON.stringify({
        '结构': '3L',
        '面层': '50D锦氨面布 · 100 g/m²',
        '中层': 'V2.0膜 · 4 g/m²',
        '底层': '30D纯涤高密精编可特 · 55 g/m²',
        '胶量': '两面各12 g/m²，合计24 g/m²',
        '复合纹路': '小菱形纹',
        '理论成品克重': '183 g/m²',
      }),
      card_summary: '',
      visibility: 'public',
      status: 'active',
      order_index: 1,
    },
  ]
  database.product_code_registry = database.fabric_sku.map((sku: any) => ({
    sku_code: sku.sku_code,
    internal_code: sku.internal_code,
  }))

}

function migrateFabricProductCards(database: Database) {
  database.fabric_capabilities = Array.isArray(database.fabric_capabilities) ? database.fabric_capabilities : []
  const nextCapabilityId = () => Math.max(0, ...database.fabric_capabilities.map((item: any) => Number(item.id) || 0)) + 1
  for (const definition of DEFAULT_FABRIC_CAPABILITIES.slice(0, 3)) {
    if (database.fabric_capabilities.some((item: any) => item.key === definition.key)) continue
    database.fabric_capabilities.push({ ...definition, id: nextCapabilityId(), order_index: database.fabric_capabilities.length })
  }

  const otterSeries = database.fabric_series?.find((series: any) => series.slug === 'otter')
  if (!otterSeries) return
  const otterSkus = database.fabric_sku.filter((sku: any) => sku.series_id === otterSeries.id)
  const t70 = otterSkus.find((sku: any) => /PAEL70/i.test(sku.internal_code || '')) || otterSkus.find((sku: any) => sku.sku_code === 'OT-01')
  const t50 = otterSkus.find((sku: any) => /PAEL50/i.test(sku.internal_code || '')) || otterSkus.find((sku: any) => sku.sku_code === 'OT-02')

  const updateCoreSpecs = (sku: any, face: string, weight: string) => {
    let existing: Record<string, string> = {}
    try { existing = typeof sku.specifications === 'string' ? JSON.parse(sku.specifications) : (sku.specifications || {}) } catch { existing = {} }
    const secondary = Object.fromEntries(Object.entries(existing).filter(([label]) => !['结构', '面层', '面料', '理论克重', '理论成品克重', '成品克重', '克重'].includes(label)))
    sku.specifications = JSON.stringify({ '结构': '3L Tri-layer', '面层': face, '理论克重': weight, ...secondary })
  }

  if (t70) {
    Object.assign(t70, {
      public_name: 'OTTER T70',
      product_type: '三层防护复合面料',
      features: '["durable-waterproof","high-moisture-permeability","all-weather-protection"]',
      position_performance: 7,
      position_durability: 7,
      position_handfeel: 4,
      image: t70.image || '/visuals/otter-t70-texture.png',
    })
    updateCoreSpecs(t70, '70D锦氨梭织面料', '253 g/m²')
  }
  if (t50) {
    t50.public_name = t50.public_name || 'OTTER T50'
    t50.product_type = t50.product_type || '轻量三层防护复合面料'
    t50.position_performance ??= null
    t50.position_durability ??= null
    t50.position_handfeel ??= null
    updateCoreSpecs(t50, '50D锦氨梭织面料', '183 g/m²')
  }
}

export function initDatabase() {
  if (fs.existsSync(DB_PATH)) {
    db = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'))
    if ((db.rpo_sotex_naming_version ?? 0) < 1) {
      replaceLegacyRpoName(db)
      db.rpo_sotex_naming_version = 1
      saveDb()
    }
    if ((db.brand_identity_version ?? 0) < 1) {
      replaceLegacyBrandIdentity(db)
      db.brand_identity_version = 1
      saveDb()
    }
    if ((db.product_dual_code_version ?? 0) < 1) {
      migrateProductDualCode(db)
      db.product_dual_code_version = 1
      saveDb()
    }
    if ((db.fabric_card_positioning_version ?? 0) < 1) {
      migrateFabricProductCards(db)
      db.fabric_card_positioning_version = 1
      saveDb()
    }
    const deprecatedCollections = ['fabric_scenes', 'digital_assets', 'equipment_scenes', 'about_us', 'philosophies', 'milestones', 'news']
    const deprecatedHomeFields = ['hero_features', 'scenarios', 'scenarios_section_title']
    let deprecatedDataRemoved = false
    for (const key of deprecatedCollections) {
      if (!(key in db)) continue
      delete (db as unknown as Record<string, unknown>)[key]
      deprecatedDataRemoved = true
    }
    for (const key of deprecatedHomeFields) {
      if (!(key in db.home_config)) continue
      delete db.home_config[key]
      deprecatedDataRemoved = true
    }
    db.fabric_series = db.fabric_series.map((series: any) => {
      const { sub_series_data: _subSeries, cover_image: _coverImage, ...currentSeries } = series
      if (_subSeries !== undefined || _coverImage !== undefined) deprecatedDataRemoved = true
      return currentSeries
    })
    if (deprecatedDataRemoved) saveDb()
    // Backward compatibility: ensure new fields exist
    if (!db.contact_config) {
      db.contact_config = { id: 1, email: 'contact@gangyi.tech', phone: '400-XXX-XXXX', address: '上海市', response_text: '提交表单后，我们的面料顾问将在 3 个工作日内与您取得联系' }
    }
    if (!db.fluorine_sections) db.fluorine_sections = []
    if ('fluorine_value_chain' in db) {
      delete (db as any).fluorine_value_chain
      saveDb()
    }
    if (db.fluorine_sections.length > 0 && !db.fluorine_sections[0].image_fit) {
      db.fluorine_sections = db.fluorine_sections.map((s: any) => ({ ...s, image_fit: 'cover' }))
      saveDb()
    }
    let contentSectionsChanged = false
    db.fluorine_sections
      .filter((section: any) => section.page_key === 'pfas-free-innovation')
      .forEach((section: any) => {
        if (section.nav_label === undefined) { section.nav_label = section.title; contentSectionsChanged = true }
        if (section.title === '高性能纤维' && section.nav_label === '纤维与功能整理') {
          section.nav_label = '高性能纤维'
          contentSectionsChanged = true
        }
        if (section.module_type === undefined) { section.module_type = 'rich'; contentSectionsChanged = true }
      })
    if ((db.service_sections_version ?? 0) < 1) {
      const serviceSectionDefaults = [
        { section_key: 'care', module_type: 'care', order_index: 0, nav_label: '洗涤保养', eyebrow: 'CARE', title: '洗涤与保养', subtitle: '正确清洗与保养，有助于维持材料的防护和舒适表现。' },
        { section_key: 'faq', module_type: 'faq', order_index: 1, nav_label: '常见问题', eyebrow: 'Q&A', title: '常见问题', subtitle: '' },
        { section_key: 'contact', module_type: 'contact', order_index: 2, nav_label: '联系我们', eyebrow: 'CONTACT', title: '材料建议、样品与合作咨询', subtitle: '告诉我们使用环境、目标性能和项目阶段，我们会根据已有材料或开发需求提供对应支持。' },
      ]
      for (const item of serviceSectionDefaults) {
        if (db.fluorine_sections.some((section: any) => section.page_key === 'services' && section.section_key === item.section_key)) continue
        db.fluorine_sections.push({ id: getNextId(db.fluorine_sections), page_key: 'services', content: '', image_url: null, image_fit: 'cover', ...item })
        contentSectionsChanged = true
      }
      db.service_sections_version = 1
      contentSectionsChanged = true
    }
    if (contentSectionsChanged) saveDb()
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
    if (!db.page_configs) {
      db.page_configs = [
        { id: 1, page_key: 'fabrics', page_tag: 'FABRIC DATABASE', page_title: '按使用环境，找到合适的材料', page_subtitle: '从日常与户外使用到特种专业场景，查看材料系列、具体型号与验证依据。', hero_background: null },
        { id: 2, page_key: 'equipment', page_tag: 'END USE & EQUIPMENT', page_title: '终端装备', page_subtitle: '四大品类，覆盖全场景功能需求', hero_background: null },
        { id: 3, page_key: 'pfas-free-innovation', page_tag: 'RPO MATERIAL PLATFORM', page_title: 'RPO材料平台 · 探索无氟未来', page_subtitle: '以科技创新推动可持续发展，告别 PFAS，拥抱绿色未来', hero_background: null },
        { id: 4, page_key: 'services', page_tag: 'CARE & SUPPORT', page_title: '服务与支持', page_subtitle: '从洗涤保养到常见问题，为材料使用与项目沟通提供支持。', hero_background: null },
        { id: 5, page_key: 'contact', page_tag: 'CONTACT US', page_title: '联系我们', page_subtitle: '如有材料需求或合作意向，欢迎与我们取得联系。', hero_background: null },
      ]
      saveDb()
    }
    if (!db.fabric_capabilities) {
      db.fabric_capabilities = DEFAULT_FABRIC_CAPABILITIES.map((item, index) => ({ ...item, id: index + 1, order_index: index }))
      saveDb()
    }
    db.page_configs = db.page_configs.map((page: any) => page.page_key === 'fluorine-free' ? { ...page, page_key: 'pfas-free-innovation' } : page)
    db.fluorine_sections = (db.fluorine_sections || []).map((section: any) => section.page_key === 'fluorine-free' ? { ...section, page_key: 'pfas-free-innovation' } : section)
    db.navigation = db.navigation.map((item: any) => item.link === '/fluorine-free' ? { ...item, link: '/pfas-free-innovation' } : item)
    if (db.home_config?.secondary_btn_link === '/fluorine-free') db.home_config.secondary_btn_link = '/pfas-free-innovation'
    if (db.home_config?.platform_section_link === '/fluorine-free') db.home_config.platform_section_link = '/pfas-free-innovation'
    const pageDefaults = [
      { id: 1, page_key: 'fabrics', page_tag: 'FABRIC DATABASE', page_title: '按使用环境，找到合适的材料', page_subtitle: '从日常与户外使用到特种专业场景，查看材料系列、具体型号与验证依据。', hero_background: null },
      { id: 2, page_key: 'equipment', page_tag: 'END-USE APPLICATIONS', page_title: '从面料到真实应用', page_subtitle: '查看不同装备采用的港翼面料，以及材料如何构成完整的穿着体验。', hero_background: null },
      { id: 3, page_key: 'pfas-free-innovation', page_tag: 'TECHNOLOGY INNOVATION', page_title: '技术，从材料开始', page_subtitle: '探索膜、复合、功能整理、供应链与测试验证。', hero_background: null },
      { id: 4, page_key: 'services', page_tag: 'CARE & SUPPORT', page_title: '服务与支持', page_subtitle: '从洗涤保养到常见问题，为材料使用与项目沟通提供支持。', hero_background: null },
      { id: 5, page_key: 'contact', page_tag: 'CONTACT US', page_title: '联系我们', page_subtitle: '如有材料需求或合作意向，欢迎与我们取得联系。', hero_background: null },
    ]
    for (const item of pageDefaults) if (!db.page_configs.some((page: any) => page.page_key === item.page_key)) db.page_configs.push(item)
    const fabricsPage = db.page_configs.find((page: any) => page.page_key === 'fabrics')
    if (fabricsPage?.page_title === '面料数据库' && fabricsPage?.page_subtitle === '四大核心系列，覆盖户外、运动、工装全场景') Object.assign(fabricsPage, pageDefaults[0])
    const servicesPage = db.page_configs.find((page: any) => page.page_key === 'services')
    if (servicesPage?.page_subtitle === '全方位服务体系，助力您的每一个项目') Object.assign(servicesPage, pageDefaults[3])
    const fabricsRail = db.page_configs.find((page: any) => page.page_key === 'fabrics')
    if (fabricsRail) Object.assign(fabricsRail, {
      core_performance_title: fabricsRail.core_performance_title ?? '核心性能',
      rail_end_card_visible: fabricsRail.rail_end_card_visible ?? true,
      rail_end_card_title: fabricsRail.rail_end_card_title ?? '新面料开发中',
      rail_end_card_description: fabricsRail.rail_end_card_description ?? '针对新的使用环境与性能目标持续开发。',
      rail_end_card_cta_label: fabricsRail.rail_end_card_cta_label ?? '提交需求',
      rail_end_card_cta_href: fabricsRail.rail_end_card_cta_href ?? '/contact',
    })
    const equipmentRail = db.page_configs.find((page: any) => page.page_key === 'equipment')
    if (equipmentRail) Object.assign(equipmentRail, {
      rail_end_card_visible: equipmentRail.rail_end_card_visible ?? true,
      rail_end_card_title: equipmentRail.rail_end_card_title ?? '新应用开发中',
      rail_end_card_description: equipmentRail.rail_end_card_description ?? '围绕新的任务与穿着环境持续开发。',
      rail_end_card_cta_label: equipmentRail.rail_end_card_cta_label ?? '',
      rail_end_card_cta_href: equipmentRail.rail_end_card_cta_href ?? '/contact',
    })
    db.fabric_sku = db.fabric_sku.map((item: any) => ({ ...item, card_summary: item.card_summary ?? '', public_name: item.public_name ?? '', product_type: item.product_type ?? '', position_performance: item.position_performance ?? null, position_durability: item.position_durability ?? null, position_handfeel: item.position_handfeel ?? null, visibility: item.visibility ?? 'public', status: item.status ?? 'active' }))
    db.equipment_products = db.equipment_products.map((item: any) => ({ ...item, card_summary: item.card_summary ?? '', visibility: item.visibility ?? 'public', status: item.status ?? 'active', related_sku_ids: Array.isArray(item.related_sku_ids) ? item.related_sku_ids : [] }))
    saveDb()
    if (!db.contact_messages) db.contact_messages = []
    // Backward compatibility: ensure new home_config fields exist
    if (db.home_config) {
      const homeDefaults: Record<string, any> = {
        hero_mobile_background: null,
        verification_image: null,
        platform_section_title: '技术来源与材料平台',
        platform_section_subtitle: '源自科研，成就可靠材料解决方案。',
        platform_section_link_text: '了解更多',
        platform_section_link: '/pfas-free-innovation',
        platform_cards: [
          { icon: 'Building2', title: '科研来源', subtitle: '香港科技大学（广州）科创成果转化', description: '先进材料与工程研究基础\n创新驱动，工程化商落地', footer: 'HKUST(GZ) Origin' },
          { icon: 'Atom', title: '固纳 RPO', subtitle: '固纳高性能材料平台', description: '以配方与工艺创新\n实现高性能与可持续的平衡', footer: 'SOLIDGOOD RPO' },
          { icon: 'Hexagon', title: '无氟复合体系', subtitle: 'PFAS-FREE 复合材料体系', description: '在防护、耐久与舒适之间\n达成可靠平衡', footer: 'PFAS-Free by Design' },
          { icon: 'Shirt', title: '功能织物结构设计', subtitle: '以纤维与结构设计', description: '放大材料潜能\n服务多样化应用需求', footer: 'Engineered for Performance' },
        ],
        series_section_title: '核心面料平台',
        series_section_subtitle: '面向多元应用的材料平台，让高性能更可持续。',
        series_section_link_text: '查看全部系列',
        series_section_link: '/fabrics',
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
      if (!db.home_config.verification_section_link || db.home_config.verification_section_link === '/fabrics') {
        db.home_config.verification_section_link = '/pfas-free-innovation#technology-testing-certification'
        db.home_config.verification_section_link_text = '查看测试与认证'
        homeChanged = true
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
        db.home_config.secondary_btn_link = '/pfas-free-innovation'
        homeChanged = true
      }
      if (homeChanged) saveDb()
    }
    // Backward compatibility: ensure home_image exists on fabric_series
    if (db.fabric_series && db.fabric_series.length > 0 && db.fabric_series[0].home_image === undefined) {
      db.fabric_series = db.fabric_series.map((s: any) => ({ ...s, home_image: s.home_image ?? null }))
      saveDb()
    }
    // Backward compatibility: add a separately managed transparent badge for homepage series cards.
    if (db.fabric_series && db.fabric_series.some((s: any) => s.home_badge_image === undefined)) {
      db.fabric_series = db.fabric_series.map((s: any) => ({
        ...s,
        home_badge_image: s.home_badge_image === undefined && ['otter', 'rayo', 'kais'].includes(s.slug)
          ? `/brandmarks/${s.slug}-label.svg`
          : s.home_badge_image ?? null,
      }))
      saveDb()
    }
    const otterSeries = db.fabric_series?.find((s: any) => s.slug === 'otter')
    if (otterSeries?.tagline === '新一代无氟防护 · 高性能复合') {
      otterSeries.tagline = '新一代无氟防护'
      saveDb()
    }
    // Data cleanup: replace corrupted home_image values (literal "undefined" or empty string) with null
    if (db.fabric_series && db.fabric_series.some((s: any) => s.home_image === 'undefined' || s.home_image === '')) {
      db.fabric_series = db.fabric_series.map((s: any) => ({ ...s, home_image: s.home_image && s.home_image !== 'undefined' ? s.home_image : null }))
      saveDb()
    }
    // Backward compatibility: remove Tread series/SKUs/scenes if present
    if (db.fabric_series && db.fabric_series.some((s: any) => s.slug === 'tread')) {
      const treadIds = new Set(db.fabric_series.filter((s: any) => s.slug === 'tread').map((s: any) => s.id))
      db.fabric_series = db.fabric_series.filter((s: any) => s.slug !== 'tread')
      if (db.fabric_sku) db.fabric_sku = db.fabric_sku.filter((k: any) => !treadIds.has(k.series_id))
      saveDb()
    }
    // Backward compatibility: ensure police_number / police_link exist on footer_config
    if (db.footer_config && db.footer_config.police_number === undefined) {
      db.footer_config = { ...db.footer_config, police_number: '', police_link: 'https://www.beian.gov.cn/portal/registerSystemInfo' }
      saveDb()
    }
    // Replace the original footer placeholders with the completed filing records.
    if (db.footer_config && ['ICP备案号（占位）', '', undefined].includes(db.footer_config.icp_number)) {
      db.footer_config.icp_number = '粤ICP备2026056006号-1'
      db.footer_config.icp_link = 'https://beian.miit.gov.cn/'
      saveDb()
    }
    if (db.footer_config && !db.footer_config.police_number) {
      db.footer_config.police_number = '粤公网安备44011502001610号'
      db.footer_config.police_link = 'https://beian.mps.gov.cn/#/query/webSearch?code=44011502001610'
      saveDb()
    }
    if (db.footer_config) {
      const footerDefaults = {
        brand_tag: 'GONYIK',
        brand_title: '港翼科技',
        brand_description: '专注无氟高性能面料与专业防护材料，围绕膜技术、面料复合、功能整理与测试验证，为日常户外及特种专业场景提供材料解决方案。',
        material_title: '材料与应用',
        support_title: '服务与支持',
        contact_title: '联系',
        contact_subtitle: '材料与合作咨询',
      }
      for (const [key, value] of Object.entries(footerDefaults)) {
        if (db.footer_config[key] === undefined) db.footer_config[key] = value
      }
      saveDb()
    }
    // Backward compatibility: ensure image_fit exists on equipment_categories
    if (db.equipment_categories.length > 0 && db.equipment_categories[0].image_fit === undefined) {
      db.equipment_categories = db.equipment_categories.map((c: any) => ({ ...c, image_fit: 'cover' }))
      saveDb()
    }
    // Replace the retired line-name taxonomy with the public application taxonomy.
    if (db.equipment_categories.some((c: any) => ['latent', 'u-line', 'p-line', 'a-line'].includes(c.slug))) {
      db.equipment_categories = [
        { id: 1, name: '日常休闲', slug: 'daily', description: '面向通勤与日常穿着的舒适、防风雨和轻量应用。', bg_image: null, image_fit: 'cover', order_index: 0 },
        { id: 2, name: '户外运动', slug: 'outdoor', description: '面向徒步、骑行和多变天气的功能装备应用。', bg_image: null, image_fit: 'cover', order_index: 1 },
        { id: 3, name: '特种专业', slug: 'special', description: '面向防刺与消防等明确任务的专业装备应用。', bg_image: null, image_fit: 'cover', order_index: 2 },
      ]
      const names = ['通勤防护外套', '夏季轻量外层', '风雨户外服装', '运动防晒服装', '防刺装备', '消防装备']
      db.equipment_products = db.equipment_products.slice(0, 6).map((p: any, index: number) => ({
        ...p,
        category_id: index < 2 ? 1 : index < 4 ? 2 : 3,
        name: names[index],
      }))
      const equipmentPage = db.page_configs.find((p: any) => p.page_key === 'equipment')
      if (equipmentPage) Object.assign(equipmentPage, { page_tag: 'END-USE APPLICATIONS', page_title: '从面料到真实应用', page_subtitle: '查看不同装备采用的港翼面料，以及材料如何构成完整的穿着体验。' })
      const technologyPage = db.page_configs.find((p: any) => p.page_key === 'pfas-free-innovation')
      if (technologyPage) Object.assign(technologyPage, { page_tag: 'TECHNOLOGY INNOVATION', page_title: '技术，从材料开始', page_subtitle: '探索膜、复合、功能整理、供应链与测试验证。' })
      const technologyNav = db.navigation.find((item: any) => item.link === '/pfas-free-innovation')
      if (technologyNav) technologyNav.label = '技术创新'
      saveDb()
    }
    if (db.fluorine_sections?.[0]?.title === '什么是 RPO 材料技术平台？') {
      const technologyContent = [
        { title: '膜技术', subtitle: 'RPO-SOTEX 无氟纳米膜', content: 'RPO-SOTEX 是固纳体系内的无氟纳米膜，用作特定复合面料的功能层，承担防水、透湿及相关防护作用。该技术仅关联实际采用 RPO-SOTEX 的产品。' },
        { title: '面料复合技术', subtitle: '从单层材料到复合性能', content: '通过面层、胶层、功能层和内层的协同设计，将不同材料复合成可直接用于服装与装备的完整面料。复合方式、基布选择和层间结合共同影响防护、手感、透湿与耐久。' },
        { title: '无氟染整与功能整理', subtitle: '不依赖 RPO 膜的功能面料路径', content: '用于 Rayo 等非膜结构功能面料，通过无氟防泼、导湿、速干、防晒或凉感整理，使功能直接作用于基布。具体能力以对应 SKU 和测试结果为准。' },
        { title: '供应链管理', subtitle: '让技术稳定进入产品', content: '港翼严格选择供应链合作伙伴，围绕材料来源、质量稳定性、生产能力和相关资质进行综合评估。从织物、功能材料到复合加工，我们持续管理材料规格、批次信息和工艺要求，使确认过的技术方案能够稳定进入面料并实现交付。' },
        { title: '测试与验证', subtitle: '从内部验证到独立第三方检测', content: '内部测试用于材料筛选、样品对比、耐久检查和应用适配；关键项目再由 SGS、中纺标等独立第三方机构检测。展示结果时同时标明样品、方法、条件和适用范围。' },
      ]
      db.fluorine_sections = db.fluorine_sections.slice(0, 5).map((section: any, index: number) => ({ ...section, ...technologyContent[index], order_index: index }))
      saveDb()
    }
    if ((db.technology_sections_version ?? 0) < 3) {
      const technologySections = db.fluorine_sections
        .filter((section: any) => section.page_key === 'pfas-free-innovation')
        .sort(sortByOrderIndex)

      const membraneSection = technologySections.find((section: any) => ['膜技术体系', '膜技术'].includes(section.title))
      if (membraneSection) membraneSection.title = '膜技术'

      const fiberSection = technologySections.find((section: any) => ['纤维技术体系', '无氟染整与功能整理', '纤维与功能整理'].includes(section.title))
      if (fiberSection) fiberSection.title = '纤维与功能整理'

      if (!technologySections.some((section: any) => section.title === '无氟技术体系')) {
        technologySections.unshift({
          id: getNextId(db.fluorine_sections),
          page_key: 'pfas-free-innovation',
          order_index: 0,
          title: '无氟技术体系',
          subtitle: '从材料选择，到完整产品路径',
          content: '无氟并不是对传统方案的简单删减，而是从材料选择、功能构建到成品结构的一次系统重组。港翼以无氟为重要技术方向，围绕膜材料、高性能纤维、功能整理与面料复合建立多条技术路径，根据不同使用环境组织材料与工艺，让防护、舒适、耐久与更负责任的材料选择在同一产品中取得平衡。/h这套体系贯穿研发、生产与验证。材料从实验室出发，经织造、染整与复合进入产品，再通过测试确认其在具体结构和使用条件下的实际表现。',
          image_url: null,
          image_fit: 'cover',
        })
      }

      const preferredOrder = ['无氟技术体系', '膜技术', '纤维与功能整理', '面料复合技术', '供应链管理', '测试与验证']
      technologySections.sort((a: any, b: any) => {
        const aIndex = preferredOrder.indexOf(a.title)
        const bIndex = preferredOrder.indexOf(b.title)
        if (aIndex === -1 && bIndex === -1) return a.order_index - b.order_index
        if (aIndex === -1) return 1
        if (bIndex === -1) return -1
        return aIndex - bIndex
      })
      technologySections.forEach((section: any, order_index: number) => { section.order_index = order_index })
      const otherSections = db.fluorine_sections.filter((section: any) => section.page_key !== 'pfas-free-innovation')
      db.fluorine_sections = [...otherSections, ...technologySections]
      db.technology_sections_version = 3
      saveDb()
    }
    if ((db.technology_sections_version ?? 0) < 4) {
      const technologyCopy = [
        {
          title: '无氟技术体系',
          subtitle: '从材料选择，到完整产品路径',
          content: '无氟并不是对传统方案的简单删减，而是从材料选择、功能构建到成品结构的一次系统重组。港翼以无氟为重要技术方向，围绕膜材料、高性能纤维、功能整理与面料复合建立多条技术路径，根据不同使用环境组织材料与工艺，让防护、舒适、耐久与更负责任的材料选择在同一产品中取得平衡。/h这套体系贯穿研发、生产与验证。材料从实验室出发，经织造、染整与复合进入产品，再通过测试确认其在具体结构和使用条件下的实际表现。',
        },
        {
          title: '膜技术',
          subtitle: 'RPO-SOTEX 无氟纳米膜',
          content: '真正的防护，来自一层几乎不可见的材料界面。RPO-SOTEX 是固纳面向高性能纺织应用研发的无氟纳米膜技术，被置入面料结构之中，在抵御外部雨水的同时，为人体产生的湿气保留向外传递的路径。/hRPO-SOTEX 不以一层孤立的膜材定义产品性能，而是与基布、复合结构及加工工艺协同工作，在防护与舒适之间建立平衡。它进入具体面料，并通过结构设计与测试验证发挥作用。',
        },
        {
          title: '纤维与功能整理',
          subtitle: '让功能从纤维与基布开始',
          content: '不同的功能目标，并不都需要依赖膜层。港翼通过高性能纤维、功能纱线、织物结构与无氟整理的组合，在基布阶段构建导湿、速干、防晒、凉感及专业防护等差异化能力。/h从纤维选择到织物成形，我们根据穿着环境和应用需求设计材料路径，让功能成为面料结构的一部分，并为后续复合、加工与成衣应用保留更大的设计空间。',
        },
        {
          title: '面料复合技术',
          subtitle: '让不同材料协同成为完整面料',
          content: '一块高性能面料的表现，从来不由单一材料决定。港翼围绕面层、功能层与内层进行结构设计，通过基布选择、复合方式与层间结合，让不同材料在同一套面料系统中协同工作。/h我们根据具体应用，在防护、透湿、手感、重量与耐久之间寻找合适的结构平衡，使实验室中的材料能力转化为能够被裁剪、缝制、穿着并稳定使用的完整面料。',
        },
        {
          title: '供应链管理',
          subtitle: '让技术稳定进入产品',
          content: '技术只有被稳定制造，才真正具备产品价值。港翼与具备织造、染整、复合及质量管理能力的合作伙伴协同，围绕材料来源、规格、批次与工艺要求进行持续管理，让经过确认的技术方案能够从样品开发进入稳定生产。/h在材料选择上，我们重视来源可追溯性、质量稳定性及相关环境资质。部分供应链材料可提供 bluesign®、GRS 或 OEKO-TEX® 相关认证信息，为材料选择和项目交付提供更清晰的依据。',
        },
        {
          title: '测试与验证',
          subtitle: '从研发测试到独立第三方检测',
          content: '依托固纳实验室、香港科技大学（广州）多功能高聚物薄膜中央实验室，以及合作伙伴升佳纺织的织造与染整实验室，我们围绕材料筛选、结构开发、样品对比、耐久表现与生产过程开展测试，让产品在进入市场之前经过多层验证。/h对于需要独立验证的关键性能，我们根据具体产品与项目要求，委托 SGS、中纺标 CTTC 等专业机构进行检测。相关结果对应具体样品、测试方法与适用范围，并以正式检测报告为准。',
        },
      ]

      const sections = db.fluorine_sections.filter((section: any) => section.page_key === 'pfas-free-innovation')
      technologyCopy.forEach((copy, order_index) => {
        const section = sections.find((item: any) => item.title === copy.title)
        if (section) Object.assign(section, copy, { order_index })
      })
      db.technology_sections_version = 4
      saveDb()
    }
    const technologyPage = db.page_configs?.find((page: any) => page.page_key === 'pfas-free-innovation')
    const testingSection = db.fluorine_sections?.find((section: any) => section.page_key === 'pfas-free-innovation' && section.title === '测试与验证')
    if (testingSection && testingSection.section_key !== 'testing-certification') {
      testingSection.section_key = 'testing-certification'
      saveDb()
    }
    if (technologyPage?.page_subtitle === '探索膜技术、面料复合、无氟供应链与测试验证。') {
      technologyPage.page_subtitle = '探索膜、复合、功能整理、供应链与测试验证。'
    }
    if (technologyPage?.page_subtitle === '探索膜技术、面料复合、功能整理、供应链管理与测试验证。') {
      technologyPage.page_subtitle = '探索膜、复合、功能整理、供应链与测试验证。'
    }
    const membraneSection = db.fluorine_sections?.find((section: any) => section.page_key === 'pfas-free-innovation' && section.title === '膜技术')
    if (membraneSection?.content === 'RPO-SOTEX 是固纳体系内的膜产品，用作特定复合面料的功能层，承担防水、透湿及相关防护作用。它只关联实际采用该膜的 SKU，不代表港翼全部材料技术。') {
      membraneSection.content = 'RPO-SOTEX 是固纳体系内的无氟纳米膜，用作特定复合面料的功能层，承担防水、透湿及相关防护作用。该技术仅关联实际采用 RPO-SOTEX 的产品。'
    }
    const supplyChainSection = db.fluorine_sections?.find((section: any) => section.page_key === 'pfas-free-innovation' && section.title === '材料与供应链管理')
    if (supplyChainSection?.content === '围绕膜、胶水、基布、染整、复合和批次资料进行协同管理，使材料方案能够被打样、追溯、验证和交付。官网不公开配方、供应商名单或客户机密。') {
      Object.assign(supplyChainSection, {
        title: '供应链管理',
        subtitle: '让技术稳定进入产品',
        content: '港翼严格选择供应链合作伙伴，围绕材料来源、质量稳定性、生产能力和相关资质进行综合评估。从织物、功能材料到复合加工，我们持续管理材料规格、批次信息和工艺要求，使确认过的技术方案能够稳定进入面料并实现交付。',
      })
    }
    saveDb()
    if (db.home_config?.platform_section_title === '技术来源与材料平台') {
      Object.assign(db.home_config, {
        platform_section_title: '技术，从材料开始',
        platform_section_subtitle: '围绕膜材料、复合结构与功能整理，建立能够进入真实产品的材料技术体系。',
        platform_section_link_text: '探索技术',
        platform_section_link: '/pfas-free-innovation',
        platform_cards: [
          { icon: 'Layers', title: '膜技术', subtitle: 'RPO-SOTEX 用于特定复合面料的功能层', description: '承担防水、透湿及相关防护作用', footer: 'MEMBRANE' },
          { icon: 'Hexagon', title: '面料复合', subtitle: '让面层、功能层与内层形成完整材料', description: '协同防护、手感与耐久表现', footer: 'LAMINATION' },
          { icon: 'Droplets', title: '无氟染整', subtitle: '服务 Rayo 等非膜结构功能面料', description: '实现防晒、导湿、速干等具体功能', footer: 'FINISHING' },
        ],
        series_section_title: '三条材料路径，服务不同场景',
        series_section_subtitle: 'OTTER 与 RAYO 面向日常及户外，KAIS 独立服务特种专业场景。',
        verification_section_title: '验证不是口号',
        verification_section_subtitle: '内部验证用于研发与过程控制，关键结果由独立第三方检测提供依据。',
        verification_section_link_text: '查看材料与验证信息',
        verifications: [
          { icon: 'Microscope', title: '内部测试与应用验证', subtitle: '用于材料筛选、样品对比、耐久检查和应用适配。' },
          { icon: 'Award', title: '独立第三方检测', subtitle: '由 SGS、中纺标等机构对具体样品和项目提供检测依据。' },
        ],
      })
      saveDb()
    }
    if (db.home_config?.series_section_title === '三条材料路径，服务不同场景') {
      db.home_config.series_section_title = '三大面料平台'
      db.home_config.series_section_subtitle = '蓝标 OTTER 与银标 RAYO 面向日常及户外，红标 KAIS 独立服务特种专业场景。'
      saveDb()
    }
    if (db.home_config?.verification_section_title === '验证不是口号') {
      db.home_config.verification_section_title = '测试与认证'
      saveDb()
    }
    const homeVerifications = Array.isArray(db.home_config?.verifications) ? db.home_config.verifications : []
    if (homeVerifications[0]?.title === '内部测试与应用验证') {
      Object.assign(homeVerifications[0], {
        title: '内部实验室',
        subtitle: '依托香港科技大学（广州）多功能高聚物薄膜中央实验室，开展材料筛选、结构开发、样品对比与耐久验证。',
      })
      saveDb()
    }
    if (homeVerifications[1]?.title === '独立第三方检测') {
      Object.assign(homeVerifications[1], {
        title: '第三方测试认证',
        subtitle: '根据具体产品与项目要求，委托 SGS、中纺标 CTTC 等专业机构检测，结果以正式报告为准。',
      })
      saveDb()
    }
    let publicCopyChanged = false
    if (typeof db.home_config?.hero_tag === 'string' && db.home_config.hero_tag.includes('Matertial')) {
      db.home_config.hero_tag = db.home_config.hero_tag.replace('Matertial', 'Material')
      publicCopyChanged = true
    }
    const rayoSeries = db.fabric_series?.find((series: any) => series.slug === 'rayo')
    if (rayoSeries && !String(rayoSeries.tagline || '').trim()) {
      rayoSeries.tagline = '原生防晒 · 导湿凉感'
      publicCopyChanged = true
    }
    if (publicCopyChanged) saveDb()
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
