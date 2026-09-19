import test from 'node:test'
import assert from 'node:assert/strict'
import { applyRpoReview } from '../scripts/apply-rpo-review'
import { TECHNOLOGY_PAGES } from '../src/config/technologyPages'
import { RPO_CONTENT } from '../src/config/rpoContent'
import { refineRpoReview } from '../scripts/refine-rpo-review'

test('RPO local review changes six technology pages once, retaining other content and later edits', () => {
  const db = {
    fluorine_sections: [
      ...TECHNOLOGY_PAGES.map((page, id) => ({ id, page_key: 'pfas-free-innovation', section_key: page.sectionKey, title: 'old', status: 'published', market_visibility: { global: 'public' } })),
      { id: 80, page_key: 'pfas-free-innovation', section_key: 'pfas-free-system', title: 'old PFAS text', status: 'published' },
      { id: 81, page_key: 'services', section_key: 'services', title: 'keep me', status: 'published' },
    ],
    home_config: { hero_title: 'existing', primary_btn_text: 'existing button', platform_section_link_text: 'old', platform_section_link: 'old' },
    navigation: [{ link: '/pfas-free-innovation', mega_menu: [] }, { link: '/fabrics', mega_menu: [{ title: 'existing' }] }],
    fabric_sku: [{ name: 'existing' }], contact_config: { email: 'existing' },
  }
  const before = structuredClone(db)
  assert.equal(applyRpoReview(db), true)
  assert.equal(TECHNOLOGY_PAGES.length, 6)
  assert.deepEqual(Object.keys(RPO_CONTENT).sort(), TECHNOLOGY_PAGES.map(page => page.sectionKey).sort())
  assert.equal(db.fluorine_sections[6].status, 'draft')
  assert.equal(db.fluorine_sections[6].title, 'old PFAS text')
  assert.deepEqual(db.fluorine_sections[7], before.fluorine_sections[7])
  assert.deepEqual(db.navigation[1], before.navigation[1])
  assert.deepEqual(db.fabric_sku, before.fabric_sku)
  assert.deepEqual(db.contact_config, before.contact_config)
  assert.equal(db.home_config.hero_title, before.home_config.hero_title)
  assert.equal(db.home_config.primary_btn_text, before.home_config.primary_btn_text)
  assert.deepEqual(db.fluorine_sections[0].market_visibility, before.fluorine_sections[0].market_visibility)
  db.fluorine_sections[0].title = 'Later CMS title'
  const edited = structuredClone(db)
  assert.equal(applyRpoReview(db), false)
  assert.deepEqual(db, edited)
})

test('editorial review retains existing menu destinations and preserves later edits', () => {
  const db = {
    rpo_review_version: 3,
    fluorine_sections: TECHNOLOGY_PAGES.map(page => ({ page_key: 'pfas-free-innovation', section_key: page.sectionKey, title: 'existing', status: 'published' })),
    navigation: [{id:2,label:'面料系列',link:'/fabrics',mega_menu:[{id:'series',title:'系列',items:[{label:'OTTER',link:'/fabrics/series/otter',order_index:0}],order_index:0}]}],
  }
  const original = structuredClone(db)
  assert.equal(refineRpoReview(db), true)
  assert.equal(db.navigation[0].mega_menu[1].items[0].link,original.navigation[0].mega_menu[0].items[0].link)
  assert.equal(db.fluorine_sections[1].title,'existing')
  const lamination = db.fluorine_sections.find(s=>s.section_key==='lamination')!
  assert.equal(JSON.stringify(lamination).includes('RAYO'),false)
  assert.equal((db.fluorine_sections.find(s=>s.section_key==='supply-chain') as any).hero_visual,'image')
  lamination.title='Later CMS edit'
  const edited=structuredClone(db)
  assert.equal(refineRpoReview(db),false)
  assert.deepEqual(db,edited)
})
