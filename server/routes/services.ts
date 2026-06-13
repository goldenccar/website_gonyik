import { Router } from 'express'
import { db, saveDb, getNextId, sortByOrderIndex, updateById, deleteById, nextOrderIndex } from '../db'
import { authMiddleware, AuthRequest } from '../middleware/auth'

const router = Router()

router.get('/about', (_req, res) => {
  res.json({
    data: {
      about: db.about_us,
      philosophies: db.philosophies.sort(sortByOrderIndex),
      milestones: db.milestones.sort(sortByOrderIndex),
    },
  })
})

router.get('/news', (_req, res) => {
  const rows = db.news
    .filter((n) => n.status === 'published')
    .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime())
  res.json({ data: rows })
})

router.get('/news/:id', (req, res) => {
  const row = db.news.find((n) => n.id === Number(req.params.id))
  if (!row) { res.status(404).json({ error: 'News not found' }); return }
  res.json({ data: row })
})

router.get('/care-guides', (_req, res) => {
  res.json({ data: db.care_guides.sort(sortByOrderIndex) })
})

router.get('/faqs', (_req, res) => {
  res.json({ data: db.faqs.sort(sortByOrderIndex) })
})

router.put('/admin/about', authMiddleware, (req: AuthRequest, res) => {
  db.about_us = { ...db.about_us, ...req.body }
  saveDb()
  res.json({ success: true })
})

router.get('/admin/philosophies', authMiddleware, (_req, res) => {
  res.json({ data: db.philosophies.sort(sortByOrderIndex) })
})

router.post('/admin/philosophies', authMiddleware, (req: AuthRequest, res) => {
  const newItem = { id: getNextId(db.philosophies), ...req.body, order_index: nextOrderIndex(db.philosophies) }
  db.philosophies.push(newItem)
  saveDb()
  res.json({ success: true, id: newItem.id })
})

router.put('/admin/philosophies/:id', authMiddleware, (req: AuthRequest, res) => {
  updateById(db.philosophies, Number(req.params.id), req.body)
  saveDb()
  res.json({ success: true })
})

router.delete('/admin/philosophies/:id', authMiddleware, (req: AuthRequest, res) => {
  deleteById(db.philosophies, Number(req.params.id))
  saveDb()
  res.json({ success: true })
})

router.get('/admin/milestones', authMiddleware, (_req, res) => {
  res.json({ data: db.milestones.sort(sortByOrderIndex) })
})

router.post('/admin/milestones', authMiddleware, (req: AuthRequest, res) => {
  const newItem = { id: getNextId(db.milestones), ...req.body, order_index: nextOrderIndex(db.milestones) }
  db.milestones.push(newItem)
  saveDb()
  res.json({ success: true, id: newItem.id })
})

router.put('/admin/milestones/:id', authMiddleware, (req: AuthRequest, res) => {
  updateById(db.milestones, Number(req.params.id), req.body)
  saveDb()
  res.json({ success: true })
})

router.delete('/admin/milestones/:id', authMiddleware, (req: AuthRequest, res) => {
  deleteById(db.milestones, Number(req.params.id))
  saveDb()
  res.json({ success: true })
})

router.get('/admin/news', authMiddleware, (_req, res) => {
  res.json({ data: db.news.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) })
})

router.post('/admin/news', authMiddleware, (req: AuthRequest, res) => {
  const newItem = { id: getNextId(db.news), ...req.body, created_at: new Date().toISOString() }
  db.news.push(newItem)
  saveDb()
  res.json({ success: true, id: newItem.id })
})

router.put('/admin/news/:id', authMiddleware, (req: AuthRequest, res) => {
  updateById(db.news, Number(req.params.id), req.body)
  saveDb()
  res.json({ success: true })
})

router.delete('/admin/news/:id', authMiddleware, (req: AuthRequest, res) => {
  deleteById(db.news, Number(req.params.id))
  saveDb()
  res.json({ success: true })
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
