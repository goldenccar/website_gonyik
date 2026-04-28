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
  page_configs: any[]
  navigation: any[]
  footer_config: any
  social_media: any[]
  fabric_series: any[]
  fabric_sku: any[]
  test_reports: any[]
  equipment_categories: any[]
  equipment_products: any[]
  about_us: any
  philosophies: any[]
  milestones: any[]
  news: any[]
  care_guides: any[]
  faqs: any[]
  users: any[]
}

function createDefaultDb(): Database {
  const defaultDb: Database = {
    home_config: {
      id: 1,
      hero_tag: 'TECHNOLOGY FABRIC',
      hero_title: '科技面料\n定义未来',
      hero_slogan: '以创新材料科技，重塑户外与运动的边界',
      hero_background: null,
      primary_btn_text: '探索无氟科技面料',
      primary_btn_link: '/fluorine-free',
      secondary_btn_text: '探索终端装备',
      secondary_btn_link: '/equipment',
    },
    page_configs: [
      { id: 1, page_key: 'fabrics', page_tag: 'FABRIC DATABASE', page_title: '面料数据库', page_subtitle: '四大核心系列，覆盖户外、运动、工装全场景', hero_background: null },
      { id: 2, page_key: 'equipment', page_tag: 'END USE & EQUIPMENT', page_title: '终端装备', page_subtitle: '四大品类，覆盖全场景功能需求', hero_background: null },
      { id: 3, page_key: 'fluorine-free', page_tag: 'FLUORINE FREE FUTURE', page_title: '探索无氟未来', page_subtitle: '以科技创新推动可持续发展，告别 PFAS，拥抱绿色未来', hero_background: null },
      { id: 4, page_key: 'services', page_tag: 'SERVICES & SUPPORT', page_title: '服务与支持', page_subtitle: '全方位服务体系，助力您的每一个项目', hero_background: null },
    ],
    navigation: [
      { id: 1, label: '首页', link: '/', order_index: 0 },
      { id: 2, label: '面料数据库', link: '/fabrics', order_index: 1 },
      { id: 3, label: '终端装备', link: '/equipment', order_index: 2 },
      { id: 4, label: '探索无氟未来', link: '/fluorine-free', order_index: 3 },
      { id: 5, label: '服务与支持', link: '/services', order_index: 4 },
    ],
    footer_config: {
      id: 1,
      copyright: '© 2026 港翼科技 GONYIK 版权所有',
      privacy_policy_link: '#',
      icp_number: 'ICP备案号（占位）',
      icp_link: '#',
    },
    social_media: [
      { id: 1, platform: 'wechat', account: '港翼科技GONYIK', qrcode_url: null },
      { id: 2, platform: 'xiaohongshu', account: '港翼科技GONYIK', qrcode_url: null },
      { id: 3, platform: 'douyin', account: '港翼科技GONYIK', qrcode_url: null },
    ],
    fabric_series: [
      { id: 1, name: 'Osmo', slug: 'osmo', description: '仿生防水透气系列，适用于极端户外环境', cover_image: null, order_index: 0 },
      { id: 2, name: 'Kinetic', slug: 'kinetic', description: '高弹运动系列，为动态表现而生', cover_image: null, order_index: 1 },
      { id: 3, name: 'Lumix', slug: 'lumix', description: '轻量化透光系列，科技与美学融合', cover_image: null, order_index: 2 },
      { id: 4, name: 'Tread', slug: 'tread', description: '耐磨工装系列，经久耐用', cover_image: null, order_index: 3 },
    ],
    fabric_sku: [
      { id: 1, series_id: 1, name: 'Osmo-100', sku_code: 'GY-OSMO-100', image: null, features: '["防水透气","无氟"]', specifications: '{"waterproof":"15000mm","breathable":"10000g/m²/24h","weight":"120g/m²"}', order_index: 0 },
      { id: 2, series_id: 1, name: 'Osmo-101', sku_code: 'GY-OSMO-101', image: null, features: '["防水透气","无氟"]', specifications: '{"waterproof":"20000mm","breathable":"15000g/m²/24h","weight":"150g/m²"}', order_index: 1 },
      { id: 3, series_id: 2, name: 'Kinetic-100', sku_code: 'GY-KINETIC-100', image: null, features: '["高弹","速干"]', specifications: '{"stretch":"30%","breathable":"12000g/m²/24h","weight":"100g/m²"}', order_index: 0 },
      { id: 4, series_id: 2, name: 'Kinetic-101', sku_code: 'GY-KINETIC-101', image: null, features: '["高弹","速干"]', specifications: '{"stretch":"40%","breathable":"15000g/m²/24h","weight":"110g/m²"}', order_index: 1 },
      { id: 5, series_id: 3, name: 'Lumix-100', sku_code: 'GY-LUMIX-100', image: null, features: '["轻量化","透光"]', specifications: '{"weight":"60g/m²","transparency":"15%","uv":"UPF50+"}', order_index: 0 },
      { id: 6, series_id: 3, name: 'Lumix-101', sku_code: 'GY-LUMIX-101', image: null, features: '["轻量化","透光"]', specifications: '{"weight":"70g/m²","transparency":"20%","uv":"UPF50+"}', order_index: 1 },
      { id: 7, series_id: 4, name: 'Tread-100', sku_code: 'GY-TREAD-100', image: null, features: '["耐磨","防风"]', specifications: '{"abrasion":"50000+","windproof":"100%","weight":"200g/m²"}', order_index: 0 },
      { id: 8, series_id: 4, name: 'Tread-101', sku_code: 'GY-TREAD-101', image: null, features: '["耐磨","防风"]', specifications: '{"abrasion":"80000+","windproof":"100%","weight":"220g/m²"}', order_index: 1 },
    ],
    test_reports: [],
    equipment_categories: [
      { id: 1, name: 'Latent', slug: 'latent', description: '隐形防护层，日常通勤与商务场景的低调选择', bg_image: null, order_index: 0 },
      { id: 2, name: 'U-Line', slug: 'u-line', description: '城市机能线，都市探索者的功能美学', bg_image: null, order_index: 1 },
      { id: 3, name: 'P-Line', slug: 'p-line', description: '专业性能线，为极限环境打造的旗舰装备', bg_image: null, order_index: 2 },
      { id: 4, name: 'A-Line', slug: 'a-line', description: '全天候适应线，一件应对多变气候', bg_image: null, order_index: 3 },
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
