import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { applyReviewedRpoContent } from '../scripts/publish-rpo-content'

test('reviewed RPO release preserves unrelated data, rejects conflicts and is repeatable', () => {
  const changes = JSON.parse(fs.readFileSync('files/releases/rpo-content-20260919.json', 'utf8'))
  const database: any = { home_config: { untouched: 'keep' }, navigation: [], fluorine_sections: [], users: [{ id: 1 }], contact_messages: [{ id: 2 }] }
  for (const c of changes) {
    let row = c.id === undefined ? database[c.collection] : database[c.collection].find((r: any) => r.id === c.id)
    if (!row) { row = { id: c.id, untouched: 'keep' }; database[c.collection].push(row) }
    if ('before' in c) row[c.field] = structuredClone(c.before)
  }
  const before = structuredClone(database)
  const result = applyReviewedRpoContent(database, changes)
  assert.deepEqual(database, before)
  assert.deepEqual(result.users, before.users)
  assert.deepEqual(result.contact_messages, before.contact_messages)
  assert.equal(result.home_config.untouched, 'keep')
  assert.ok(result.navigation.every((r: any) => r.untouched === 'keep'))
  assert.deepEqual(applyReviewedRpoContent(result, changes), result)
  const c = changes[0]
  const row = c.id === undefined ? database[c.collection] : database[c.collection].find((r: any) => r.id === c.id)
  row[c.field] = 'A later CMS edit'
  assert.throws(() => applyReviewedRpoContent(database, changes), /Production content changed/)
  assert.throws(() => applyReviewedRpoContent(database, [{ collection: 'users', field: 'name' }]), /Unexpected/)
})
