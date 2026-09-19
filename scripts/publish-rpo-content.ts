import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { isDeepStrictEqual } from 'node:util'

type Change = { collection: string; id?: number; field: string; before?: unknown; after?: unknown }
export function applyReviewedRpoContent(database: any, changes: Change[]) {
  const next = structuredClone(database)
  for (const change of changes) {
    if (!['home_config', 'navigation', 'fluorine_sections', 'fabric_series', 'translations'].includes(change.collection)) throw Error('Unexpected content collection')
    const target = change.id === undefined ? next[change.collection] : next[change.collection].find((row: any) => row.id === change.id)
    if (!target || ['__proto__', 'prototype', 'constructor'].includes(change.field)) throw Error('Invalid content target')
    if (isDeepStrictEqual(target[change.field], change.after)) continue
    if (!isDeepStrictEqual(target[change.field], change.before)) throw Error(`Production content changed: ${change.collection}/${change.id ?? ''}/${change.field}`)
    if (change.after === undefined) delete target[change.field]
    else target[change.field] = structuredClone(change.after)
  }
  return next
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const target = path.resolve(process.argv[2] || 'db.json')
  const original = fs.readFileSync(target, 'utf8')
  const database = JSON.parse(original)
  const manifestIndex = process.argv.indexOf('--manifest')
  if (manifestIndex !== -1 && !process.argv[manifestIndex + 1]) throw Error('Missing manifest path')
  const manifest = manifestIndex === -1 ? new URL('../files/releases/rpo-content-20260919.json', import.meta.url) : path.resolve(process.argv[manifestIndex + 1])
  const changes = JSON.parse(fs.readFileSync(manifest, 'utf8'))
  const next = applyReviewedRpoContent(database, changes)
  if (process.argv.includes('--write') && !isDeepStrictEqual(database, next)) {
    const backup = `${target}.before-rpo-${Date.now()}`
    fs.writeFileSync(backup, original, { flag: 'wx', mode: 0o600 })
    // Stop the single CMS process before writing; do not overwrite concurrent edits.
    if (fs.readFileSync(target, 'utf8') !== original) throw Error('Database changed during release')
    fs.writeFileSync(`${target}.rpo-tmp`, JSON.stringify(next, null, 2), { flag: 'wx', mode: 0o600 })
    fs.renameSync(`${target}.rpo-tmp`, target)
    console.log(`RPO content applied; backup=${backup}`)
  } else console.log(`RPO content verified (${changes.length} reviewed fields); database unchanged`)
}
