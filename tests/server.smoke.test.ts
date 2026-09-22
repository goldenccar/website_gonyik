import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { test } from 'node:test'
import { apiCacheControl, createApp, isAllowedApiOrigin } from '../server/app'
import { db, initDatabase, saveDb } from '../server/db'
import { createRateLimit, securityHeaders } from '../server/middleware/security'
import { assertAuthConfiguration } from '../server/middleware/auth'
import { updateContactConfiguration, validateContactSubmission } from '../server/contactValidation'
import fabricRoutes from '../server/routes/fabrics'
import equipmentRoutes from '../server/routes/equipment'
import serviceRoutes from '../server/routes/services'
import configRoutes from '../server/routes/config'
import { getLocalMediaReferences, resolveLocalMediaPath } from '../server/mediaAssets'
import { visibleInMarket } from '../server/market'
import { marketCodeFromPath, marketPath, routeMarketStatus, stripMarketPrefix } from '../src/config/markets'

initDatabase()

function mockResponse() {
  const headers = new Map<string, string>()
  return {
    statusCode: 200,
    body: undefined as unknown,
    setHeader(name: string, value: string) { headers.set(name.toLowerCase(), String(value)) },
    removeHeader(name: string) { headers.delete(name.toLowerCase()) },
    status(code: number) { this.statusCode = code; return this },
    json(value: unknown) { this.body = value; return this },
    headers,
  }
}

test('Express app boots with fingerprinting disabled', () => {
  const app = createApp()
  assert.equal(app.disabled('x-powered-by'), true)
})

test('production same-site origin survives TLS termination at the reverse proxy', () => {
  const origins = new Set(['https://gonyik.com', 'https://www.gonyik.com'])
  assert.equal(isAllowedApiOrigin('https://gonyik.com', 'gonyik.com', origins), true)
  assert.equal(isAllowedApiOrigin('https://www.gonyik.com', 'www.gonyik.com', origins), true)
  assert.equal(isAllowedApiOrigin('https://attacker.example', 'gonyik.com', origins), false)
  assert.equal(isAllowedApiOrigin(undefined, 'gonyik.com', origins), true)
})

test('public GET API data revalidates while admin and mutations are not stored', () => {
  const publicResponse = mockResponse()
  apiCacheControl({ method: 'GET', path: '/bootstrap' } as never, publicResponse as never, () => {})
  assert.equal(publicResponse.headers.get('cache-control'), 'public, max-age=0, must-revalidate')

  const privateResponse = mockResponse()
  apiCacheControl({ method: 'GET', path: '/admin/localizations' } as never, privateResponse as never, () => {})
  assert.equal(privateResponse.headers.get('cache-control'), 'no-store')

  const mutationResponse = mockResponse()
  apiCacheControl({ method: 'POST', path: '/contact' } as never, mutationResponse as never, () => {})
  assert.equal(mutationResponse.headers.get('cache-control'), 'no-store')
})

test('security middleware applies the baseline response headers', () => {
  const res = mockResponse()
  let continued = false
  securityHeaders({} as never, res as never, () => { continued = true })
  assert.equal(continued, true)
  assert.equal(res.headers.get('x-content-type-options'), 'nosniff')
  assert.equal(res.headers.get('x-frame-options'), 'SAMEORIGIN')
  assert.equal(res.headers.get('x-dns-prefetch-control'), 'off')
  assert.equal(res.headers.get('x-permitted-cross-domain-policies'), 'none')
  assert.equal(res.headers.get('referrer-policy'), 'strict-origin-when-cross-origin')
})

test('production security middleware includes HSTS and CSP', () => {
  const previous = process.env.NODE_ENV
  process.env.NODE_ENV = 'production'
  const res = mockResponse()
  securityHeaders({} as never, res as never, () => {})
  if (previous === undefined) delete process.env.NODE_ENV
  else process.env.NODE_ENV = previous
  assert.match(res.headers.get('strict-transport-security') || '', /max-age=31536000/)
  assert.match(res.headers.get('content-security-policy') || '', /default-src 'self'/)
})

