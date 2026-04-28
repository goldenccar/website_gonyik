import express from 'express'
import cors from 'cors'
import path from 'path'
import fs from 'fs'
import { initDatabase } from './db'
import configRoutes from './routes/config'
import fabricRoutes from './routes/fabrics'
import equipmentRoutes from './routes/equipment'
import reportRoutes from './routes/reports'
import serviceRoutes from './routes/services'
import mediaRoutes from './routes/media'
import adminRoutes from './routes/admin'

const app = express()
const PORT = process.env.PORT || 3001

// Init database
initDatabase()

// Middleware
app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Static files
const uploadsDir = path.resolve(process.cwd(), 'public/uploads')
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}
app.use('/uploads', express.static(uploadsDir))

// API Routes
app.use('/api', configRoutes)
app.use('/api/fabrics', fabricRoutes)
app.use('/api/equipment', equipmentRoutes)
app.use('/api/reports', reportRoutes)
app.use('/api/services', serviceRoutes)
app.use('/api/media', mediaRoutes)
app.use('/api/admin', adminRoutes)

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' })
})

// In production, serve static client files
const clientDist = path.resolve(process.cwd(), 'dist/client')
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist))
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'))
  })
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
