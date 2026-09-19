import fs from 'node:fs'
import path from 'node:path'
import express from 'express'

// Local public-content mirror. Never initialize the workspace or production database.
const directory = path.resolve('preview.local')
const source = JSON.parse(fs.readFileSync(path.join(directory, 'production-source.json'), 'utf8'))
const responses = JSON.parse(fs.readFileSync(path.join(source.directory, 'responses.json'), 'utf8'))
process.env.GONYIK_DB_PATH = path.join(directory, 'production-preview-db.json')
process.env.GONYIK_UPLOADS_DIR = path.join(directory, 'production-assets/uploads')
process.env.NODE_ENV = 'development'
process.env.DEPLOY_COMMIT = source.commit
const { createApp } = await import('../server/app')
const database = await import('../server/db')
const app = express()
app.get('/review.html', (_req, res) => res.redirect('/'))
// Public category totals include non-public records; retain the published catalog
// instead of fetching private records to reconstruct those totals locally.
app.get('/api/equipment/catalog', (req, res) => {
  const market = String(req.query.market || req.get('x-gonyik-market') || 'cn')
  res.json(responses['/api/equipment/catalog?market=' + market] || responses['/api/equipment/catalog?market=cn'])
})
app.post('/api/contact', (_req, res) => res.status(503).json({ error: '本地预览不发送咨询，请在正式官网提交。' }))
app.use('/visuals', express.static(path.join(directory, 'production-assets/visuals')))
app.use(createApp())
const { db, saveDb } = database
const marker = path.join(directory, 'production-applied.json')
if (!fs.existsSync(marker) || JSON.parse(fs.readFileSync(marker, 'utf8')).synced_at !== source.synced_at) {
  const values = Object.entries(responses) as [string, any][]
  const bootstraps = values.filter(([key]) => key.startsWith('/api/bootstrap?')).map(([, value]) => value)
  const main = bootstraps.find(value => value.current_market === 'cn') || bootstraps[0]
  const data = (endpoint: string) => values.filter(([key]) => key.startsWith(endpoint + '?')).map(([, value]) => value.data)
  const unique = (rows: any[]) => [...new Map(rows.filter(Boolean).map(row => [row.id, row])).values()]
  const catalogs = data('/api/fabrics/catalog')
  const equipment = data('/api/equipment/catalog')
  Object.assign(db, {
    home_config: main.home_config, site_config: main.site_config, navigation: main.navigation,
    footer_config: main.footer_config, social_media: main.socials, markets: main.markets,
    contact_config: { ...main.contact_config, smtp_host: '', smtp_user: '', smtp_pass: '' },
    translations: Object.fromEntries(bootstraps.map(value => [value.current_locale, value.translations])),
    page_configs: unique(['fabrics', 'equipment', 'services', 'contact', 'pfas-free-innovation'].flatMap(key => data('/api/page/' + key))),
    fabric_series: main.series,
    fabric_capabilities: unique(catalogs.flatMap(value => value.capabilities)),
    fabric_sku: unique(catalogs.flatMap(value => value.series.flatMap((series: any) => series.skus))),
    equipment_categories: unique(equipment.flatMap(value => value.categories)),
    equipment_products: unique(equipment.flatMap(value => value.products)),
    fluorine_sections: unique(['pfas-free-innovation', 'services'].flatMap(key => data('/api/content-sections/' + key).flat())),
    material_care_guides: unique(data('/api/services/material-care-guides').flat()),
    care_guides: unique(data('/api/services/care-guides').flat()),
    faqs: unique(data('/api/services/faqs').flat()),
    digital_fabric_formats: unique(data('/api/services/digital-fabric-formats').flat()),
    inquiry_subjects: unique(data('/api/inquiry-subjects').flat()),
    users: [], contact_messages: [], product_code_registry: [],
  })
  db.equipment_product_categories = db.equipment_products.flatMap(product => product.category_ids.map((category_id: number) => ({ product_id: product.id, category_id })))
  saveDb()
  fs.writeFileSync(marker, JSON.stringify({ synced_at: source.synced_at, commit: source.commit }, null, 2))
}
app.listen(5180, '127.0.0.1', () => console.log(`Production baseline ${source.commit.slice(0, 7)}: http://127.0.0.1:5180/`))