test('production auth rejects a missing or weak JWT secret', () => {
  const previousEnvironment = process.env.NODE_ENV
  const previousSecret = process.env.JWT_SECRET
  process.env.NODE_ENV = 'production'
  delete process.env.JWT_SECRET
  assert.throws(assertAuthConfiguration, /at least 32 characters/)
  process.env.JWT_SECRET = 'a-secure-development-test-secret-32+'
  assert.doesNotThrow(assertAuthConfiguration)
  if (previousEnvironment === undefined) delete process.env.NODE_ENV
  else process.env.NODE_ENV = previousEnvironment
  if (previousSecret === undefined) delete process.env.JWT_SECRET
  else process.env.JWT_SECRET = previousSecret
})

test('native rate limiter returns 429 after the configured threshold', () => {
  const limiter = createRateLimit({ windowMs: 60_000, max: 2, keyPrefix: 'unit-test' })
  const req = { ip: '127.0.0.99', socket: {} } as never
  const first = mockResponse()
  const second = mockResponse()
  const third = mockResponse()
  let nextCount = 0
  limiter(req, first as never, () => { nextCount += 1 })
  limiter(req, second as never, () => { nextCount += 1 })
  limiter(req, third as never, () => { nextCount += 1 })
  assert.equal(nextCount, 2)
  assert.equal(third.statusCode, 429)
})

test('technology navigation labels remain within the CMS limit', () => {
  for (const section of db.fluorine_sections || []) {
    assert.ok(Array.from(section.nav_label || section.title || '').length <= 12)
  }
})

