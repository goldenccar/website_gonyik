import { Router } from 'express'
import { db, saveDb, getNextId } from '../db'
import { authMiddleware, AuthRequest } from '../middleware/auth'
import { upload } from '../middleware/upload'

const router = Router()

router.get('/', (_req, res) => {
  res.json({ data: db.test_reports.sort((a, b) => (a.order_index || 0) - (b.order_index || 0)) })
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
  const file_url = `/uploads/${req.file.filename}`
  const file_type = req.file.mimetype === 'application/pdf' ? 'pdf' : req.file.mimetype.split('/')[1]
  const newReport = { id: getNextId(db.test_reports), title, file_url, file_type, category, order_index: db.test_reports.length, created_at: new Date().toISOString() }
  db.test_reports.push(newReport)
  saveDb()
  res.json({ success: true, id: newReport.id, url: file_url })
})

router.put('/admin/reports/:id', authMiddleware, upload.single('file'), (req: AuthRequest, res) => {
  const idx = db.test_reports.findIndex((r) => r.id === Number(req.params.id))
  if (idx < 0) { res.status(404).json({ error: 'Not found' }); return }
  const { title, category } = req.body
  let file_url = db.test_reports[idx].file_url
  let file_type = db.test_reports[idx].file_type
  if (req.file) {
    file_url = `/uploads/${req.file.filename}`
    file_type = req.file.mimetype === 'application/pdf' ? 'pdf' : req.file.mimetype.split('/')[1]
  }
  db.test_reports[idx] = { ...db.test_reports[idx], title, file_url, file_type, category }
  saveDb()
  res.json({ success: true })
})

router.delete('/admin/reports/:id', authMiddleware, (req: AuthRequest, res) => {
  db.test_reports = db.test_reports.filter((r) => r.id !== Number(req.params.id))
  saveDb()
  res.json({ success: true })
})

export default router
