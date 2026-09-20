import fs from 'node:fs'
import path from 'node:path'

// One-time local review only. No runtime fallback and no writes to production db.json.
const directory = path.resolve('preview.local')
const file = path.join(directory, 'production-preview-db.json')
const marker = path.join(directory, 'applications-review-v2.json')
if (fs.existsSync(marker)) { console.log('Application review already applied; later CMS edits preserved.') }
else {
  const original = fs.readFileSync(file, 'utf8')
  const db = JSON.parse(original)
  const previousMarker = path.join(directory, 'applications-review-v1.json')
  const previousIds: number[] = fs.existsSync(previousMarker) ? JSON.parse(fs.readFileSync(previousMarker, 'utf8')).ids : []
  const content = JSON.parse(fs.readFileSync(new URL('../files/applications-local-content.json', import.meta.url), 'utf8').replace(/^\uFEFF/, ''))
  const page = db.page_configs.find((p: any) => p.page_key === 'equipment')
  if (!page) throw Error('Application page missing')
  const root = db.equipment_categories.find((c: any) => c.parent_id == null && c.visibility !== 'hidden')
  if (!root) throw Error('Public application category missing')
  const backup = path.join(directory, `db-before-applications-${Date.now()}.json`)
  fs.writeFileSync(backup, original, { flag: 'wx' })
  Object.assign(page, content.page)
  db.translations.en = { ...db.translations.en, ...content.translations }
  if (!previousIds.length) db.equipment_products.forEach((p: any) => { p.visibility = 'hidden' })
  let id = Math.max(0, ...db.equipment_products.map((p: any) => p.id))
  const added = content.products.map((entry: any, order_index: number) => {
    const { series_slugs, features, previous_index, ...fields } = entry
    const existing = previous_index === undefined ? undefined : db.equipment_products.find((p: any) => p.id === previousIds[previous_index])
    const row = { ...existing, ...fields, id: existing?.id ?? ++id, order_index, features: JSON.stringify(features), related_series_ids: series_slugs.map((slug: string) => {
      const series = db.fabric_series.find((s: any) => s.slug === slug)
      if (!series) throw Error(`Missing series ${slug}`)
      return series.id
    }), related_sku_ids: [], material_platforms: [], status: 'active', visibility: 'public', market_visibility: {},
    cta_href: `/contact?application=${encodeURIComponent(entry.name)}&source=applications` }
    if (existing) Object.assign(existing, row)
    else {
      db.equipment_products.push(row)
      db.equipment_product_categories.push({ product_id: row.id, category_id: root.id })
    }
    return row
  })
  const nav = db.navigation.find((n: any) => n.link === '/equipment')
  if (nav) nav.mega_menu = [
    { id: 'applications-overview', title: content.page.page_title, description: content.page.page_subtitle, image_url: added[0].image, link: '/equipment', order_index: 0, items: [] },
    { id: 'applications-directions', title: content.page.page_title, order_index: 1, items: added.map((p: any) => ({ id: `application-${p.id}`, label: p.name, description: p.case_label, link: `/equipment#application-${p.id}`, order_index: p.order_index })) },
  ]
  fs.writeFileSync(file, JSON.stringify(db, null, 2))
  fs.writeFileSync(marker, JSON.stringify({ backup, ids: added.map((p: any) => p.id) }, null, 2))
  console.log(`Applied ${added.length} local application entries; original records and relations retained. Backup: ${backup}`)
}