test('all configured technology hero assets exist locally', () => {
  for (const section of db.fluorine_sections || []) {
    if (!section.image_url?.startsWith('/')) continue
    const filePath = path.resolve(process.cwd(), 'public', section.image_url.replace(/^\//, ''))
    assert.ok(fs.existsSync(filePath), `${section.section_key}: ${section.image_url}`)
  }
})

test('media inventory discovers referenced site visuals and blocks path traversal', () => {
  const references = getLocalMediaReferences()
  assert.ok([...references.keys()].some((url) => url.startsWith('/visuals/')))
  assert.equal(resolveLocalMediaPath('/visuals/../../etc/passwd'), null)
  assert.equal(resolveLocalMediaPath('/visuals/pfas-system-hero-v8.jpg'), path.resolve('public/visuals/pfas-system-hero-v8.jpg'))
})

test('market route helper preserves query strings and hashes', () => {
  assert.equal(marketPath('/global/fabrics?series=otter#sku', 'cn'), '/fabrics?series=otter#sku')
  assert.equal(marketPath('/fabrics?series=otter#sku', 'global'), '/global/fabrics?series=otter#sku')
  assert.equal(marketCodeFromPath('/jp/fabrics'), 'jp')
  assert.equal(stripMarketPrefix('/jp/fabrics'), '/fabrics')
})

test('a new database contains no predictable administrator account', () => {
  assert.deepEqual(db.users, [])
})

test('current migration is idempotent and preserves CMS-managed copy', () => {
  const databasePath = process.env.GONYIK_DB_PATH!
  db.home_config.hero_title = 'CMS 自定义标题'
  saveDb()
  const before = fs.readFileSync(databasePath)
  initDatabase()
  const after = fs.readFileSync(databasePath)
  assert.equal(after.equals(before), true)
  assert.equal(db.home_config.hero_title, 'CMS 自定义标题')
})

test('market visibility uses explicit content rules before the market default', () => {
  const globalMarket = {
    code: 'global', label: 'Global', locale: 'en', enabled: true,
    is_default: false, default_visibility: 'hidden', order_index: 1,
  } as const
  assert.equal(visibleInMarket({}, globalMarket), false)
  assert.equal(visibleInMarket({ market_visibility: { global: 'public' } }, globalMarket), true)
  assert.equal(visibleInMarket({ market_visibility: { global: 'hidden' } }, { ...globalMarket, default_visibility: 'public' }), false)
})

test('market route validation distinguishes enabled, disabled, and unknown markets', () => {
  const markets = [
    { code: 'cn', label: '中国大陆', locale: 'zh-CN', enabled: true, is_default: true, default_visibility: 'public', order_index: 0 },
    { code: 'jp', label: '日本', locale: 'ja', enabled: false, default_visibility: 'hidden', order_index: 1 },
  ] as const
  assert.equal(routeMarketStatus('cn', [...markets]), 'enabled')
  assert.equal(routeMarketStatus('jp', [...markets]), 'disabled')
  assert.equal(routeMarketStatus('not-a-market', [...markets]), 'unknown')
})

test('contact validation rejects malformed, unknown, oversized, and honeypot submissions', () => {
  const base = { name: '测试用户', company: '测试公司', email: 'user@example.com', subject: db.inquiry_subjects[0].label, message: '这是一段超过十个字符的有效咨询留言。' }
  for (const body of [
    { ...base, email: 'invalid' },
    { ...base, subject: '未知主题' },
    { ...base, message: '太短' },
    { ...base, message: '字'.repeat(501) },
    { ...base, website: 'spam.example' },
  ]) {
    assert.ok(validateContactSubmission(body, db.inquiry_subjects.map((item) => item.label)).error)
  }
})

test('updating public contact fields preserves an existing SMTP password', () => {
  const result = updateContactConfiguration({ ...db.contact_config, smtp_pass: 'existing-secret' }, { ...db.contact_config, email: 'updated@example.com', smtp_pass: '' })
  assert.equal(result.value?.smtp_pass, 'existing-secret')
})

test('catalog aggregate routes and their backing collections match page consumers', () => {
  const routePaths = (router: any) => router.stack.map((layer: any) => layer.route?.path).filter(Boolean)
  assert.ok(routePaths(fabricRoutes).includes('/catalog'))
  assert.ok(routePaths(equipmentRoutes).includes('/catalog'))
  assert.ok(routePaths(serviceRoutes).includes('/bootstrap'))
  assert.ok(Array.isArray(db.fabric_series) && Array.isArray(db.fabric_capabilities))
  assert.ok(Array.isArray(db.equipment_categories) && Array.isArray(db.equipment_products))
  assert.ok(Array.isArray(db.fluorine_sections) && db.page_configs.some((item) => item.page_key === 'services'))
})

test('service CMS saves media, grouped FAQs and page blocks consumed by public routes', () => {
  const invoke = (router: any, method: string, route: string, request: any) => {
    const handler = router.stack.find((layer: any) => layer.route?.path === route && layer.route.methods[method]).route.stack.at(-1).handle
    const response = mockResponse()
    handler({ query: {}, params: {}, get: () => undefined, ...request }, response, () => {})
    assert.equal(response.statusCode, 200)
    return response.body as any
  }
  const before = structuredClone({ sections: db.fluorine_sections, care: db.care_guides, faqs: db.faqs })
  try {
    const section = db.fluorine_sections.find(s => s.page_key === 'services' && s.module_type === 'digital-fabrics')
    assert.ok(section)
    const content_blocks = [{ key: 'assets', title: 'CMS edited title', content: 'CMS edited copy', image_url: '/uploads/service-review.webp', caption: 'Accessible illustration', items: [{ title: 'Edited item', content: 'Edited body' }] }]
    invoke(configRoutes, 'put', '/admin/content-sections/:pageKey/:id', { params: { pageKey: 'services', id: section.id }, body: { content_blocks } })
    const publicPage = invoke(serviceRoutes, 'get', '/bootstrap', {}).data.sections.find((s: any) => s.id === section.id)
    assert.equal(publicPage.content_blocks[0].image_url, content_blocks[0].image_url)
    assert.deepEqual(publicPage.content_blocks[0].items.map((item: any) => [item.title, item.content]), [['Edited item', 'Edited body']])
    const guide = db.care_guides[0]
    invoke(serviceRoutes, 'put', '/admin/care-guides/:id', { params: { id: guide.id }, body: { image_url: '/uploads/step-review.webp', image_alt: 'Edited care photo' } })
    assert.equal(invoke(serviceRoutes, 'get', '/care-guides', {}).data.find((item: any) => item.id === guide.id).image_alt, 'Edited care photo')
    const faq = db.faqs.find(item => item.category === 'garment-care')
    invoke(serviceRoutes, 'put', '/admin/faqs/:id', { params: { id: faq.id }, body: { group: 'CMS edited group' } })
    assert.equal(invoke(serviceRoutes, 'get', '/faqs', { query: { category: 'garment-care' } }).data.find((item: any) => item.id === faq.id).group, 'CMS edited group')
    const references = getLocalMediaReferences()
    assert.ok(references.has('/uploads/service-review.webp'))
    assert.ok(references.has('/uploads/step-review.webp'))
  } finally {
    db.fluorine_sections = before.sections; db.care_guides = before.care; db.faqs = before.faqs
    saveDb()
  }
})
