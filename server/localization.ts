import fs from 'node:fs'
import { Converter } from 'opencc-js/cn2t'

const convert = Converter({ from: 'cn', to: 'tw' })
const cache = new Map<string, string>()

export function traditionalTranslations(sources: string[], overrides: Record<string, string> = {}) {
  // Cache individual source strings so CMS edits are reflected without a restart.
  if (cache.size > 10000) cache.clear()
  return Object.fromEntries(sources.map(source => {
    if (!cache.has(source)) cache.set(source, convert(source))
    return [source, overrides[source] || cache.get(source)!]
  }))
}

// Initial content import only. Once imported, CMS edits remain authoritative.
export function seedLocalizations(target: { localization_content_version?: number; translations: Record<string, Record<string, string>> }) {
  if ((target.localization_content_version || 0) >= 1) return false
  const content: Record<string, Record<string, string>> = JSON.parse(fs.readFileSync(new URL('./content/localizations-20260921.json', import.meta.url), 'utf8'))
  for (const [locale, entries] of Object.entries(content)) {
    target.translations[locale] ||= {}
    for (const [source, translation] of Object.entries(entries)) {
      if (!target.translations[locale][source]) target.translations[locale][source] = translation
    }
  }
  target.localization_content_version = 1
  return true
}
