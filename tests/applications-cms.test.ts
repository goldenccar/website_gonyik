import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createApp } from '../server/app'
import { db, initDatabase } from '../server/db'
import { generateToken } from '../server/middleware/auth'

initDatabase()
test('application CMS round-trip preserves content, independent series, explicit clearing and market visibility', async () => {
  const app = createApp()
  const user = { id: 98765, username: 'application-cms-fixture', password_hash: 'unused', must_change_password: false } as any
  db.users.push(user)
  const root = db.equipment_categories.find(c => c.parent_id == null && c.visibility !== 'hidden')!
  const series = db.fabric_series.slice(0, 2)
  const server = app.listen(0, '127.0.0.1')
  await new Promise<void>(resolve => server.once('listening', resolve))
  const base = `http://127.0.0.1:${(server.address() as { port: number }).port}/api`
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${generateToken(user.id, user.username)}` }
  let id: number | undefined
  let sampleId: number | undefined
  const read = async (market = 'cn') => (await (await fetch(`${base}/equipment/catalog?market=${market}`)).json()).data
  const update = (body: any) => fetch(`${base}/equipment/admin/products/${id}`, { method: 'PUT', headers, body: JSON.stringify(body) })
  try {
    const payload = { name: 'Application fixture', category_ids: [root.id], related_series_ids: series.map(s => s.id), related_sku_ids: [],
      scene_images: ['Walking','Rain','Skiing','Alpine','Cliff','Cycling'].map((alt,index)=>({image:`/visuals/scene-${index}.webp`,alt})),
      image: '/visuals/fixture.webp', image_caption: 'Illustration', image_alt: 'Image description', image_fit: 'contain', image_position: '70% 50%',
      case_label: 'Application direction', card_summary: 'Editable introduction', features: JSON.stringify(['Rain', 'Comfort']), feature_icons: ['cloud-rain', 'feather'], features_label: 'Priorities',
      detail_title: 'Sample', detail_body: 'Editable detail', series_label: 'Series', cta_label: 'Discuss', cta_href: '/contact?application=fixture', market_visibility: { cn: 'public', global: 'hidden' } }
    const response = await fetch(`${base}/equipment/admin/products`, { method: 'POST', headers, body: JSON.stringify(payload) })
    assert.equal(response.status, 200)
    id = (await response.json()).id
    const initial = (await read()).products.find((p: any) => p.id === id)
    for (const key of Object.keys(payload)) assert.deepEqual(initial[key], (payload as any)[key], key)
    assert.deepEqual(initial.related_series.map((s: any) => s.id), series.map(s => s.id))
    assert.equal((await read('global')).products.some((p: any) => p.id === id), false)
    const sampleResponse = await fetch(`${base}/equipment/admin/products`, { method: 'POST', headers, body: JSON.stringify({
      name: 'Actual sample fixture', entry_type: 'sample', category_ids: [root.id], image: '/visuals/sample.webp', visibility: 'hidden',
      related_series_ids: [series[0].id], card_summary: 'Development sample', market_visibility: { cn: 'public', global: 'hidden' },
    }) })
    assert.equal(sampleResponse.status, 200)
    sampleId = (await sampleResponse.json()).id
    await update({ sample_ids: [sampleId] })
    const sampleUpdate = (body: any) => fetch(`${base}/equipment/admin/products/${sampleId}`, {method:'PUT',headers,body:JSON.stringify(body)})
    const getApplication = async () => (await read()).products.find((p: any) => p.id === id)
    assert.deepEqual((await getApplication()).samples, [], 'hidden samples stay private')
    await sampleUpdate({ visibility: 'public' })
    assert.equal((await read()).products.some((p: any) => p.id === sampleId), false, 'sample is not a top-level application')
    assert.equal((await getApplication()).samples[0].name, 'Actual sample fixture')
    assert.equal((await getApplication()).samples[0].related_series[0].id, series[0].id)
    await sampleUpdate({ market_visibility: { cn: 'hidden' } })
    assert.deepEqual((await getApplication()).samples, [], 'sample market restrictions are enforced')
    await sampleUpdate({ market_visibility: { cn: 'public' }, image: '' })
    assert.equal((await getApplication()).samples[0].id, sampleId, 'sample records remain available without media')
    await sampleUpdate({ image: '/visuals/sample.webp', category_ids: [] })
    assert.deepEqual((await getApplication()).samples, [], 'unmapped samples stay private')
    await update({ sample_ids: [] })
    assert.deepEqual((await getApplication()).sample_ids, [], 'CMS can clear sample links')
    await update({ name: 'Renamed application' })
    assert.equal((await read()).products.find((p: any) => p.id === id).detail_body, payload.detail_body)
    const form = new FormData()
    form.set('features', JSON.stringify(['Breathability']))
    form.set('feature_icons', JSON.stringify(['waves']))
    form.set('related_series_ids', JSON.stringify([series[0].id]))
    const multipart = await fetch(`${base}/equipment/admin/products/${id}`, { method: 'PUT', headers: { Authorization: headers.Authorization }, body: form })
    assert.equal(multipart.status, 200)
    const edited = (await read()).products.find((p: any) => p.id === id)
    assert.deepEqual(edited.feature_icons, ['waves'])
    assert.deepEqual(edited.related_series.map((s: any) => s.id), [series[0].id])
    assert.equal(edited.image_position, '70% 50%')
    assert.deepEqual(edited.scene_images, payload.scene_images)
    assert.equal((await update({scene_images:[...payload.scene_images].reverse()})).status,200)
    assert.deepEqual((await getApplication()).scene_images,[...payload.scene_images].reverse())
    for (const invalid of [[{image:'javascript:alert(1)',alt:'Bad'}], [{image:'//other.example',alt:''}],{}, [{image:'/valid.webp'}]]) assert.equal((await update({scene_images:invalid})).status,400)
    assert.equal((await update({scene_images:[]})).status,200)
    assert.deepEqual((await getApplication()).scene_images,[])
    for (const bad of ['javascript:alert(1)', '//other.example', '/\\other.example', 'https://']) {
      assert.equal((await update({ cta_href: bad, card_summary: 'must not save' })).status, 400)
    }
    assert.equal((await read()).products.find((p: any) => p.id === id).card_summary, payload.card_summary)
    assert.equal((await update({ image: '', case_label: '', features: '[]', feature_icons: [], related_series_ids: [], cta_label: '', cta_href: '', detail_title: '', detail_body: '' })).status, 200)
    const cleared = (await read()).products.find((p: any) => p.id === id)
    assert.equal(cleared.image, '')
    assert.equal(cleared.cta_label, '')
    assert.equal(cleared.detail_body, '')
    assert.deepEqual(cleared.related_series, [])
    assert.deepEqual(cleared.feature_icons, [])
    assert.equal(cleared.related_skus.length, 0)
    const publicCatalog = await read()
    assert.ok(publicCatalog.categories.every((c: any) => c.product_count > 0))
    await update({ visibility: 'hidden' })
    assert.equal((await read()).products.some((p: any) => p.id === id), false)
  } finally {
    db.equipment_products = db.equipment_products.filter(p => p.id !== id && p.id !== sampleId)
    db.equipment_product_categories = db.equipment_product_categories.filter(p => p.product_id !== id && p.product_id !== sampleId)
    db.users = db.users.filter(u => u.id !== user.id)
    await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()))
  }
})
