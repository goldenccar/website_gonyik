import { Router } from 'express'
import path from 'path'
import fs from 'fs'
import { db, saveDb, getNextId } from '../db'
import { authMiddleware, AuthRequest } from '../middleware/auth'
import { upload } from '../middleware/upload'

const UPLOADS_DIR = path.resolve(process.cwd(), 'public/uploads')

const router = Router()

router.get('/', (_req, res) => {
  res.json({ data: db.media_items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) })
})

router.get('/admin', authMiddleware, (_req, res) => {
  res.json({ data: db.media_items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) })
})

router.post('/upload', authMiddleware, upload.single('file'), (req: AuthRequest, res) => {
  if (!req.file) { res.status(400).json({ error: 'No file uploaded' }); return }
  const { category, description } = req.body
  const newItem = {
    id: getNextId(db.media_items),
    filename: req.file.filename,
    url: `/uploads/${req.file.filename}`,
    category: category || 'other',
    description: description || '',
    file_type: req.file.mimetype || '',
    size: req.file.size,
    created_at: new Date().toISOString(),
  }
  db.media_items.push(newItem)
  saveDb()
  res.json({ success: true, data: newItem })
})

router.put('/admin/:id', authMiddleware, (req: AuthRequest, res) => {
  const idx = db.media_items.findIndex((m) => m.id === Number(req.params.id))
  if (idx < 0) { res.status(404).json({ error: 'Not found' }); return }
  const { category, description } = req.body
  db.media_items[idx] = {
    ...db.media_items[idx],
    category: category !== undefined ? category : db.media_items[idx].category,
    description: description !== undefined ? description : db.media_items[idx].description,
  }
  saveDb()
  res.json({ success: true })
})

router.delete('/:id', authMiddleware, (req: AuthRequest, res) => {
  const idx = db.media_items.findIndex((m) => m.id === Number(req.params.id))
  if (idx < 0) { res.status(404).json({ error: 'Not found' }); return }
  const item = db.media_items[idx]
  const filepath = path.join(UPLOADS_DIR, item.filename)
  if (fs.existsSync(filepath)) fs.unlinkSync(filepath)
  db.media_items.splice(idx, 1)
  saveDb()
  res.json({ success: true })
})

export default router
