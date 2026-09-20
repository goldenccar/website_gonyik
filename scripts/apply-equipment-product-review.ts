import fs from 'node:fs'
import path from 'node:path'
const root = path.resolve('preview.local')
const file = path.join(root, 'production-preview-db.json')
const marker = path.join(root, 'equipment-product-review-v1.json')
if (fs.existsSync(marker)) console.log('Already applied; CMS edits preserved.')
else {
  const raw = fs.readFileSync(file, 'utf8')
  const db = JSON.parse(raw)
  const content = JSON.parse(fs.readFileSync(new URL('../files/equipment-product-local-content.json', import.meta.url), 'utf8'))
  for (const id of Object.keys(content)) {
    if (!db.equipment_products.some((p:any)=>p.id===Number(id)&&p.entry_type==='sample')) throw Error('Missing sample '+id)
  }
  const backup = path.join(root,'db-before-product-detail-'+Date.now()+'.json')
  fs.writeFileSync(backup,raw,{flag:'wx'})
  for (const product of db.equipment_products) {
    if (content[String(product.id)]) Object.assign(product,content[String(product.id)])
  }
  fs.writeFileSync(file,JSON.stringify(db,null,2))
  fs.writeFileSync(marker,JSON.stringify({backup,appliedAt:new Date().toISOString()},null,2))
  console.log('Seven local products enabled; backup saved.')
}