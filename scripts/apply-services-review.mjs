import fs from 'node:fs'
import path from 'node:path'

// Explicit, local-only content operation. Never runs during startup or deployment.
const target = path.resolve('preview.local/production-preview-db.json')
const content = JSON.parse(fs.readFileSync('files/content/services-review-20260921.json', 'utf8'))
const original = fs.readFileSync(target, 'utf8')
const db = JSON.parse(original)
for (const patch of content.sections) {
  const section = db.fluorine_sections.find(s => s.page_key === 'services' && s.module_type === patch.module_type)
  if (!section) throw new Error(`Missing service page: ${patch.module_type}`)
  Object.assign(section, patch)
}
for (const key of ['material_care_guides', 'care_guides', 'digital_fabric_formats']) db[key] = content[key]
const otherFaqs = db.faqs.filter(f => !['material-care', 'garment-care'].includes(f.category))
const ids = new Set(otherFaqs.map(f => f.id))
let nextId = Math.max(0, ...db.faqs.map(f => f.id)) + 1
db.faqs = [...otherFaqs, ...content.faqs.map(f => ({ ...f, id: ids.has(f.id) ? nextId++ : f.id }))]
if (!process.argv.includes('--apply')) {
  console.log('Local service content ready. Use --apply with the preview server stopped.')
} else {
  const backup = path.resolve(`preview.local/db-before-services-${Date.now()}.json`)
  fs.writeFileSync(backup, original)
  fs.writeFileSync(target, JSON.stringify(db, null, 2))
  console.log(`Updated local preview only. Backup: ${backup}`)
}
