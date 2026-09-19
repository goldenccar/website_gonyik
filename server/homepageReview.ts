// One-time approved homepage copy update; leaves all other CMS data intact.
const APPROVED_HOME = {
  "hero_slogan": "港翼专注功能性面料开发，为户外穿着与专业防护提供材料选择。",
  "series_section_title": "面料系列",
  "series_entries": {
    "otter": {
      "title": "防水透湿",
      "description": "适用于冲锋衣、雨衣等户外服装。"
    },
    "rayo": {
      "title": "防晒与日常户外",
      "description": "适用于防晒衣、垂钓披风及轻户外服装。"
    },
    "kais": {
      "title": "专业防护",
      "description": "用于防护服装、手套及其他需要加强防护的部位。"
    }
  },
  "platform_section_subtitle": "港翼将 RPO 膜技术与织物结构、复合工艺结合，开发可用于实际产品的功能面料。",
  "verification_section_title": "测试与验证",
  "verification_section_subtitle": "从材料筛选到成品面料，结合内部测试与第三方检测，验证具体样品的性能。",
  "verification_section_link_text": "了解测试与验证",
  "verification_section_link": "/pfas-free-innovation/testing-certification"
}
const CARD_SUBTITLES = [
  "以 RPO-SOTEX 功能膜实现防水透湿。",
  "通过复合工艺，协调面层、功能层与内层的表现。",
  "衔接材料、工艺、制造与交付。"
]

export function applyHomepageReview(database: { home_config: any; homepage_review_version?: number }) {
  if ((database.homepage_review_version || 0) >= 1) return false
  Object.assign(database.home_config, APPROVED_HOME, { series_entries: structuredClone(APPROVED_HOME.series_entries) })
  database.home_config.platform_cards = (database.home_config.platform_cards || []).map((card: any, index: number) => ({ ...card, subtitle: CARD_SUBTITLES[index] ?? card.subtitle }))
  database.homepage_review_version = 1
  return true
}
