import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { test } from 'node:test'
import { apiCacheControl, createApp, isAllowedApiOrigin } from '../server/app'
import { db, initDatabase } from '../server/db'
import { createRateLimit, securityHeaders } from '../server/middleware/security'
import { assertAuthConfiguration } from '../server/middleware/auth'
import { getLocalMediaReferences, resolveLocalMediaPath } from '../server/mediaAssets'
import { visibleInMarket } from '../server/market'
import { marketCodeFromPath, marketPath, stripMarketPrefix } from '../src/config/markets'
import { localizePath } from '../src/i18n/SiteLocale'

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
  assert.match(resolveLocalMediaPath('/visuals/pfas-system-hero-v8.jpg') || '', /public\/visuals\/pfas-system-hero-v8\.jpg$/)
})

test('market route helper preserves query strings, hashes, and legacy English links', () => {
  assert.equal(localizePath('/fabrics?series=otter#sku', 'en'), '/global/fabrics?series=otter#sku')
  assert.equal(localizePath('/en/fabrics', 'zh-CN'), '/fabrics')
  assert.equal(localizePath('/admin', 'en'), '/admin')
  assert.equal(marketPath('/global/fabrics?series=otter#sku', 'cn'), '/fabrics?series=otter#sku')
  assert.equal(marketPath('/fabrics?series=otter#sku', 'global'), '/global/fabrics?series=otter#sku')
  assert.equal(marketCodeFromPath('/jp/fabrics'), 'jp')
  assert.equal(stripMarketPrefix('/jp/fabrics'), '/fabrics')
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
