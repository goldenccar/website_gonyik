import express from 'express'
import cors from 'cors'
import path from 'path'
import fs from 'fs'
import { initDatabase, saveDb } from './db'
import { syncReferencedMedia } from './mediaAssets'
import configRoutes from './routes/config'
import fabricRoutes from './routes/fabrics'
import equipmentRoutes from './routes/equipment'
import serviceRoutes from './routes/services'
import mediaRoutes from './routes/media'
import adminRoutes from './routes/admin'

const app = express()
const PORT = process.env.PORT || 3001

// Init database
initDatabase()
if (syncReferencedMedia() > 0) saveDb()

// Middleware
app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

app.use('/api', (req, res, next) => {
  const adminRequest = req.path.split('/').includes('admin')
  const fabricRequest = req.path.startsWith('/fabrics')
  if (req.method === 'GET' && fabricRequest) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate')
  } else if (req.method === 'GET' && !adminRequest) {
    res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=300')
  } else {
    res.setHeader('Cache-Control', 'private, no-store')
  }
  next()
})

// Static files
const uploadsDir = path.resolve(process.cwd(), 'public/uploads')
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}
app.use('/uploads', express.static(uploadsDir, {
  maxAge: '30d',
  immutable: true,
}))

// API Routes
app.use('/api', configRoutes)
app.use('/api/fabrics', fabricRoutes)
app.use('/api/equipment', equipmentRoutes)
app.use('/api/services', serviceRoutes)
app.use('/api/media', mediaRoutes)
app.use('/api/admin', adminRoutes)

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.use('/api', (_req, res) => {
  res.status(404).json({ error: 'API endpoint not found' })
})

// In production, serve static client files
const clientDist = path.resolve(process.cwd(), 'dist/client')
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist, {
    setHeaders: (res, filePath) => {
      if (filePath.includes(`${path.sep}assets${path.sep}`)) {
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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
