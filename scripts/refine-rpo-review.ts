import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { RPO_CONTENT } from '../src/config/rpoContent'

// Apply once to the local review copy; subsequent CMS edits are retained.
export function refineRpoReview(database: any) {
  if ((database.rpo_review_version || 0) >= 4) return false
  for (const key of ['lamination', 'supply-chain', 'testing-certification']) {
    const section = database.fluorine_sections.find((s: any) => s.section_key === key && s.page_key === 'pfas-free-innovation')
    if (!section) throw Error(`Missing technology section: ${key}`)
    Object.assign(section, structuredClone(RPO_CONTENT[key]))
  }
  const features: Record<string, { title: string; description: string; image_url: string }> = {
    '/fabrics': { title: '面料系列', description: '从户外穿着到专业防护，按使用需求了解面料。', image_url: '/uploads/1783870881229-286570534.jpg' },
    '/equipment': { title: '产品应用', description: '从面料到成品，了解材料在不同产品中的应用。', image_url: '/uploads/1783959932963-982327398.jpg' },
    '/services': { title: '专业支持', description: '材料选用、数字打样与使用养护。', image_url: '/uploads/1783877676932-234722141.jpg' },
  }
  const descriptions: Record<string, string> = {
    '/fabrics/series/otter': '防水透湿', '/fabrics/series/rayo': '防晒与轻户外', '/fabrics/series/kais': '专业防护',
    '/services/material-care': '材料选择与性能信息', '/services/garment-care': '清洁、使用与保养', '/services/digital-fabrics': '面料数字化与产品开发',
  }
  for (const nav of database.navigation) {
    const feature = features[nav.link]
    if (!feature) continue
    const groups = nav.mega_menu || []
    nav.mega_menu = [
      { id: `overview-${nav.id}`, ...feature, link: nav.link, order_index: 0, items: [] },
      ...groups.map((group: any, index: number) => ({ ...group, order_index: index + 1, items: group.items.map((item: any) => ({ ...item, ...(descriptions[item.link] ? { description: descriptions[item.link] } : {}) })) })),
    ]
  }
  database.rpo_review_version = 4
  return true
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const target = path.resolve('preview.local/production-preview-db.json')
  const original = fs.readFileSync(target, 'utf8')
  const database = JSON.parse(original)
  if (refineRpoReview(database)) {
    fs.writeFileSync(path.resolve('preview.local/db-before-rpo-editorial-20260919.json'), original, { flag: 'wx' })
    fs.writeFileSync(`${target}.tmp`, JSON.stringify(database, null, 2))
    fs.renameSync(`${target}.tmp`, target)
    console.log('Local review pages and navigation updated. Production untouched.')
  } else console.log('Review already applied; CMS edits preserved.')
}
