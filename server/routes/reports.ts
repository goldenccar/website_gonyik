import { Router } from 'express'
import { db, saveDb, getNextId, sortByOrderIndex, updateById, deleteById, uploadUrl, nextOrderIndex } from '../db'
import { authMiddleware, AuthRequest } from '../middleware/auth'
import { upload } from '../middleware/upload'

const router = Router()

router.get('/', (_req, res) => {
  res.json({ data: db.test_reports.sort(sortByOrderIndex) })
})

router.get('/:id', (req, res) => {
  const row = db.test_reports.find((r) => r.id === Number(req.params.id))
  if (!row) { res.status(404).json({ error: 'Report not found' }); return }
  res.json({ data: row })
})

router.get('/admin/reports', authMiddleware, (_req, res) => {
  res.json({ data: db.test_reports })
})

router.post('/admin/reports', authMiddleware, upload.single('file'), (req: AuthRequest, res) => {
  if (!req.file) { res.status(400).json({ error: 'No file uploaded' }); return }
  const { title, category } = req.body
  const file_url = uploadUrl(req.file)
  const file_type = req.file.mimetype === 'application/pdf' ? 'pdf' : req.file.mimetype.split('/')[1]
  const newReport = {
    id: getNextId(db.test_reports),
    title,
    file_url,
    file_type,
    category,
    order_index: nextOrderIndex(db.test_reports),
    created_at: new Date().toISOString(),
  }
  db.test_reports.push(newReport)
  saveDb()
  res.json({ success: true, id: newReport.id, url: file_url })
})

router.put('/admin/reports/:id', authMiddleware, upload.single('file'), (req: AuthRequest, res) => {
  const id = Number(req.params.id)
  const existing = db.test_reports.find((r) => r.id === id)
  if (!existing) { res.status(404).json({ error: 'Not found' }); return }
  const { title, category } = req.body
  let file_url = existing.file_url
  let file_type = existing.file_type
  if (req.file) {
    file_url = uploadUrl(req.file)
    file_type = req.file.mimetype === 'application/pdf' ? 'pdf' : req.file.mimetype.split('/')[1]
  }
  updateById(db.test_reports, id, {
    title: title ?? existing.title,
    file_url,
    file_type,
    category: category ?? existing.category,
  })
  saveDb()
  res.json({ success: true })
})

router.delete('/admin/reports/:id', authMiddleware, (req: AuthRequest, res) => {
  deleteById(db.test_reports, Number(req.params.id))
  saveDb()
  res.json({ success: true })
})

export default router
