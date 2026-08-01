import express from 'express'
import cors from 'cors'
import path from 'path'
import fs from 'fs'
import { initDatabase, saveDb } from './db'
import { syncReferencedMedia } from './mediaAssets'
import { createRateLimit, securityHeaders } from './middleware/security'
import { assertAuthConfiguration } from './middleware/auth'
import configRoutes from './routes/config'
import fabricRoutes from './routes/fabrics'
import equipmentRoutes from './routes/equipment'
import serviceRoutes from './routes/services'
import mediaRoutes from './routes/media'
import adminRoutes from './routes/admin'

let databaseReady = false

function initializeDatabaseOnce() {
  if (databaseReady) return
  initDatabase()
  if (syncReferencedMedia() > 0) saveDb()
  databaseReady = true
}

function allowedOrigins() {
  const configured = [
    'https://gonyik.com',
    'https://www.gonyik.com',
    ...String(process.env.ALLOWED_ORIGINS || '')
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
  ]
  if (process.env.NODE_ENV !== 'production') {
    configured.push(
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
      'http://localhost:5176',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5174',
      'http://127.0.0.1:5175',
      'http://127.0.0.1:5176',
    )
  }
  return new Set(configured)
}

export function isAllowedApiOrigin(origin: string | undefined, host: string | undefined, origins: Set<string>) {
  if (!origin) return true
  if (origins.has(origin)) return true
  if (!host) return false
  try {
    // Compare the authority rather than reconstructing the origin from
    // req.protocol. TLS is terminated by Nginx in production, so Express can
    // otherwise see http://gonyik.com for a genuine https://gonyik.com request.
    return new URL(origin).host.toLowerCase() === host.toLowerCase()
  } catch {
    return false
  }
}

export function apiCacheControl(req: express.Request, res: express.Response, next: express.NextFunction) {
  const privateOrMutable = req.method !== 'GET'
    || req.path.startsWith('/admin')
    || req.path.startsWith('/contact')
  if (privateOrMutable) {
    res.setHeader('Cache-Control', 'no-store')
    res.setHeader('Pragma', 'no-cache')
    res.setHeader('Expires', '0')
  } else {
    // Public CMS data remains immediately revalidated while ETag can avoid
    // retransmitting unchanged JSON on repeat navigation.
    res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate')
  }
  next()
}

export function createApp() {
  assertAuthConfiguration()
  initializeDatabaseOnce()
  const app = express()
  const origins = allowedOrigins()

  app.disable('x-powered-by')
  if (process.env.TRUST_PROXY === '1') app.set('trust proxy', 1)

  app.use(securityHeaders)
  app.use((req, res, next) => {
    const origin = req.get('origin')
    const host = req.get('host')
    // Origin validation protects mutable/API traffic. Applying it to document
    // and asset requests can blank the whole site in browsers that attach an
    // Origin header to same-site subresources.
    if (req.path.startsWith('/api') && !isAllowedApiOrigin(origin, host, origins)) {
      res.status(403).json({ error: 'Origin not allowed' })
      return
    }
    cors({
      origin: origin ? true : false,
      methods: ['GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    })(req, res, next)
  })
  app.use(express.json({ limit: '2mb' }))
  app.use(express.urlencoded({ extended: true, limit: '256kb' }))

  const apiLimiter = createRateLimit({ windowMs: 15 * 60_000, max: 360, keyPrefix: 'api' })
  const loginLimiter = createRateLimit({ windowMs: 15 * 60_000, max: 10, keyPrefix: 'login' })
  const contactLimiter = createRateLimit({ windowMs: 60 * 60_000, max: 8, keyPrefix: 'contact' })
  app.use('/api', apiLimiter)
  app.use('/api/admin/login', loginLimiter)
  app.use('/api/contact', contactLimiter)

  app.use('/api', apiCacheControl)

  const uploadsDir = path.resolve(process.cwd(), 'public/uploads')
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true })
  app.use('/uploads', express.static(uploadsDir, {
    maxAge: '30d',
    immutable: true,
  }))

  app.use('/api', configRoutes)
  app.use('/api/fabrics', fabricRoutes)
  app.use('/api/equipment', equipmentRoutes)
  app.use('/api/services', serviceRoutes)
  app.use('/api/media', mediaRoutes)
  app.use('/api/admin', adminRoutes)

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() })
  })

  app.use('/api', (_req, res) => {
    res.status(404).json({ error: 'API endpoint not found' })
  })

  const clientDist = path.resolve(process.cwd(), 'dist/client')
  if (fs.existsSync(clientDist)) {
    app.use(express.static(clientDist, {
      setHeaders: (res, filePath) => {
        if (filePath.includes(`${path.sep}assets${path.sep}`) || filePath.includes(`${path.sep}visuals${path.sep}`)) {
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
        }
      },
    }))
    app.get('*', (_req, res) => {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
      res.setHeader('Pragma', 'no-cache')
      res.setHeader('Expires', '0')
      res.sendFile(path.join(clientDist, 'index.html'))
    })
  }

  app.use((error: Error & { type?: string; code?: string }, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    if (error.type === 'entity.too.large' || error.code === 'LIMIT_FILE_SIZE') {
      res.status(413).json({ error: 'Request body too large' })
      return
    }
    if (error.name === 'MulterError' || error.message === 'Unsupported file type' || error.message.includes('Only images')) {
      res.status(400).json({ error: error.message })
      return
    }
    console.error(error)
    res.status(500).json({ error: 'Internal server error' })
  })

  return app
}
