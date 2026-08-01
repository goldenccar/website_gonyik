import type { NextFunction, Request, RequestHandler, Response } from 'express'

interface RateLimitOptions {
  windowMs: number
  max: number
  keyPrefix: string
}

interface RateLimitEntry {
  count: number
  resetAt: number
}

const stores = new Map<string, Map<string, RateLimitEntry>>()

function clientAddress(req: Request) {
  return req.ip || req.socket.remoteAddress || 'unknown'
}

export function createRateLimit({ windowMs, max, keyPrefix }: RateLimitOptions): RequestHandler {
  const store = stores.get(keyPrefix) || new Map<string, RateLimitEntry>()
  stores.set(keyPrefix, store)

  return (req, res, next) => {
    const now = Date.now()
    const key = `${clientAddress(req)}:${keyPrefix}`
    const current = store.get(key)
    const entry = !current || current.resetAt <= now
      ? { count: 0, resetAt: now + windowMs }
      : current

    entry.count += 1
    store.set(key, entry)

    res.setHeader('RateLimit-Limit', String(max))
    res.setHeader('RateLimit-Remaining', String(Math.max(0, max - entry.count)))
    res.setHeader('RateLimit-Reset', String(Math.ceil(entry.resetAt / 1000)))

    if (entry.count > max) {
      res.setHeader('Retry-After', String(Math.max(1, Math.ceil((entry.resetAt - now) / 1000))))
      res.status(429).json({ error: '请求过于频繁，请稍后再试' })
      return
    }

    if (store.size > 2_000 && entry.count === 1) {
      for (const [storedKey, storedEntry] of store) {
        if (storedEntry.resetAt <= now) store.delete(storedKey)
      }
    }
    next()
  }
}

export function securityHeaders(_req: Request, res: Response, next: NextFunction) {
  res.removeHeader('X-Powered-By')
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'SAMEORIGIN')
  res.setHeader('X-DNS-Prefetch-Control', 'off')
  res.setHeader('X-Permitted-Cross-Domain-Policies', 'none')
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()')
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin')
  res.setHeader('Cross-Origin-Resource-Policy', 'same-origin')

  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
    res.setHeader(
      'Content-Security-Policy',
      [
        "default-src 'self'",
        "base-uri 'self'",
        "object-src 'none'",
        "frame-ancestors 'self'",
        "form-action 'self'",
        "img-src 'self' data: blob:",
        "font-src 'self' data:",
        "style-src 'self' 'unsafe-inline'",
        "script-src 'self'",
        "connect-src 'self'",
        'upgrade-insecure-requests',
      ].join('; '),
    )
  }
  next()
}
