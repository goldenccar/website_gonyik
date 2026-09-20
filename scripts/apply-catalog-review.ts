import fs from 'node:fs'
import path from 'node:path'

// Explicit local review migration; never run at startup or replace later CMS edits.
const root = path.resolve('preview.local')
const file = path.join(root, 'production-preview-db.json')
const marker = path.join(root, 'catalog-review-v2.json')
if (fs.existsSync(marker)) console.log('Catalog review already applied; CMS edits preserved.')
else {
  const raw = fs.readFileSync(file, 'utf8')
  const db = JSON.parse(raw)
  const content = JSON.parse(fs.readFileSync(new URL('../files/catalog-local-content.json', import.meta.url), 'utf8'))
  const page = db.page_configs.find((p: any) => p.page_key === 'fabrics')
  const nav = db.navigation.find((n: any) => n.link === '/fabrics')
  if (!page || !nav) throw Error('Missing catalog page or fabric navigation')
  for (const name of Object.keys(content.skus)) {
    if (!db.fabric_sku.some((sku: any) => sku.public_name === name)) throw Error('Missing SKU: ' + name)
  }
  const backup = path.join(root, 'db-before-catalog-' + Date.now() + '.json')
  fs.writeFileSync(backup, raw, { flag: 'wx' })
  Object.assign(page, content.page)
  for (const sku of db.fabric_sku) {
    if (content.skus[sku.public_name]) Object.assign(sku, content.skus[sku.public_name])
  }
  const seriesGroup = nav.mega_menu.find((g: any) => g.items?.length)
  nav.mega_menu = [{
    id: 'fabric-catalog-entry', title: '面料数据库',
    description: '浏览具体型号，比较功能特点与选材方向。',
    link: '/fabrics/catalog', image_source: 'page-hero', image_url: '', order_index: 0, items: [],
  }, ...(seriesGroup ? [{...seriesGroup, title: '面料系列', link: '/fabrics', order_index: 1}] : [])]
  fs.writeFileSync(file, JSON.stringify(db, null, 2))
  fs.writeFileSync(marker, JSON.stringify({ backup, appliedAt: new Date().toISOString() }, null, 2))
  console.log('Local catalog content updated; backup saved.')
}