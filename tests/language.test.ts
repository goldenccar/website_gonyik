import assert from 'node:assert/strict'
import { test } from 'node:test'
import express from 'express'
import { once } from 'node:events'
import { DEFAULT_SITE_MARKETS, marketPath } from '../src/config/markets'
import { preferredLanguageMarket } from '../server/language'
import { traditionalTranslations } from '../server/localization'
import { createApp } from '../server/app'

function request(ip: string, cookie = '', languages = ['zh-CN']) {
  return { ip, get: (name: string) => name === 'cookie' ? cookie : '', acceptsLanguages: () => languages } as express.Request
}

test('first-visit language uses an offline IPv4/IPv6 country lookup, with browser fallback', () => {
  for (const [ip, expected] of [['114.114.114.114', 'cn'], ['240e::1', 'cn'], ['168.95.1.1', 'tw'], ['203.198.7.1', 'tw'], ['202.175.3.8', 'tw'], ['8.8.8.8', 'global']]) {
    assert.equal(preferredLanguageMarket(request(ip), DEFAULT_SITE_MARKETS)?.code, expected)
  }
  assert.equal(preferredLanguageMarket(request('127.0.0.1', '', ['zh-Hant-HK']), DEFAULT_SITE_MARKETS)?.code, 'tw')
  assert.equal(preferredLanguageMarket(request('::1', '', ['en-US']), DEFAULT_SITE_MARKETS)?.code, 'global')
  assert.equal(preferredLanguageMarket(request('::1', '', []), DEFAULT_SITE_MARKETS)?.code, 'cn')
})

test('manual preference overrides IP and disabled or malformed preferences cannot select an unavailable language', () => {
  assert.equal(preferredLanguageMarket(request('8.8.8.8', 'gonyik_language=cn'), DEFAULT_SITE_MARKETS)?.code, 'cn')
  assert.equal(preferredLanguageMarket(request('114.114.114.114', 'a=1; gonyik_language=global'), DEFAULT_SITE_MARKETS)?.code, 'global')
  assert.equal(preferredLanguageMarket(request('114.114.114.114', 'gonyik_language=%invalid'), DEFAULT_SITE_MARKETS)?.code, 'cn')
  const disabled = DEFAULT_SITE_MARKETS.map(market => ({ ...market, enabled: market.code !== 'tw' }))
  assert.equal(preferredLanguageMarket(request('168.95.1.1', 'gonyik_language=tw'), disabled)?.code, 'cn')
  assert.equal(marketPath('/fabrics/catalog?sku=10#sample', 'tw'), '/tw/fabrics/catalog?sku=10#sample')
})

test('Traditional Chinese follows current CMS source with editable overrides and intact identifiers', () => {
  const source = '港翼 OTTER T50-2：面料与复合技术/h柔软、导湿，轻户外。'
  const converted = traditionalTranslations([source])[source]
  assert.match(converted, /面料與複合技術\/h柔軟、導溼，輕戶外/)
  assert.match(converted, /OTTER T50-2/)
  assert.equal(traditionalTranslations([source], { [source]: '後台審校內容' })[source], '後台審校內容')
  const updated = '新开发的面料'
  assert.equal(traditionalTranslations([updated])[updated], '新開發的面料')
})

test('bootstrap resolves language before page content, never caches personalized responses, and respects explicit routes', async () => {
  const app = createApp()
  const server = app.listen(0, '127.0.0.1')
  await once(server, 'listening')
  const address = server.address() as { port: number }
  const base = `http://127.0.0.1:${address.port}/api/bootstrap`
  try {
    const automatic = await fetch(`${base}?market=cn&detect_language=1`, { headers: { 'Accept-Language': 'zh-HK' } })
    assert.equal(automatic.headers.get('cache-control'), 'private, no-store')
    const data = await automatic.json()
    assert.equal(data.current_locale, 'zh-TW')
    assert.deepEqual(data.markets.slice(0, 3).map((market: { label: string }) => market.label), ['简体中文', '繁體中文', 'English'])
    assert.equal(data.translations['面料系列'], '面料系列')
    const explicit = await fetch(`${base}?market=global&detect_language=1`, { headers: { Cookie: 'gonyik_language=cn', 'Accept-Language': 'zh-CN' } })
    assert.equal((await explicit.json()).current_locale, 'en')
    const untrusted = await fetch(`${base}?market=cn&detect_language=1`, { headers: { 'X-Forwarded-For': '8.8.8.8', 'Accept-Language': 'zh-CN' } })
    assert.equal((await untrusted.json()).current_locale, 'zh-CN')
  } finally {
    server.closeAllConnections()
    await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()))
  }
})

