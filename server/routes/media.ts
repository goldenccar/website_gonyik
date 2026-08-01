import { Router } from 'express'
import path from 'path'
import fs from 'fs'
import { db, saveDb, updateById, deleteById } from '../db'
import { findUploadReferences, getLocalMediaReferences, registerUploadedFile, resolveLocalMediaPath, syncReferencedMedia } from '../mediaAssets'
import { authMiddleware, AuthRequest } from '../middleware/auth'
import { upload } from '../middleware/upload'

const UPLOADS_DIR = path.resolve(process.cwd(), 'public/uploads')

const router = Router()

router.get('/admin', authMiddleware, (_req, res) => {
  if (syncReferencedMedia() > 0) saveDb()
  const references = getLocalMediaReferences()
  const data = [...db.media_items]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .map((item) => ({
      ...item,
      origin: item.origin || (item.url.startsWith('/uploads/') ? 'upload' : 'site'),
      references: references.get(item.url) || [],
      in_use: references.has(item.url),
    }))
  res.json({ data })
})

router.get('/admin/download', authMiddleware, (req: AuthRequest, res) => {
  const url = String(req.query.url || '')
  const filePath = resolveLocalMediaPath(url)
  if (!filePath || !fs.existsSync(filePath)) {
    res.status(404).json({ error: '资源文件不存在' })
    return
  }
  res.download(filePath, path.basename(filePath))
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
  if (!item.url.startsWith('/uploads/')) {
    res.status(403).json({ error: '站内内置资源不能从媒体库删除，可以下载或修改分类说明' })
    return
  }
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
