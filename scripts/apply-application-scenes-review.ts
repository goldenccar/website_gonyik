import fs from 'node:fs'
import path from 'node:path'

const directory = path.resolve('preview.local')
const file = path.join(directory, 'production-preview-db.json')
const marker = path.join(directory, 'application-scenes-review-v1.json')
if (fs.existsSync(marker)) console.log('Already applied; CMS edits preserved.')
else {
  const raw = fs.readFileSync(file, 'utf8')
  const db = JSON.parse(raw)
  const content = JSON.parse(fs.readFileSync(new URL('../files/application-scenes-local-content.json', import.meta.url), 'utf8'))
  const feature = db.navigation.find((item: any) => item.link === '/fabrics')?.mega_menu?.[0]
  if (!feature) throw Error('Missing fabric menu entrance')
  for (const [id, values] of Object.entries(content.applications)) {
    const application = db.equipment_products.find((item: any) => item.id === Number(id) && item.entry_type !== 'sample')
    if (!application) throw Error('Missing application ' + id)
    Object.assign(application, values)
  }
  Object.assign(feature, content.fabric_entry)
  const backup = path.join(directory, 'db-before-application-scenes-' + Date.now() + '.json')
  fs.writeFileSync(backup, raw, { flag: 'wx' })
  fs.writeFileSync(file, JSON.stringify(db, null, 2))
  fs.writeFileSync(marker, JSON.stringify({ backup, appliedAt: new Date().toISOString() }, null, 2))
  console.log('Local scenes and menu updated; original data backed up.')
}
