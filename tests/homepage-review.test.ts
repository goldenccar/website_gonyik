import test from 'node:test'
import assert from 'node:assert/strict'
import { applyHomepageReview } from '../server/homepageReview'

test('homepage release changes approved copy once and preserves CMS data outside its scope', () => {
  const database = {
    home_config: {
      hero_title: 'Existing title', hero_background: '/uploads/existing.jpg',
      primary_btn_text: 'Existing button', primary_btn_link: '/fabrics',
      verification_images: [{ id: 'photo', url: '/uploads/lab.jpg' }],
      platform_cards: [{ title: '膜技术', subtitle: 'old', evidence: 'retained' }],
      series_entries: {} as Record<string, { title: string; description: string }>,
    },
    contact_config: { email: 'retained@example.com' },
    fabric_sku: [{ id: 1, name: 'retained SKU' }],
  }
  const original = structuredClone(database)
  assert.equal(applyHomepageReview(database), true)
  assert.equal(database.home_config.hero_title, original.home_config.hero_title)
  assert.equal(database.home_config.hero_background, original.home_config.hero_background)
  assert.equal(database.home_config.primary_btn_text, original.home_config.primary_btn_text)
  assert.equal(database.home_config.primary_btn_link, original.home_config.primary_btn_link)
  assert.deepEqual(database.home_config.verification_images, original.home_config.verification_images)
  assert.deepEqual(database.contact_config, original.contact_config)
  assert.deepEqual(database.fabric_sku, original.fabric_sku)
  assert.equal(database.home_config.platform_cards[0].evidence, 'retained')
  assert.equal(database.home_config.series_entries.otter.title, '防水透湿')
  database.home_config.series_entries.otter.description = 'Later CMS edit'
  database.home_config.platform_cards[0].subtitle = 'Later summary'
  const edited = structuredClone(database)
  assert.equal(applyHomepageReview(database), false)
  assert.deepEqual(database, edited)
})
