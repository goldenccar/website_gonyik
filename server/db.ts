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
  product_code_registry?: { sku_code: string; internal_code: string; public_name?: string }[]
  media_items: any[]
  test_reports: any[]
  equipment_categories: any[]
  equipment_products: any[]
  material_care_guides: any[]
  care_guides: any[]
  faqs: any[]
  digital_fabric_formats: any[]
  contact_config: any
  fluorine_sections: any[]
  technology_sections_version?: number
  rpo_sotex_naming_version?: number
  brand_identity_version?: number
  product_dual_code_version?: number
  fabric_card_positioning_version?: number
  equipment_global_order_version?: number
  service_sections_version?: number
  footer_badge_version?: number
  inquiry_subjects: any[]
  contact_messages: any[]
  users: any[]
}

function createDefaultServiceFaqs() {
  return [
    { id: 1, question: 'DWR 在面料系统中负责什么？', answer: 'DWR 是面层的防泼水整理，主要减少水在表面的铺展和吸附。真正阻挡液态水的是复合结构中的功能层，以及成衣接缝和压胶系统。两者共同影响雨水环境下的穿着状态，但不能混为一谈。', category: 'material-care', order_index: 0 },
    { id: 2, question: '面层不再形成水珠，先看什么？', answer: '先观察衣物内侧是否仍然干燥。只有面层颜色变深或吸水，多数与表面污染、洗涤剂残留或 DWR 衰减有关；若内侧同时出现水迹，则应进一步检查接缝、压胶和功能层。', category: 'material-care', order_index: 1 },
    { id: 3, question: '为什么应先清洁，再考虑补充护理剂？', answer: '汗液、油脂、防晒霜和灰尘会改变面层状态，也可能影响水汽交换。未清洁就直接增加护理剂，容易把污染物留在材料表面，且难以判断性能变化的真正来源。', category: 'material-care', order_index: 2 },
    { id: 4, question: '日常洗涤真正需要避免的是什么？', answer: '风险通常不来自清洗本身，而来自不合适的化学品和处理强度，例如柔顺剂、漂白剂、强碱性产品、高温或剧烈脱水。按照成衣洗标完成正常清洁，通常比长期积累污垢更有利于维持材料状态。', category: 'material-care', order_index: 3 },
    { id: 5, question: '如何完成一次基础的面层状态检查？', answer: '先清洗、充分漂洗并彻底干燥，再在面层洒少量清水。洗标允许时，可先采用低温方式热激活；如果水仍快速铺开并被吸收，再评估是否需要补充兼容的无氟 DWR。', category: 'material-care', order_index: 4 },
    { id: 6, question: '哪些现象不适合继续自行恢复？', answer: '持续渗漏、压胶开裂、局部起泡、层间剥离或明显破损，都不属于简单的表面拒水问题。此时继续叠加护理剂意义不大，应停止处理并交由成衣品牌或材料技术人员判断。', category: 'material-care', order_index: 5 },
    { id: 7, question: '怎样让材料判断更准确？', answer: '提交咨询时，建议一并提供面料或成衣型号、生产批次、使用环境、问题位置、清晰照片，以及最近的洗涤和护理记录。这些信息有助于区分表面状态、成衣结构和材料本体问题。', category: 'material-care', order_index: 6 },
    { id: 8, question: '洗前需要完成哪些准备？', answer: '先确认成衣洗标，清空口袋，拉好前襟和口袋拉链，并固定魔术贴、襟片与调节带。若已经出现破损、开胶或明显剥离，应先处理异常，不宜直接机洗。', category: 'garment-care', order_index: 0 },
    { id: 9, question: '什么时候清洗，比洗了多少次更重要', answer: '清洗频率取决于使用强度和污染程度。出现汗液、油脂、烟尘、异味或明显污渍，或者面层比以往更容易润湿，就可以安排清洗，无需等待固定周期。', category: 'garment-care', order_index: 1 },
    { id: 10, question: '没有专用程序时怎么选？', answer: '按照洗标允许的范围，选择轻柔或化纤类程序，并适当降低脱水转速，减少过度扭转。高温、强洗和长时间浸泡不会必然带来更好的清洁效果，反而可能增加成衣结构的负担。', category: 'garment-care', order_index: 2 },
    { id: 11, question: '洗涤剂应该怎样控制？', answer: '使用少量液体中性洗涤剂或功能服装专用清洁剂即可。用量应结合水质、衣物数量和脏污程度，不宜为了增强清洁而过量添加；洗衣粉残留较难控制，也不建议使用。', category: 'garment-care', order_index: 3 },
    { id: 12, question: '可以和普通衣物一起洗吗？', answer: '可以与颜色相近、护理条件一致且污渍较轻的衣物同洗。应避开易掉毛、带尖锐五金或严重脏污的衣物，同时不要把滚筒塞得过满，给漂洗留出空间。', category: 'garment-care', order_index: 4 },
    { id: 13, question: '怎样判断漂洗是否充分？', answer: '洗后仍有明显泡沫、洗涤剂气味或滑腻感，通常说明残留较多。可使用额外漂洗功能再处理一次；充分漂洗比机械地规定漂洗次数更重要。', category: 'garment-care', order_index: 5 },
    { id: 14, question: '局部脏污需要单独处理吗？', answer: '可先在污渍处少量使用同一种液体中性洗涤剂，轻柔预处理后再正常清洗。不要用硬刷反复摩擦，也不要随意使用溶剂型去污剂或长时间浸泡。', category: 'garment-care', order_index: 6 },
    { id: 15, question: '哪些洗护产品应当避开？', answer: '除非洗标明确允许，一般不使用柔顺剂、漂白剂、强力去污剂或消毒剂。这些产品可能在表面留下附着物，或影响颜色、DWR、功能层及成衣辅料。', category: 'garment-care', order_index: 7 },
    { id: 16, question: '晾干还是烘干？', answer: '先看成衣洗标。自然晾干更温和；允许烘干时，可采用低温柔和程序帮助均匀干燥，并可能恢复部分面层拒水状态。高温并不适合所有压胶、复合结构和辅料。', category: 'garment-care', order_index: 8 },
    { id: 17, question: '低温熨烫可以代替烘干吗？', answer: '仅在洗标允许时考虑。使用低温、无蒸汽设置，并在熨斗与衣物之间垫一块干净布；印花、反光材料和压胶区域不宜长时间受热。', category: 'garment-care', order_index: 9 },
    { id: 18, question: 'DWR 的恢复顺序是什么？', answer: '先完成清洗和充分漂洗，再按洗标干燥并尝试热激活。只有在面层仍明显吸水时，才考虑补充无氟 DWR；护理剂必须与具体面料和成衣结构兼容。', category: 'garment-care', order_index: 10 },
    { id: 19, question: '喷涂式和洗入式护理剂有什么差别？', answer: '喷涂式便于把处理范围集中在外侧面层，洗入式会接触整件衣物。带吸湿内衬或多种辅料的成衣，不宜脱离品牌建议自行选择；两种方式都应遵循护理剂说明。', category: 'garment-care', order_index: 11 },
    { id: 20, question: '干洗前需要确认什么？', answer: '面料可以接触某种溶剂，不代表整件成衣适合干洗。压胶、印花、拉链和其他辅料都有独立限制；洗标没有明确允许时，不建议干洗，也不使用家庭干洗套装。', category: 'garment-care', order_index: 12 },
  ]
}

