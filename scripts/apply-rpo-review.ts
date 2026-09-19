import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { RPO_CONTENT, RPO_LABELS } from '../src/config/rpoContent'
import { TECHNOLOGY_GROUPS, TECHNOLOGY_PAGES, getTechnologyPagePath } from '../src/config/technologyPages'

export function applyRpoReview(database: {
  rpo_review_version?: number
  fluorine_sections: any[]
  navigation: any[]
  home_config: Record<string, any>
}) {
  if ((database.rpo_review_version || 0) >= 3) return false
  for (const [index, page] of TECHNOLOGY_PAGES.entries()) {
    const section = database.fluorine_sections.find(item => item.page_key === 'pfas-free-innovation' && item.section_key === page.sectionKey)
    if (!section) throw new Error(`Missing production section: ${page.sectionKey}`)
    Object.assign(section, structuredClone(RPO_CONTENT[page.sectionKey]), {
      module_type: 'rpo-platform-v1', nav_label: page.menuLabel, order_index: index,
      hero_statement: '',
    })
  }
  const old = database.fluorine_sections.find(item => item.page_key === 'pfas-free-innovation' && item.section_key === 'pfas-free-system')
  if (old) old.status = 'draft' // Keep original content recoverable; the old public URL redirects.
  const nav = database.navigation.find(item => item.link === '/pfas-free-innovation')
  const descriptions: Record<string, string> = {
    'rpo-sotex-membrane': '防水与透湿', 'high-performance-fiber': '纤维配方与织物结构',
    lamination: '材料搭配与复合工艺', 'supply-chain': '开发与生产', 'testing-certification': '性能测试与第三方检测',
  }
  if (nav) {
    nav.label = 'RPO-Tech'
    nav.mega_menu = TECHNOLOGY_GROUPS.map((group, index) => ({
    id: `rpo-${group.key}`, title: group.label, order_index: index,
    ...(group.key === 'system' ? { link: getTechnologyPagePath('rpo-material-platform'), description: '膜、纤维与复合技术，以及供应链和测试。', image_url: '/visuals/technology-fiber-material-v1.webp' } : {}),
    items: group.key === 'system' ? [] : group.pages.map((page, order) => ({
      id: `rpo-${page.sectionKey}`, label: page.menuLabel, link: getTechnologyPagePath(page.sectionKey), order_index: order, description: descriptions[page.sectionKey],
    })),
    }))
  }
  database.home_config.platform_section_link_text = RPO_LABELS.platform
  database.home_config.platform_section_link = getTechnologyPagePath('rpo-material-platform')
  database.rpo_review_version = 3
  return true
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  // Explicitly local: never use GONYIK_DB_PATH or open the workspace/production db.
  const target = path.resolve('preview.local/production-preview-db.json')
  const original = fs.readFileSync(target, 'utf8')
  const database = JSON.parse(original)
  if (applyRpoReview(database)) {
    const backup = path.resolve('preview.local/db-before-rpo-cms-20260919.json')
    fs.writeFileSync(backup, original, { flag: 'wx' })
    fs.writeFileSync(`${target}.tmp`, JSON.stringify(database, null, 2))
    fs.renameSync(`${target}.tmp`, target)
    console.log('RPO review applied to the local public-content mirror. Original saved in preview.local.')
  } else console.log('RPO review already applied; subsequent CMS edits preserved.')
}
