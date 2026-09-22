import fs from 'node:fs'
import type { Database } from './db'

const interfaceSources: string[] = JSON.parse(fs.readFileSync(new URL('./content/interface-sources.json', import.meta.url), 'utf8'))
const excluded = new Set(['id','order_index','page_key','section_key','module_type','image_fit','url','link','href','slug','sku_code','internal_code','email','phone','status','visibility','role','image_source','smtp_host','smtp_user','smtp_pass'])

export function collectTranslatableStrings(value: unknown, output = new Set<string>(), key = ''): Set<string> {
  if (excluded.has(key) || /(?:_url|_link|_image|_background)$/.test(key)) return output
  if (typeof value === 'string') {
    const text = value.trim()
    if (text && /[\u3400-\u9fff]/.test(text) && !text.startsWith('data:')) {
      // Legacy catalog fields may contain serialized lists or objects.
      if (/^[\[{]/.test(text)) {
        try { collectTranslatableStrings(JSON.parse(text), output); return output } catch { /* ordinary text */ }
      }
      output.add(text)
    }
  } else if (Array.isArray(value)) value.forEach(item => collectTranslatableStrings(item, output, key))
  else if (value && typeof value === 'object') Object.entries(value).forEach(([childKey, child]) => collectTranslatableStrings(child, output, childKey))
  return output
}

export function publicTranslationSources(db: Database) {
  const fields = ['home_config','site_config','page_configs','navigation','footer_config','fabric_series','fabric_capabilities','fabric_sku','equipment_categories','equipment_products','material_care_guides','care_guides','faqs','digital_fabric_formats','fluorine_sections','inquiry_subjects'] as const
  const sources = new Set(interfaceSources)
  fields.forEach(key => collectTranslatableStrings(db[key], sources))
  collectTranslatableStrings({ address: db.contact_config?.address, response_text: db.contact_config?.response_text }, sources)
  return [...sources].sort((a,b) => a.localeCompare(b,'zh-CN'))
}