function createDefaultMaterialCareGuides() {
  return [
    { id: 1, title: '清洁是性能维护的一部分', content: '污垢、汗液、油脂和洗涤剂残留会覆盖面层并影响穿着舒适性。适时清洁不是对功能面料的额外消耗，而是日常维护的一部分。', order_index: 0 },
    { id: 2, title: '分清防泼水与防水', content: '面层的防泼水整理使水形成水珠并滚落；复合结构中的功能层负责阻挡液态水。表面开始吸水，不等于面料已经漏水。', order_index: 1 },
    { id: 3, title: '在清洁干燥后判断状态', content: '先按照成衣洗标完成清洗、充分漂洗和干燥，再观察水滴状态。若只是面层润湿，可考虑恢复防泼水；若内侧持续进水，则需要进一步排查。', order_index: 2 },
    { id: 4, title: '恢复无效时停止自行处理', content: '若按洗标允许的方式热激活或补充兼容的无氟 DWR 后仍无改善，或出现压胶开裂、复合层起泡剥离，应保留产品信息并联系品牌方或送检。', order_index: 3 },
  ]
}

function createDefaultGarmentCareGuides() {
  return [
    { id: 1, title: '查看洗标，整理外套', content: '清空口袋，拉好前襟和口袋拉链，扣合魔术贴、襟片与调节带。先检查破损和压胶状态，再按照成衣洗标选择后续护理方式。', order_index: 0 },
    { id: 2, title: '使用少量液体洗涤剂', content: '按洗标选择温和程序，使用少量液体中性洗涤剂或功能服装专用清洁剂，并充分漂洗。避免柔顺剂、漂白剂、强力去污剂及洗衣粉残留。', order_index: 1 },
    { id: 3, title: '按照洗标完成干燥', content: '可自然晾干；若洗标允许，可低温柔和烘干。避免未经确认的高温、蒸汽熨烫或干洗，以免影响压胶、功能层和辅料。', order_index: 2 },
    { id: 4, title: '检查并恢复表面拒水', content: '完全干燥后，将少量清水洒在面层观察是否形成水珠。若表面容易吸水，可先按洗标允许的方式热激活；仍无改善时，再使用兼容的无氟 DWR 并遵循产品说明。', order_index: 3 },
  ]
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
      { id: 4, page_key: 'services', page_tag: '', page_title: '服务与支持', page_subtitle: '从面料护理、成衣洗涤到数字化应用，为材料使用和产品开发提供支持。', hero_background: null },
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
      police_badge_url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACQAAAAoCAYAAACWwljjAAAFQklEQVRYw+3Wa1BUdRjH8SOpMeg4WhZGpDIxiaaTeUFgWrxE4AVRQJGlRRAVIV1JkbgMgQLi5AVBQSVLSp0xlEAUKBEEFZCrCstll8UV2AV2YbmoGCrYv31+R95UL5pmmtamZ+bz6rz5nvOc/5zDcX9jGLs/iTxuyvIlWYkRFeTHA2HVRFtzfhthTG5KuH96/vUgNlC4mMgyw1NJit/aAXLKazYje9xtIMZ/OZz50gW+9hcNkvoLEemEPbnrSP47QYwxQ5Ifv54RqzcXwFFvSyjaOhfavN8F7Y5ZcC/HH9JOB4LNa9Zw5YA76OZV8vIGMdZtSp7cDrtOnOavYiQhTAiPwi1AMtIQaqyngsxpBtw2GAGDKfaQmpUAa6xc4Vfp4UtEdzAMycsT9JQ1Tyctl/2eEkuTlYysF/rCUNxMqDEzgTqzSXBnpgnIHCzgjvEEuD52DLBr3rA1MAaWmNtB582wdtIljZ9G9D+IPU6aTxIPBjHCcXvg3CEh9K2fDLWvjIH6D6fwTIyheuwEqLUyhzLOALq8pkN+bgRw3HY4FBsMzxojZxP9DequLjAlQwVrbpIjhyIY4UYGQ/buhdBqPxlk3Gion2IMDQIz3kJe/ZS34I7uHkmD7VSQVgYDNyIAwsNCgfXGXoOBPjP9DKrOCAogA2etGTmTHAMcFwFZye7wS5QlVHGjoEw4A2qPCUBZ6AzNcQ5Q/YYRdO+YB1U3dsDwypLio4FJ3ECryIzWz6Cm3NgTRHN8HiPF6eHAGSbAdh8feFZkB7krzaHE9h2o85sDsiAbkIsXQMN+e2CtGyF0kzdwXCgU5++D/ouLQFV4OEU/g2Q/iNuIPNaKkQflAWBqexxGjhLDVUcL6IwSQN3SGVChe6FJg9dckCx6D1QBliDZLIAxo7eA8eyv4KE0BJqTrHkZvnL9DJKn+Twmt0NsGGHZy2Dn3kQYfsQ53Hh4/r4RNGz8AIpdzKEuaAF0RC2E57MmQgE3ATjuM/CPiANW7AqSfQJQ5vk362eQKmd3JrmXsoSRocpNIMnbB9zbceDIWUPmuHFQNMkISqa9DpUvNK6YDpW2s8DfwBK48WFQnhMCgzUBoLy0BrRVe5P0NWjPLdKUsJiR1tR1wGp8IeZwMgx/SrgRvjxuAziNcwLvyathLOcJHLflhRDYGRYFrNET2rJ5yvPLoas0tOj/oL8UpC4JHyTSU+6MNCS4gvKoAB5WiKG+MAQSg0WwLXQ/ZJ3xhao0FxB5hYCbUwAEfhEF3Td8QP2dAOQnPwFlxgrolUVq9TPoaX+ZB2nLc2Gk6awj1MU78HZZwJMid2Byb550JQwVO0NfxlJgdz14vWKeRAiK6DlQF28PLZdcoLNcBIO92bb6GTQ8Q/13RURT6tlH2gvXMlITLYD6uI+gp2ozdF0VQXumM6ivCqGvahM8kPiDItkeGo8tB025GFQ3xFrSr06zI3/4yde7oN7m0sWk5eKWDqK5JWJQvAHac9ygq3Adr9gTNNc3QG85rzPfHe5/7wDtPwuhp/Zz6CjyhaZzwi6ivfetHdH/oP77+3PJQOsuRnqkQdCa4wWqyx6gyecpL64GTaEX7ycXUJz4GJp1B4O0X/Hg0Xp1tFV+8Ei1k6c5coHofxBrrzQinbKYo0SVJ+wn6iurGHlY5gY911aDJnMFaHXXiDp9GQyvtKfUA9QFTtBZ7gPdit0tpFd9OpwwFmlA9D/o9yNLDpxIKmI8PMnNSNtviCLVpYTITzrXEGWaq4qos0WgOPdpCenIF+eRrurjB4k0PXopYZG6gMg/D/gNBUxhAbSAmKMAAAAASUVORK5CYII=',
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
        subtitle: '从单项替代，走向材料系统重构',
        content: 'PFAS 曾被广泛用于纺织品的防泼水、防油和防污处理。稳定的碳—氟结构使部分 PFAS 难以在环境中降解，并可能通过水体、土壤和食物链持续迁移。现有研究显示，特定 PFAS 的长期暴露与胆固醇升高、免疫反应降低、肝功能变化，以及部分生殖发育和癌症风险相关。/h港翼以 RPO-SOTEX 高性能材料平台为基础，从功能膜、高性能纤维、无氟整理、胶黏体系和复合工艺等环节重新组织材料技术路径。无氟不是对某一种含氟材料的简单替代，而是在防护、舒适、耐久和制造稳定性之间重建完整的材料系统。',
        image_url: null,
        image_fit: 'cover',
      },
      {
        id: 2,
        page_key: 'pfas-free-innovation',
        order_index: 1,
        title: '高性能膜技术',
        subtitle: '构建防水、透湿与强度兼备的功能界面',
        content: '港翼通过 RPO-SOTEX 无氟超微孔纳米膜构建连续、轻薄的功能界面。膜内相互连通的超微孔为气态水分子的扩散提供通道；面对液态水时，疏水孔隙结构与水的表面张力共同形成毛细阻力，使液体需要达到一定进入压力才能穿透膜层。/h除了防水与水汽传递能力，RPO 纳米膜本身也具有突出的物理性能。其材料结构在极低密度下仍可达到接近部分铝合金等级的拉伸强度，呈现优异的比强度、耐拉伸表现和结构稳定性，为轻量面料与高可靠防护结构提供更大的设计空间。/h膜材的最终表现还取决于孔隙分布、厚度、均匀性，以及与面层、底布和复合工艺的匹配。港翼围绕膜材制备、结构控制与应用适配持续开发，使 RPO-SOTEX 功能层能够稳定进入不同面料系统。',
        image_url: null,
        image_fit: 'cover',
      },
      {
        id: 3,
        page_key: 'pfas-free-innovation',
        order_index: 2,
        title: '高性能纤维',
        subtitle: '让纤维本身承担防护性能',
        content: '在 RPO-SOTEX 平台中，高性能纤维并不只是功能膜的支撑材料。针对高强、耐磨、轻量和专业防护需求，纤维本身可以承担载荷分散、结构增强和抗切割等核心作用，直接决定面料的基础性能边界。/h港翼根据不同应用选择纤维材料、纱线规格和织物组织，并协同织造、染整与后整理工艺，在强度、克重、手感、柔韧性和耐久性之间建立适合最终产品的结构方案。高性能纤维可以独立形成防护材料，也可以与功能膜共同构成多层系统。',
        image_url: null,
        image_fit: 'cover',
      },
      {
        id: 4,
        page_key: 'pfas-free-innovation',
        order_index: 3,
        title: '面料复合技术',
        subtitle: '面向二维功能材料开发的高可靠复合体系',
        content: 'RPO-SOTEX 二维功能材料具有轻薄、连续和界面敏感等特点，传统复合参数难以直接套用。港翼围绕其表面特性和形变方式，适配开发胶黏体系、施胶结构与层间结合工艺，使面层、功能层和底布形成稳定协同。/h从胶黏剂选择、胶点结构到温度、压力、速度和张力，港翼建立面向 RPO-SOTEX 的专用工艺窗口，并通过批次管理和过程控制维持复合一致性，在层间可靠性、透湿表现、手感和长期耐用性之间取得平衡。',
        image_url: null,
        image_fit: 'cover',
      },
      {
        id: 5,
        page_key: 'pfas-free-innovation',
        order_index: 4,
        title: '供应链管理',
        subtitle: '让技术方案稳定进入规模制造',
        content: '技术只有能够被重复制造，才具备产品价值。港翼协同原料、纺纱、织造、染整和复合环节，对材料规格、生产批次、工艺条件与质量要求进行持续管理，使研发阶段确认的方案能够稳定进入样品开发和批量生产。/h港翼将材料可追溯性、质量管理能力、环境表现和持续交付能力作为供应链选择的重要标准。核心合作伙伴具备 bluesign®、GRS、OEKO-TEX® 等与其材料和生产环节相匹配的认证与合规能力，共同建立可靠、透明且可持续的材料供应体系。',
        image_url: null,
        image_fit: 'cover',
      },
      {
        id: 6,
        page_key: 'pfas-free-innovation',
        section_key: 'testing-certification',
        order_index: 5,
        title: '测试与验证',
        subtitle: '从材料研发到第三方验证',
        content: '港翼依托固纳 RPO Lab、香港科技大学（广州）多功能高聚物薄膜中央实验室，以及合作伙伴东莞升佳的织造与染整实验条件，对原料、纤维、膜材、复合结构、工艺窗口和耐久表现开展分阶段测试。/h从实验室配方、材料小样和工艺试制，到量产批次与成品性能，港翼通过连续测试确认技术方案的稳定性。对于防水、透湿、耐磨及专业防护等关键指标，可根据项目要求委托 SGS、中纺标 CTTC 等机构进行独立检测，使材料性能建立在可重复、可验证的数据基础之上。',
        image_url: null,
        image_fit: 'cover',
      },
      {
        id: 7,
        page_key: 'services',
        section_key: 'material-care',
        module_type: 'material-care',
        order_index: 0,
        nav_label: '面料护理',
        title: '面料护理与性能判断',
        subtitle: '了解清洁、表面拒水与材料防水之间的关系，才能在性能变化时采取正确的处理方式。',
        content: '以下为功能面料的一般护理原则。具体产品仍应以面料型号、成衣洗标和整件测试结果为准。',
        image_url: null,
        image_fit: 'cover',
      },
      {
        id: 8,
        page_key: 'services',
        section_key: 'garment-care',
        module_type: 'garment-care',
        order_index: 1,
        nav_label: '成衣洗涤',
        title: '功能外套清洁与保养',
        subtitle: '正确清洗有助于去除污垢、汗液与洗涤剂残留，并维持面料的拒水、透湿和穿着舒适性。',
        content: '开始前请先查看成衣洗标。不同面料、里布、压胶和辅料可能对应不同的水温、程序与干燥条件。',
        image_url: null,
        image_fit: 'cover',
      },
      {
        id: 9,
        page_key: 'services',
        section_key: 'digital-fabrics',
        module_type: 'digital-fabrics',
        order_index: 2,
        nav_label: '数字面料',
        title: '数字面料资产',
        subtitle: '面向 CLO3D 与 Style3D 工作流，逐步建立可用于数字打样的材料文件。',
        content: '数字资产将按具体面料型号和版本交付，并同步记录视觉参数、物理属性与适用软件版本。',
        image_url: null,
        image_fit: 'cover',
      },
    ],
    technology_sections_version: 5,
    rpo_sotex_naming_version: 1,
    brand_identity_version: 1,
    product_dual_code_version: 1,
    fabric_card_positioning_version: 1,
    service_sections_version: 9,
    footer_badge_version: 1,
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
      { sku_code: 'OT-01', internal_code: 'OT3-PAEL70-V15-PES50-B', public_name: 'OTTER T70' },
      { sku_code: 'OT-02', internal_code: 'OT3-PAEL50-V20-PES30-D', public_name: 'OTTER T50' },
    ],
    test_reports: [],
    equipment_categories: [
      { id: 1, name: '日常休闲', slug: 'daily', description: '面向通勤与日常穿着的舒适、防风雨和轻量应用。', order_index: 0 },
      { id: 2, name: '户外运动', slug: 'outdoor', description: '面向徒步、骑行和多变天气的功能装备应用。', order_index: 1 },
      { id: 3, name: '特种专业', slug: 'special', description: '面向防刺与消防等明确任务的专业装备应用。', order_index: 2 },
    ],
    equipment_products: [
      { id: 1, category_id: 1, name: '通勤防护外套', image: null, features: '["日常风雨","舒适穿着","Otter"]', related_sku_ids: [1], order_index: 0 },
      { id: 2, category_id: 1, name: '夏季轻量外层', image: null, features: '["防晒","导湿","Rayo"]', related_sku_ids: [], order_index: 1 },
      { id: 3, category_id: 2, name: '风雨户外服装', image: null, features: '["防水透湿","耐用","Otter"]', related_sku_ids: [1, 2], order_index: 2 },
      { id: 4, category_id: 2, name: '运动防晒服装', image: null, features: '["轻量","导湿","Rayo"]', related_sku_ids: [], order_index: 3 },
      { id: 5, category_id: 3, name: '防刺装备', image: null, features: '["明确任务","防刺内层","Kais"]', related_sku_ids: [], order_index: 4 },
      { id: 6, category_id: 3, name: '消防装备', image: null, features: '["消防场景","专业防护","Kais"]', related_sku_ids: [], order_index: 5 },
    ],
    equipment_global_order_version: 1,
    material_care_guides: createDefaultMaterialCareGuides(),
    care_guides: createDefaultGarmentCareGuides(),
    faqs: createDefaultServiceFaqs(),
    digital_fabric_formats: [
      { id: 1, platform: 'CLO3D', format: '.zfab', description: '包含材质贴图、颜色与物理属性的 CLO 面料文件。', role: 'primary', order_index: 0 },
      { id: 2, platform: 'Style3D', format: '.sfab', description: '用于 Style3D Fabric、Studio 与云端工作流的专用面料文件。', role: 'primary', order_index: 1 },
      { id: 3, platform: '交换格式', format: '.u3ma', description: '用于跨软件协作与兼容性交付的补充格式。', role: 'exchange', order_index: 2 },
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
    public_name: sku.public_name,
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
    const deprecatedCollections = ['fabric_scenes', 'digital_assets', 'equipment_scenes', 'about_us', 'philosophies', 'milestones', 'news', 'support_resources']
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
    if (!db.digital_fabric_formats) db.digital_fabric_formats = []
    if (!db.material_care_guides) {
      db.material_care_guides = []
      saveDb()
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
        if (section.status === undefined) { section.status = 'published'; contentSectionsChanged = true }
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
    if ((db.service_sections_version ?? 0) < 2) {
      const materialCareDefaults = [
        { id: 1, title: '确认材料条件', content: '不同膜结构、复合方式、面层和后整理体系可能对应不同的护理边界，应先确认具体面料型号及版本。', order_index: 0 },
        { id: 2, title: '完成成衣验证', content: '最终洗标需结合里布、辅料、压胶、印花与成衣结构，通过整件产品测试后确定。', order_index: 1 },
        { id: 3, title: '维持功能表现', content: '适当清洁有助于减少污垢、油脂和洗涤剂残留对拒水、导湿及舒适表现的影响。', order_index: 2 },
        { id: 4, title: '判断异常来源', content: '区分面层润湿、接缝渗漏、膜层损伤与复合异常，再决定恢复处理、维修或送检。', order_index: 3 },
      ]
      if (db.material_care_guides.length === 0) db.material_care_guides = materialCareDefaults

      const garmentCareDefaults = [
        { title: '洗前准备', content: '优先查看成衣洗标。清空口袋，闭合拉链、魔术贴和调节带，并检查成衣是否存在明显破损。' },
        { title: '温和清洗', content: '按照洗标选择水温和程序，使用少量液体中性洗涤剂或功能服装专用清洁剂，并充分漂洗。' },
        { title: '正确干燥', content: '按照洗标自然晾干；若洗标允许，可采用低温柔和烘干。避免未经确认的高温处理。' },
        { title: '检查与恢复', content: '干燥后测试面层拒水状态。若水珠不能凝聚滚落，可先按洗标允许的方式热激活；仍无改善时，再使用兼容的无氟 DWR 恢复产品。' },
      ]
      garmentCareDefaults.forEach((item, order_index) => {
        const existing = db.care_guides.sort(sortByOrderIndex)[order_index]
        if (existing) Object.assign(existing, item, { order_index })
        else db.care_guides.push({ id: getNextId(db.care_guides), ...item, order_index })
      })

      const services = db.fluorine_sections.filter((section: any) => section.page_key === 'services').sort(sortByOrderIndex)
      const existingCare = services.find((section: any) => section.module_type === 'care')
      if (existingCare) Object.assign(existingCare, {
        section_key: 'garment-care',
        nav_label: '成衣洗涤',
        eyebrow: 'GARMENT CARE',
        title: '功能成衣洗涤指南',
        subtitle: '正确清洁有助于减少污垢与洗涤剂残留对面层拒水和穿着舒适性的影响。',
        content: '优先遵循成衣洗标。不同面料、辅料与成衣结构的护理条件可能不同。/h避免使用：柔顺剂、漂白剂、强力去污剂，以及未经洗标允许的干洗或高温处理。',
      })
      if (!services.some((section: any) => section.module_type === 'material-care')) {
        db.fluorine_sections.push({
          id: getNextId(db.fluorine_sections),
          page_key: 'services',
          section_key: 'material-care',
          module_type: 'material-care',
          order_index: 0,
          nav_label: '材料护理',
          eyebrow: 'MATERIAL CARE',
          title: '材料护理与洗标建议',
          subtitle: '从材料结构、成衣组合与测试结果出发，建立适合具体产品的护理条件。',
          content: '本模块提供材料层面的通用建议，不替代具体产品 TDS、成衣洗标和整件测试结果。',
          image_url: null,
          image_fit: 'cover',
          status: 'published',
        })
      }
      db.fluorine_sections
        .filter((section: any) => section.page_key === 'services')
        .sort((a: any, b: any) => {
          const rank = (item: any) => item.module_type === 'material-care' ? 0 : item.module_type === 'care' ? 1 : item.order_index + 2
          return rank(a) - rank(b)
        })
        .forEach((section: any, order_index: number) => { section.order_index = order_index })
      db.service_sections_version = 2
      contentSectionsChanged = true
    }
    if ((db.service_sections_version ?? 0) < 3) {
      const garmentCare = db.fluorine_sections.find((section: any) => section.page_key === 'services' && section.module_type === 'care')
      if (garmentCare?.content === '优先遵循成衣洗标。不同面料、辅料与成衣结构的护理条件可能不同。') {
        garmentCare.content = '优先遵循成衣洗标。不同面料、辅料与成衣结构的护理条件可能不同。/h避免使用：柔顺剂、漂白剂、强力去污剂，以及未经洗标允许的干洗或高温处理。'
      }
      db.service_sections_version = 3
      contentSectionsChanged = true
    }
    if ((db.service_sections_version ?? 0) < 4) {
      const serviceSections = db.fluorine_sections.filter((section: any) => section.page_key === 'services')
      const materialCare = serviceSections.find((section: any) => section.module_type === 'material-care')
      const garmentCare = serviceSections.find((section: any) => section.module_type === 'care' || section.module_type === 'garment-care')
      if (materialCare) Object.assign(materialCare, { section_key: 'material-care', module_type: 'material-care', order_index: 0, status: 'published' })
      if (garmentCare) Object.assign(garmentCare, { section_key: 'garment-care', module_type: 'garment-care', order_index: 1, status: 'published' })
      const digitalDefaults = {
        page_key: 'services',
        section_key: 'digital-fabrics',
        module_type: 'digital-fabrics',
        order_index: 2,
        nav_label: '数字面料',
        eyebrow: 'DIGITAL FABRIC ASSETS',
        title: '数字面料资产',
        subtitle: '面向 CLO3D 与 Style3D 工作流，逐步建立可用于数字打样的材料文件。',
        content: '数字资产将按具体面料型号和版本交付，并同步记录视觉参数、物理属性与适用软件版本。',
        image_url: null,
        image_fit: 'cover',
        status: 'published',
      }
      const digital = serviceSections.find((section: any) => section.module_type === 'digital-fabrics')
      if (digital) Object.assign(digital, digitalDefaults)
      else db.fluorine_sections.push({ id: getNextId(db.fluorine_sections), ...digitalDefaults })
      const activeTypes = new Set(['material-care', 'garment-care', 'digital-fabrics'])
      db.fluorine_sections = db.fluorine_sections.filter((section: any) => section.page_key !== 'services' || activeTypes.has(section.module_type))
      db.faqs = createDefaultServiceFaqs()
      if (db.digital_fabric_formats.length === 0) {
        db.digital_fabric_formats = [
          { id: 1, platform: 'CLO3D', format: '.zfab', description: '包含材质贴图、颜色与物理属性的 CLO 面料文件。', role: 'primary', order_index: 0 },
          { id: 2, platform: 'Style3D', format: '.sfab', description: '用于 Style3D Fabric、Studio 与云端工作流的专用面料文件。', role: 'primary', order_index: 1 },
          { id: 3, platform: '交换格式', format: '.u3ma', description: '用于跨软件协作与兼容性交付的补充格式。', role: 'exchange', order_index: 2 },
        ]
      }
      db.service_sections_version = 4
      contentSectionsChanged = true
    }
    if ((db.service_sections_version ?? 0) < 5) {
      const serviceSections = db.fluorine_sections.filter((section: any) => section.page_key === 'services')
      const materialCare = serviceSections.find((section: any) => section.module_type === 'material-care')
      const garmentCare = serviceSections.find((section: any) => section.module_type === 'garment-care')
      if (materialCare) Object.assign(materialCare, {
        nav_label: '面料护理',
        title: '面料护理与性能判断',
        subtitle: '了解清洁、表面拒水与材料防水之间的关系，才能在性能变化时采取正确的处理方式。',
        content: '以下为功能面料的一般护理原则。具体产品仍应以面料型号、成衣洗标和整件测试结果为准。',
      })
      if (garmentCare) Object.assign(garmentCare, {
        title: '功能外套清洁与保养',
        subtitle: '正确清洗有助于去除污垢、汗液与洗涤剂残留，并维持面料的拒水、透湿和穿着舒适性。',
        content: '开始前请先查看成衣洗标。不同面料、里布、压胶和辅料可能对应不同的水温、程序与干燥条件。',
      })
      serviceSections.forEach((section: any) => { delete section.eyebrow })
      db.material_care_guides = createDefaultMaterialCareGuides()
      db.care_guides = createDefaultGarmentCareGuides()
      db.faqs = createDefaultServiceFaqs()
      db.service_sections_version = 5
      contentSectionsChanged = true
    }
    if ((db.service_sections_version ?? 0) < 6) {
      const servicesPage = db.page_configs.find((page: any) => page.page_key === 'services')
      if (servicesPage) servicesPage.page_tag = ''
      db.service_sections_version = 6
      contentSectionsChanged = true
    }
    if ((db.service_sections_version ?? 0) < 7) {
      const servicesPage = db.page_configs.find((page: any) => page.page_key === 'services')
      if (servicesPage) servicesPage.page_subtitle = '从面料护理、成衣洗涤到数字化应用，为材料使用和产品开发提供支持。'
      db.service_sections_version = 7
      contentSectionsChanged = true
    }
    if ((db.service_sections_version ?? 0) < 8) {
      db.faqs = createDefaultServiceFaqs()
      db.service_sections_version = 8
      contentSectionsChanged = true
    }
    if ((db.service_sections_version ?? 0) < 9) {
      db.faqs = createDefaultServiceFaqs()
      db.service_sections_version = 9
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
        { id: 4, page_key: 'services', page_tag: '', page_title: '服务与支持', page_subtitle: '从面料护理、成衣洗涤到数字化应用，为材料使用和产品开发提供支持。', hero_background: null },
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
      { id: 4, page_key: 'services', page_tag: '', page_title: '服务与支持', page_subtitle: '从面料护理、成衣洗涤到数字化应用，为材料使用和产品开发提供支持。', hero_background: null },
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
    db.product_code_registry = (db.product_code_registry || []).map((entry: any) => ({
      ...entry,
      public_name: entry.public_name || db.fabric_sku.find((sku: any) => sku.sku_code === entry.sku_code)?.public_name || '',
    }))
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
    if ((db.footer_badge_version ?? 0) < 1 && db.footer_config) {
      db.footer_config.police_badge_url = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACQAAAAoCAYAAACWwljjAAAFQklEQVRYw+3Wa1BUdRjH8SOpMeg4WhZGpDIxiaaTeUFgWrxE4AVRQJGlRRAVIV1JkbgMgQLi5AVBQSVLSp0xlEAUKBEEFZCrCstll8UV2AV2YbmoGCrYv31+R95UL5pmmtamZ+bz6rz5nvOc/5zDcX9jGLs/iTxuyvIlWYkRFeTHA2HVRFtzfhthTG5KuH96/vUgNlC4mMgyw1NJit/aAXLKazYje9xtIMZ/OZz50gW+9hcNkvoLEemEPbnrSP47QYwxQ5Ifv54RqzcXwFFvSyjaOhfavN8F7Y5ZcC/HH9JOB4LNa9Zw5YA76OZV8vIGMdZtSp7cDrtOnOavYiQhTAiPwi1AMtIQaqyngsxpBtw2GAGDKfaQmpUAa6xc4Vfp4UtEdzAMycsT9JQ1Tyctl/2eEkuTlYysF/rCUNxMqDEzgTqzSXBnpgnIHCzgjvEEuD52DLBr3rA1MAaWmNtB582wdtIljZ9G9D+IPU6aTxIPBjHCcXvg3CEh9K2fDLWvjIH6D6fwTIyheuwEqLUyhzLOALq8pkN+bgRw3HY4FBsMzxojZxP9DequLjAlQwVrbpIjhyIY4UYGQ/buhdBqPxlk3Gion2IMDQIz3kJe/ZS34I7uHkmD7VSQVgYDNyIAwsNCgfXGXoOBPjP9DKrOCAogA2etGTmTHAMcFwFZye7wS5QlVHGjoEw4A2qPCUBZ6AzNcQ5Q/YYRdO+YB1U3dsDwypLio4FJ3ECryIzWz6Cm3NgTRHN8HiPF6eHAGSbAdh8feFZkB7krzaHE9h2o85sDsiAbkIsXQMN+e2CtGyF0kzdwXCgU5++D/ouLQFV4OEU/g2Q/iNuIPNaKkQflAWBqexxGjhLDVUcL6IwSQN3SGVChe6FJg9dckCx6D1QBliDZLIAxo7eA8eyv4KE0BJqTrHkZvnL9DJKn+Twmt0NsGGHZy2Dn3kQYfsQ53Hh4/r4RNGz8AIpdzKEuaAF0RC2E57MmQgE3ATjuM/CPiANW7AqSfQJQ5vk362eQKmd3JrmXsoSRocpNIMnbB9zbceDIWUPmuHFQNMkISqa9DpUvNK6YDpW2s8DfwBK48WFQnhMCgzUBoLy0BrRVe5P0NWjPLdKUsJiR1tR1wGp8IeZwMgx/SrgRvjxuAziNcwLvyathLOcJHLflhRDYGRYFrNET2rJ5yvPLoas0tOj/oL8UpC4JHyTSU+6MNCS4gvKoAB5WiKG+MAQSg0WwLXQ/ZJ3xhao0FxB5hYCbUwAEfhEF3Td8QP2dAOQnPwFlxgrolUVq9TPoaX+ZB2nLc2Gk6awj1MU78HZZwJMid2Byb550JQwVO0NfxlJgdz14vWKeRAiK6DlQF28PLZdcoLNcBIO92bb6GTQ8Q/13RURT6tlH2gvXMlITLYD6uI+gp2ozdF0VQXumM6ivCqGvahM8kPiDItkeGo8tB025GFQ3xFrSr06zI3/4yde7oN7m0sWk5eKWDqK5JWJQvAHac9ygq3Adr9gTNNc3QG85rzPfHe5/7wDtPwuhp/Zz6CjyhaZzwi6ivfetHdH/oP77+3PJQOsuRnqkQdCa4wWqyx6gyecpL64GTaEX7ycXUJz4GJp1B4O0X/Hg0Xp1tFV+8Ei1k6c5coHofxBrrzQinbKYo0SVJ+wn6iurGHlY5gY911aDJnMFaHXXiDp9GQyvtKfUA9QFTtBZ7gPdit0tpFd9OpwwFmlA9D/o9yNLDpxIKmI8PMnNSNtviCLVpYTITzrXEGWaq4qos0WgOPdpCenIF+eRrurjB4k0PXopYZG6gMg/D/gNBUxhAbSAmKMAAAAASUVORK5CYII='
      db.footer_config.police_link = 'https://beian.mps.gov.cn/#/query/webSearch?code=44011502001610'
      db.footer_badge_version = 1
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
        police_badge_url: null,
      }
      for (const [key, value] of Object.entries(footerDefaults)) {
        if (db.footer_config[key] === undefined) db.footer_config[key] = value
      }
      saveDb()
    }
    db.equipment_categories = db.equipment_categories.map(({ bg_image: _bgImage, image_fit: _imageFit, ...category }: any) => category)
    // Replace the retired line-name taxonomy with the public application taxonomy.
    if (db.equipment_categories.some((c: any) => ['latent', 'u-line', 'p-line', 'a-line'].includes(c.slug))) {
      db.equipment_categories = [
        { id: 1, name: '日常休闲', slug: 'daily', description: '面向通勤与日常穿着的舒适、防风雨和轻量应用。', order_index: 0 },
        { id: 2, name: '户外运动', slug: 'outdoor', description: '面向徒步、骑行和多变天气的功能装备应用。', order_index: 1 },
        { id: 3, name: '特种专业', slug: 'special', description: '面向防刺与消防等明确任务的专业装备应用。', order_index: 2 },
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
    if ((db.technology_sections_version ?? 0) < 5) {
      const technologyCopy = [
        {
          title: '无氟技术体系',
          subtitle: '从单项替代，走向材料系统重构',
          content: 'PFAS 曾被广泛用于纺织品的防泼水、防油和防污处理。稳定的碳—氟结构使部分 PFAS 难以在环境中降解，并可能通过水体、土壤和食物链持续迁移。现有研究显示，特定 PFAS 的长期暴露与胆固醇升高、免疫反应降低、肝功能变化，以及部分生殖发育和癌症风险相关。/h港翼以 RPO-SOTEX 高性能材料平台为基础，从功能膜、高性能纤维、无氟整理、胶黏体系和复合工艺等环节重新组织材料技术路径。无氟不是对某一种含氟材料的简单替代，而是在防护、舒适、耐久和制造稳定性之间重建完整的材料系统。',
        },
        {
          title: '高性能膜技术',
          subtitle: '构建防水、透湿与强度兼备的功能界面',
          content: '港翼通过 RPO-SOTEX 无氟超微孔纳米膜构建连续、轻薄的功能界面。膜内相互连通的超微孔为气态水分子的扩散提供通道；面对液态水时，疏水孔隙结构与水的表面张力共同形成毛细阻力，使液体需要达到一定进入压力才能穿透膜层。/h除了防水与水汽传递能力，RPO 纳米膜本身也具有突出的物理性能。其材料结构在极低密度下仍可达到接近部分铝合金等级的拉伸强度，呈现优异的比强度、耐拉伸表现和结构稳定性，为轻量面料与高可靠防护结构提供更大的设计空间。/h膜材的最终表现还取决于孔隙分布、厚度、均匀性，以及与面层、底布和复合工艺的匹配。港翼围绕膜材制备、结构控制与应用适配持续开发，使 RPO-SOTEX 功能层能够稳定进入不同面料系统。',
        },
        {
          title: '高性能纤维',
          subtitle: '让纤维本身承担防护性能',
          content: '在 RPO-SOTEX 平台中，高性能纤维并不只是功能膜的支撑材料。针对高强、耐磨、轻量和专业防护需求，纤维本身可以承担载荷分散、结构增强和抗切割等核心作用，直接决定面料的基础性能边界。/h港翼根据不同应用选择纤维材料、纱线规格和织物组织，并协同织造、染整与后整理工艺，在强度、克重、手感、柔韧性和耐久性之间建立适合最终产品的结构方案。高性能纤维可以独立形成防护材料，也可以与功能膜共同构成多层系统。',
        },
        {
          title: '面料复合技术',
          subtitle: '面向二维功能材料开发的高可靠复合体系',
          content: 'RPO-SOTEX 二维功能材料具有轻薄、连续和界面敏感等特点，传统复合参数难以直接套用。港翼围绕其表面特性和形变方式，适配开发胶黏体系、施胶结构与层间结合工艺，使面层、功能层和底布形成稳定协同。/h从胶黏剂选择、胶点结构到温度、压力、速度和张力，港翼建立面向 RPO-SOTEX 的专用工艺窗口，并通过批次管理和过程控制维持复合一致性，在层间可靠性、透湿表现、手感和长期耐用性之间取得平衡。',
        },
        {
          title: '供应链管理',
          subtitle: '让技术方案稳定进入规模制造',
          content: '技术只有能够被重复制造，才具备产品价值。港翼协同原料、纺纱、织造、染整和复合环节，对材料规格、生产批次、工艺条件与质量要求进行持续管理，使研发阶段确认的方案能够稳定进入样品开发和批量生产。/h港翼将材料可追溯性、质量管理能力、环境表现和持续交付能力作为供应链选择的重要标准。核心合作伙伴具备 bluesign®、GRS、OEKO-TEX® 等与其材料和生产环节相匹配的认证与合规能力，共同建立可靠、透明且可持续的材料供应体系。',
        },
        {
          title: '测试与验证',
          subtitle: '从材料研发到第三方验证',
          content: '港翼依托固纳 RPO Lab、香港科技大学（广州）多功能高聚物薄膜中央实验室，以及合作伙伴东莞升佳的织造与染整实验条件，对原料、纤维、膜材、复合结构、工艺窗口和耐久表现开展分阶段测试。/h从实验室配方、材料小样和工艺试制，到量产批次与成品性能，港翼通过连续测试确认技术方案的稳定性。对于防水、透湿、耐磨及专业防护等关键指标，可根据项目要求委托 SGS、中纺标 CTTC 等机构进行独立检测，使材料性能建立在可重复、可验证的数据基础之上。',
        },
      ]

      const sections = db.fluorine_sections
        .filter((section: any) => section.page_key === 'pfas-free-innovation')
        .sort(sortByOrderIndex)
      technologyCopy.forEach((copy, order_index) => {
        const section = sections[order_index]
        if (section) Object.assign(section, copy, { nav_label: copy.title, order_index })
      })
      const technologyPage = db.page_configs.find((page: any) => page.page_key === 'pfas-free-innovation')
      if (technologyPage) technologyPage.page_subtitle = '围绕功能膜、纤维、复合工艺与测试验证，建立从材料研发到稳定制造的完整技术路径。'
      db.technology_sections_version = 5
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
      db.home_config.series_section_subtitle = '蓝标 OTTER 与银标 RAYO 面向日常及户外，黑标 KAIS 独立服务特种专业场景。'
      saveDb()
    }
    if (db.home_config?.series_section_subtitle === '蓝标 OTTER 与银标 RAYO 面向日常及户外，红标 KAIS 独立服务特种专业场景。') {
      db.home_config.series_section_subtitle = '蓝标 OTTER 与银标 RAYO 面向日常及户外，黑标 KAIS 独立服务特种专业场景。'
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
    if ((db.equipment_global_order_version ?? 0) < 1) {
      const categoryOrder = new Map([...db.equipment_categories].sort(sortByOrderIndex).map((category: any, index: number) => [category.id, index]))
      db.equipment_products
        .sort((a: any, b: any) => (categoryOrder.get(a.category_id) ?? 999) - (categoryOrder.get(b.category_id) ?? 999) || sortByOrderIndex(a, b) || a.id - b.id)
        .forEach((product: any, index: number) => { product.order_index = index })
      db.equipment_global_order_version = 1
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
