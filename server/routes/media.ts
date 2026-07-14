import { Router } from 'express'
import path from 'path'
import fs from 'fs'
import { db, saveDb, updateById, deleteById } from '../db'
import { findUploadReferences, registerUploadedFile } from '../mediaAssets'
import { authMiddleware, AuthRequest } from '../middleware/auth'
import { upload } from '../middleware/upload'

const UPLOADS_DIR = path.resolve(process.cwd(), 'public/uploads')

const router = Router()

router.get('/admin', authMiddleware, (_req, res) => {
  res.json({ data: db.media_items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) })
})

router.post('/upload', authMiddleware, upload.single('file'), (req: AuthRequest, res) => {
  if (!req.file) { res.status(400).json({ error: 'No file uploaded' }); return }
  const { category, description } = req.body
  const newItem = registerUploadedFile(req.file, category || 'other', description || '')
  saveDb()
  res.json({ success: true, url: newItem.url, data: newItem })
})

router.put('/admin/:id', authMiddleware, (req: AuthRequest, res) => {
  const id = Number(req.params.id)
  const existing = db.media_items.find((m) => m.id === id)
  if (!existing) { res.status(404).json({ error: 'Not found' }); return }
  const { category, description } = req.body
  updateById(db.media_items, id, {
    category: category !== undefined ? category : existing.category,
    description: description !== undefined ? description : existing.description,
  })
  saveDb()
  res.json({ success: true })
})

router.delete('/:id', authMiddleware, (req: AuthRequest, res) => {
  const id = Number(req.params.id)
  const item = db.media_items.find((m) => m.id === id)
  if (!item) { res.status(404).json({ error: 'Not found' }); return }
  const references = findUploadReferences(item.url)
  if (references.length > 0) {
    res.status(409).json({ error: '该资源仍被页面或内容引用，不能删除', references })
    return
  }
  const filepath = path.join(UPLOADS_DIR, item.filename)
  if (fs.existsSync(filepath)) fs.unlinkSync(filepath)
  deleteById(db.media_items, id)
  saveDb()
  res.json({ success: true })
})

export default router
