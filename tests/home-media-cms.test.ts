import test from 'node:test'
import assert from 'node:assert/strict'
import { normalizeHomeMedia } from '../server/homeMedia'
import { applyHomeMediaCms } from '../scripts/apply-home-media-cms'

test('home entries keep their own destination and media after deletion or reordering', () => {
  const original = { home_config: { platform_cards: [
    { title: '膜技术', footer: 'MEMBRANE' },
    { title: '面料复合', footer: 'LAMINATION' },
    { title: '供应链协同', footer: 'SUPPLY CHAIN' },
  ] }, unrelated: { keep: true } }
  const migrated = applyHomeMediaCms(original)
  assert.equal(original.home_config.platform_cards[0].footer, 'MEMBRANE')
  const remaining = normalizeHomeMedia({ platform_cards: migrated.home_config.platform_cards.slice(1).reverse() }).platform_cards
  assert.deepEqual(remaining.map((item: any) => [item.visual, item.link]), [
    ['supply', '/pfas-free-innovation/supply-chain'],
    ['lamination', '/pfas-free-innovation/lamination'],
  ])
  assert.deepEqual(migrated.unrelated, original.unrelated)
})

test('cleared copy, media and links stay empty through saving and repeated migration', () => {
  const source = { home_config: { platform_cards: [{ title: '膜技术', footer: 'MEMBRANE', link: '', visual: 'none', subtitle: '', description: 'old copy' }], technical_visuals: { membrane_image: '', supply_home_center: '' } } }
  const migrated = applyHomeMediaCms(source)
  assert.equal(migrated.home_config.platform_cards[0].link, '')
  assert.equal(migrated.home_config.platform_cards[0].subtitle, '')
  assert.equal(migrated.home_config.technical_visuals.membrane_image, '')
  const saved = normalizeHomeMedia({ ...migrated.home_config, technical_visuals: { membrane_image: '', supply_home_center: '' }, verifications: ['obsolete'] })
  assert.equal(saved.technical_visuals.membrane_image, '')
  assert.equal(saved.technical_visuals.supply_home_center, '')
  assert.equal('verifications' in saved, false)
  migrated.home_config = saved
  assert.deepEqual(applyHomeMediaCms(migrated), migrated)
  assert.deepEqual(normalizeHomeMedia({ platform_cards: [] }).platform_cards, [])
  assert.equal(normalizeHomeMedia({ platform_cards: [{ link: 'javascript:alert(1)', image_url: '//external.test/a.png', visual: 'unknown' }] }).platform_cards[0].link, '')
})
