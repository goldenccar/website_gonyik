export type TechnologyGroupKey = 'system' | 'material' | 'assurance'

export interface TechnologyPageDefinition {
  sectionKey: string
  group: TechnologyGroupKey
  menuLabel: string
  legacyTitles: string[]
  relatedSeries?: string
}

export interface TechnologyGroupDefinition {
  key: TechnologyGroupKey
  label: string
  pages: TechnologyPageDefinition[]
}

export const TECHNOLOGY_GROUPS: TechnologyGroupDefinition[] = [
  {
    key: 'system',
    label: 'RPO TECHNOLOGY',
    pages: [
      { sectionKey: 'rpo-material-platform', group: 'system', menuLabel: 'RPO TECHNOLOGY', legacyTitles: ['RPO 高性能材料平台', 'RPO 技术平台'] },
    ],
  },
  {
    key: 'material',
    label: '材料与工艺',
    pages: [
      { sectionKey: 'rpo-sotex-membrane', group: 'material', menuLabel: '膜技术', legacyTitles: ['高性能膜技术', '膜技术', '膜技术体系'], relatedSeries: 'otter' },
      { sectionKey: 'high-performance-fiber', group: 'material', menuLabel: '高性能纤维', legacyTitles: ['高性能纤维', '纤维技术体系'] },
      { sectionKey: 'lamination', group: 'material', menuLabel: '复合技术', legacyTitles: ['面料复合技术', '复合技术'] },
    ],
  },
  {
    key: 'assurance',
    label: '开发与验证',
    pages: [
      { sectionKey: 'supply-chain', group: 'assurance', menuLabel: '供应链', legacyTitles: ['供应链', '供应链管理', '材料与供应链管理'] },
      { sectionKey: 'testing-certification', group: 'assurance', menuLabel: '测试与认证', legacyTitles: ['测试与验证', '测试与认证'] },
    ],
  },
]

export const TECHNOLOGY_PAGES = TECHNOLOGY_GROUPS.flatMap((group) => group.pages)

export function getTechnologyPagePath(sectionKey: string) {
  return `/pfas-free-innovation/${encodeURIComponent(sectionKey)}`
}

export function findTechnologyPage(section: { section_key?: string; title?: string }) {
  return TECHNOLOGY_PAGES.find((page) => (
    page.sectionKey === section.section_key
    || page.legacyTitles.includes(String(section.title || ''))
  ))
}

export function getTechnologyGroupLabel(section: { section_key?: string; title?: string }) {
  const page = findTechnologyPage(section)
  return TECHNOLOGY_GROUPS.find((group) => group.key === page?.group)?.label || '材料科技'
}
