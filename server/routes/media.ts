import { Router } from 'express'
import path from 'path'
import fs from 'fs'
import { authMiddleware, AuthRequest } from '../middleware/auth'
import { upload } from '../middleware/upload'

const UPLOADS_DIR = path.resolve(process.cwd(), 'public/uploads')
const router = Router()

router.get('/', (_req, res) => {
  const files = fs.readdirSync(UPLOADS_DIR)
  const data = files.map((filename) => {
    const filepath = path.join(UPLOADS_DIR, filename)
    const stat = fs.statSync(filepath)
    return {
      filename,
      url: `/uploads/${filename}`,
      size: stat.size,
      createdAt: stat.birthtime,
    }
  }).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  res.json({ data })
})

router.post('/upload', authMiddleware, upload.single('file'), (req: AuthRequest, res) => {
  if (!req.file) { res.status(400).json({ error: 'No file uploaded' }); return }
  res.json({ success: true, url: `/uploads/${req.file.filename}`, filename: req.file.filename })
})

router.delete('/:filename', authMiddleware, (req: AuthRequest, res) => {
  const filepath = path.join(UPLOADS_DIR, req.params.filename)
  if (fs.existsSync(filepath)) fs.unlinkSync(filepath)
  res.json({ success: true })
})

export default router
