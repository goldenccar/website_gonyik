import fs from 'node:fs'
import path from 'node:path'

// Local-only editorial operation. Stop the preview server before applying.
const target = path.resolve('preview.local/production-preview-db.json')
const original = fs.readFileSync(target, 'utf8')
const db = JSON.parse(original)
if (db.multilingual_lamination_review_version === 1) {
  console.log('Already applied; subsequent CMS edits preserved.')
  process.exit(0)
}
const patch = JSON.parse(fs.readFileSync('files/content/lamination-review-20260921.json', 'utf8'))
const section = db.fluorine_sections.find(s => s.page_key === 'pfas-free-innovation' && s.section_key === patch.section_key)
if (!section) throw new Error('Lamination page not found')
Object.assign(section, patch)
const translations = JSON.parse(fs.readFileSync('server/content/localizations-20260921.json', 'utf8'))
for (const locale of ['en', 'zh-TW']) db.translations[locale] = { ...db.translations[locale], ...translations[locale] }
db.localization_content_version = 1
db.multilingual_lamination_review_version = 1
if (process.argv.includes('--apply')) {
  fs.writeFileSync(path.resolve(`preview.local/db-before-localizations-${Date.now()}.json`), original)
  fs.writeFileSync(target, JSON.stringify(db, null, 2))
  console.log('Updated local CMS translations and lamination page. Production unchanged.')
} else console.log('Ready. Run with --apply while the local preview is stopped.')
