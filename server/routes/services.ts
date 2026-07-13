import { Router } from 'express'
import { db, saveDb, getNextId, sortByOrderIndex, updateById, deleteById, nextOrderIndex } from '../db'
import { authMiddleware, AuthRequest } from '../middleware/auth'

const router = Router()

router.get('/care-guides', (_req, res) => {
  res.json({ data: db.care_guides.sort(sortByOrderIndex) })
})

router.get('/faqs', (_req, res) => {
  res.json({ data: db.faqs.sort(sortByOrderIndex) })
})

router.get('/admin/care-guides', authMiddleware, (_req, res) => {
  res.json({ data: db.care_guides.sort(sortByOrderIndex) })
})

router.post('/admin/care-guides', authMiddleware, (req: AuthRequest, res) => {
  const newItem = { id: getNextId(db.care_guides), ...req.body, order_index: nextOrderIndex(db.care_guides) }
  db.care_guides.push(newItem)
  saveDb()
  res.json({ success: true, id: newItem.id })
})

router.put('/admin/care-guides/:id', authMiddleware, (req: AuthRequest, res) => {
  updateById(db.care_guides, Number(req.params.id), req.body)
  saveDb()
  res.json({ success: true })
})

router.delete('/admin/care-guides/:id', authMiddleware, (req: AuthRequest, res) => {
  deleteById(db.care_guides, Number(req.params.id))
  saveDb()
  res.json({ success: true })
})

router.get('/admin/faqs', authMiddleware, (_req, res) => {
  res.json({ data: db.faqs.sort(sortByOrderIndex) })
})

router.post('/admin/faqs', authMiddleware, (req: AuthRequest, res) => {
  const newItem = { id: getNextId(db.faqs), ...req.body, order_index: nextOrderIndex(db.faqs) }
  db.faqs.push(newItem)
  saveDb()
  res.json({ success: true, id: newItem.id })
})

router.put('/admin/faqs/:id', authMiddleware, (req: AuthRequest, res) => {
  updateById(db.faqs, Number(req.params.id), req.body)
  saveDb()
  res.json({ success: true })
})

router.delete('/admin/faqs/:id', authMiddleware, (req: AuthRequest, res) => {
  deleteById(db.faqs, Number(req.params.id))
  saveDb()
  res.json({ success: true })
})

export default router
