import fs from 'node:fs'
import path from 'node:path'

// Local review only. Preserve subsequent CMS edits when this script is run again.
const target = path.resolve('preview.local/production-preview-db.json')
const original = fs.readFileSync(target, 'utf8')
const database = JSON.parse(original)
if (database.series_screens_review_version >= 6) {
  console.log('Series screens already applied; CMS edits preserved.')
} else {
  const copy = [
    { slug: 'otter', story_title: '专业户外', story_intro: '用于徒步、登山等专业户外服装与装备，注重风雨防护、运动排湿和反复使用中的耐久性。', story_highlights: ['风雨防护', '高效透湿', '运动舒适', '耐磨耐用'], story_icons: ['cloud-rain', 'waves', 'feather', 'shield-check'] },
    { slug: 'rayo', story_title: '轻户外', story_intro: '日常出行、垂钓或周末户外，兼顾所需的防护、排湿和耐用性，更注重柔软手感与穿着舒适。', story_highlights: ['日常防护', '透气排湿', '柔软亲肤', '日常耐用'], story_icons: ['cloud-sun', 'waves', 'feather', 'shield-check'] },
    { slug: 'kais', story_title: '专业防护', story_intro: '面向防割、防刺需求开发柔性材料。用于防护服装、手套及需要加强防护的部位，兼顾防护与活动需要。', story_highlights: ['防割防刺', '柔性穿着'], story_icons: ['shield', 'layers'] },
  ]
  for (const [order_index, entry] of copy.entries()) {
    // This revision changes only OTTER/RAYO; retain all existing KAIS CMS edits.
    if (database.series_screens_review_version >= 5 && entry.slug === 'kais') continue
    const series = database.fabric_series.find((row: any) => row.slug === entry.slug)
    if (!series) throw Error(`Missing series: ${entry.slug}`)
    Object.assign(series, entry, { order_index })
    const defaults = {
      story_features_label: '系列特点',
      story_primary_label: '查看面料', story_primary_link: `/fabrics/catalog?series=${entry.slug}#series-${entry.slug}`,
      story_secondary_label: '咨询选材', story_secondary_link: `/contact?series=${entry.slug}&source=fabric-series`,
    }
    for (const [key, value] of Object.entries(defaults)) if (series[key] === undefined) series[key] = value
  }
  // Existing series URLs remain valid redirects; menus link directly to the new screens.
  const replaceLinks = (value: any): any => {
    if (typeof value === 'string') return value.replace(/^\/fabrics\/series\/(otter|rayo|kais)$/, '/fabrics#series-$1')
    if (Array.isArray(value)) return value.map(replaceLinks)
    if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, replaceLinks(v)]))
    return value
  }
  database.navigation = replaceLinks(database.navigation)
  database.series_screens_review_version = 6
  fs.writeFileSync(path.resolve('preview.local/db-before-series-screens-v6-20260920.json'), original, { flag: 'wx' })
  fs.writeFileSync(`${target}.tmp`, JSON.stringify(database, null, 2))
  fs.renameSync(`${target}.tmp`, target)
  console.log('Three series screens prepared in the local review database.')
}
