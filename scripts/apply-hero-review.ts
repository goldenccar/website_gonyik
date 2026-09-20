import fs from 'node:fs'
import path from 'node:path'

// Explicit local content migration. Never run on startup or overwrite later CMS edits.
const directory = path.resolve('preview.local')
const file = path.join(directory, 'production-preview-db.json')
const marker = path.join(directory, 'hero-review-v2.json')
if (fs.existsSync(marker)) console.log('Hero review already applied; CMS edits preserved.')
else {
  const raw = fs.readFileSync(file, 'utf8')
  const db = JSON.parse(raw)
  const content = JSON.parse(fs.readFileSync(new URL('../files/hero-local-content.json', import.meta.url), 'utf8'))
  const backup = path.join(directory, `db-before-hero-${Date.now()}.json`)
  fs.writeFileSync(backup, raw, { flag: 'wx' })
  for (const [key, patch] of Object.entries(content.pages)) {
    const page = db.page_configs.find((p: any) => p.page_key === key)
    if (!page) throw Error(`Missing page: ${key}`)
    Object.assign(page, patch)
  }
  const platform = db.fluorine_sections.find((s: any) => s.section_key === 'rpo-material-platform')
  if (!platform) throw Error('Missing RPO platform')
  Object.assign(platform, content.platform)
  const nav = db.navigation.find((n: any) => n.link === '/equipment')
  if (nav) {
    nav.label = content.pages.equipment.page_title
    for (const group of nav.mega_menu || []) {
      group.title = nav.label
      if (group.link === '/equipment') group.description = content.pages.equipment.page_subtitle
    }
  }
  for (const item of db.navigation) {
    for (const group of item.mega_menu || []) {
      if (group.items?.length || !group.link) continue
      const page = db.page_configs.find((p: any) => ['equipment','services','contact'].includes(p.page_key) && group.link === '/' + (p.page_key === 'equipment' ? 'equipment' : p.page_key))
      if (page || group.link === '/pfas-free-innovation/rpo-material-platform') {
        group.image_source = 'page-hero'
        group.image_url = ''
      }
    }
  }
  for (const [applicationId, sampleIds] of Object.entries(content.application_samples) as [string, number[]][]) {
    const application = db.equipment_products.find((p: any) => p.id === Number(applicationId))
    if (!application) throw Error(`Missing application: ${applicationId}`)
    application.entry_type = 'application'
    application.sample_ids = sampleIds
    for (const id of sampleIds) {
      const sample = db.equipment_products.find((p: any) => p.id === id)
      if (!sample) throw Error(`Missing sample: ${id}`)
      sample.entry_type = 'sample'
      // Keep current visibility, images, wording and category/SKU relationships.
    }
  }
  db.translations.en = { ...db.translations.en, ...content.translations }
  fs.writeFileSync(file, JSON.stringify(db, null, 2))
  fs.writeFileSync(marker, JSON.stringify({ backup }, null, 2))
  console.log('Local hero and application hierarchy updated; original data backed up.')
}