// Keep imported translations editable across restarts and future initialization.
test('CMS localization import is idempotent and preserves editorial overrides', async () => {
  const { seedLocalizations } = await import('../server/localization')
  const target = { translations: { en: { '面料系列': 'Edited in CMS' } } } as { localization_content_version?: number; translations: Record<string, Record<string, string>> }
  assert.equal(seedLocalizations(target), true)
  assert.equal(target.translations.en['面料系列'], 'Edited in CMS')
  assert.equal(target.translations.en['外套护理，从洗标开始'], 'Jacket care starts with the label')
  assert.equal(target.translations['zh-TW']['外套护理，从洗标开始'], '外套護理，從洗標開始')
  delete target.translations.en['材料科技']
  assert.equal(seedLocalizations(target), false)
  assert.equal(target.translations.en['材料科技'], undefined)
})

test('reviewed service and lamination content has complete CMS translations with intact markup', async () => {
  const fs = await import('node:fs')
  const { collectTranslatableStrings } = await import('../server/localizationSources')
  const content = JSON.parse(fs.readFileSync(new URL('../server/content/localizations-20260921.json', import.meta.url), 'utf8'))
  for (const filename of ['../files/content/services-review-20260921.json', '../files/content/lamination-review-20260921.json', '../server/content/interface-sources.json']) {
    const sources = collectTranslatableStrings(JSON.parse(fs.readFileSync(new URL(filename, import.meta.url), 'utf8')))
    for (const source of sources) {
      for (const locale of ['en', 'zh-TW']) {
        assert.ok(content[locale][source], `${locale}: ${source}`)
        assert.deepEqual(content[locale][source].match(/<\/?(?:b|i|up|down|note|t)>|\/h|\{\w+\}/g) || [], source.match(/<\/?(?:b|i|up|down|note|t)>|\/h|\{\w+\}/g) || [], source)
      }
      assert.doesNotMatch(content.en[source], /[\u3400-\u9fff]/)
    }
  }
})

test('a CMS translation edit reaches bootstrap, and clearing it does not restore a hidden English fallback', async () => {
  const { db } = await import('../server/db')
  const key = '外套护理，从洗标开始'
  const previousTitle = db.care_guides[0].title
  db.care_guides[0].title = key
  const before = structuredClone(db.translations.en)
  const { generateToken } = await import('../server/middleware/auth')
  const user = { id: 900001, username: 'translation-test', password: '', must_change_password: false }
  db.users.push(user)
  const token = generateToken(user.id, user.username)
  const app = createApp()
  const server = app.listen(0, '127.0.0.1')
  await once(server, 'listening')
  const base = `http://127.0.0.1:${(server.address() as { port: number }).port}/api/bootstrap?market=global`
  try {
    const adminUrl = base.replace('/bootstrap?market=global', '/admin/localizations/en')
    const save = async (translations: Record<string, string>) => fetch(adminUrl, { method: 'PUT', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ translations }) })
    assert.equal((await save({ ...before, [key]: 'CMS edited jacket care' })).status, 200)
    assert.equal((await (await fetch(base)).json()).translations[key], 'CMS edited jacket care')
    const cleared = { ...before }; delete cleared[key]
    assert.equal((await save(cleared)).status, 200)
    assert.equal((await (await fetch(base)).json()).translations[key], undefined)
  } finally {
    db.translations.en = before
    db.care_guides[0].title = previousTitle
    db.users = db.users.filter(item => item.id !== user.id)
    await new Promise<void>(resolve => server.close(() => resolve()))
  }
})
