import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createApp } from '../server/app'
import { db, initDatabase } from '../server/db'
import { generateToken } from '../server/middleware/auth'

initDatabase()

test('series CMS preserves paired feature icons, editable links and explicit clearing through public bootstrap', async () => {
  const app = createApp()
  const user = { id: 98766, username: 'series-cms-fixture', password_hash: 'unused', must_change_password: false } as any
  db.users.push(user)
  const server = app.listen(0, '127.0.0.1')
  await new Promise<void>((resolve) => server.once('listening', resolve))
  const base = `http://127.0.0.1:${(server.address() as { port: number }).port}/api`
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${generateToken(user.id, user.username)}` }
  let id: number | undefined
  const read = async () => (await (await fetch(`${base}/bootstrap`)).json()).series.find((item: any) => item.id === id)
  const update = (body: Record<string, unknown>) => fetch(`${base}/fabrics/admin/series/${id}`, { method: 'PUT', headers, body: JSON.stringify(body) })
  try {
    const created = await fetch(`${base}/fabrics/admin/series`, { method: 'POST', headers, body: JSON.stringify({
      name: 'CMS fixture', slug: 'cms-series-fixture', home_image: '/uploads/cms-series-fixture.webp',
      story_title: 'Edited title', story_intro: 'Edited introduction', story_features_label: 'Edited features',
      story_highlights: ['Water', '', 'Air', 'Cut'], story_icons: ['droplets', 'sun', 'wind', 'unrecognised'],
      story_primary_label: 'Edited primary', story_primary_link: '/fabrics/catalog?series=otter#series-otter',
      story_secondary_label: 'Edited secondary', story_secondary_link: 'https://example.com/materials',
    }) })
    assert.equal(created.status, 200)
    id = (await created.json()).id
    const initial = await read()
    assert.deepEqual(initial.story_highlights, ['Water', 'Air', 'Cut'])
    assert.deepEqual(initial.story_icons, ['droplets', 'wind', 'none'])
    assert.equal(initial.story_features_label, 'Edited features')
    assert.equal(initial.story_secondary_link, 'https://example.com/materials')

    assert.equal((await update({ story_title: 'Only title changed' })).status, 200)
    assert.deepEqual(await read(), { ...initial, story_title: 'Only title changed' })
    for (const link of ['javascript:alert(1)', '//example.com', '/\\example.com', '/path\nmore', 'https://', 'https://example.com\\path']) {
      const response = await update({ story_primary_link: link, story_intro: 'Must not be saved' })
      assert.equal(response.status, 400, link)
    }
    assert.equal((await read()).story_intro, 'Edited introduction')
    assert.equal((await read()).story_primary_link, initial.story_primary_link)

    assert.equal((await update({ story_title: '', story_intro: '', story_features_label: '', story_highlights: [], story_icons: [], story_primary_label: '', story_primary_link: '', story_secondary_label: '', story_secondary_link: '' })).status, 200)
    const cleared = await read()
    for (const key of ['story_title', 'story_intro', 'story_features_label', 'story_primary_label', 'story_primary_link', 'story_secondary_label', 'story_secondary_link']) assert.equal(cleared[key], '', key)
    assert.deepEqual(cleared.story_highlights, [])
    assert.deepEqual(cleared.story_icons, [])
    assert.equal(cleared.home_image, initial.home_image)
  } finally {
    db.fabric_series = db.fabric_series.filter((item) => item.id !== id)
    db.users = db.users.filter((item) => item.id !== user.id)
    await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()))
  }
})
