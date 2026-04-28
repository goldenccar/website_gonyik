import { Router } from 'express'
import { db, saveDb, getNextId } from '../db'
import { authMiddleware, AuthRequest } from '../middleware/auth'

const router = Router()

router.get('/about', (_req, res) => {
  res.json({ data: { about: db.about_us, philosophies: db.philosophies.sort((a, b) => a.order_index - b.order_index), milestones: db.milestones.sort((a, b) => a.order_index - b.order_index) } })
})

router.get('/news', (_req, res) => {
  const rows = db.news.filter((n) => n.status === 'published').sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime())
  res.json({ data: rows })
})

router.get('/news/:id', (req, res) => {
  const row = db.news.find((n) => n.id === Number(req.params.id))
  if (!row) { res.status(404).json({ error: 'News not found' }); return }
  res.json({ data: row })
})

router.get('/care-guides', (_req, res) => {
  res.json({ data: db.care_guides.sort((a, b) => a.order_index - b.order_index) })
})

router.get('/faqs', (_req, res) => {
  res.json({ data: db.faqs.sort((a, b) => a.order_index - b.order_index) })
})

router.put('/admin/about', authMiddleware, (req: AuthRequest, res) => {
  db.about_us = { ...db.about_us, ...req.body }
  saveDb()
  res.json({ success: true })
})

router.get('/admin/philosophies', authMiddleware, (_req, res) => {
  res.json({ data: db.philosophies.sort((a, b) => a.order_index - b.order_index) })
})

router.post('/admin/philosophies', authMiddleware, (req: AuthRequest, res) => {
  const newItem = { id: getNextId(db.philosophies), ...req.body, order_index: db.philosophies.length }
  db.philosophies.push(newItem)
  saveDb()
  res.json({ success: true, id: newItem.id })
})

router.put('/admin/philosophies/:id', authMiddleware, (req: AuthRequest, res) => {
  const idx = db.philosophies.findIndex((p) => p.id === Number(req.params.id))
  if (idx >= 0) { db.philosophies[idx] = { ...db.philosophies[idx], ...req.body }; saveDb() }
  res.json({ success: true })
})

router.delete('/admin/philosophies/:id', authMiddleware, (req: AuthRequest, res) => {
  db.philosophies = db.philosophies.filter((p) => p.id !== Number(req.params.id))
  saveDb()
  res.json({ success: true })
})

router.get('/admin/milestones', authMiddleware, (_req, res) => {
  res.json({ data: db.milestones.sort((a, b) => a.order_index - b.order_index) })
})

router.post('/admin/milestones', authMiddleware, (req: AuthRequest, res) => {
  const newItem = { id: getNextId(db.milestones), ...req.body, order_index: db.milestones.length }
  db.milestones.push(newItem)
  saveDb()
  res.json({ success: true, id: newItem.id })
})

router.put('/admin/milestones/:id', authMiddleware, (req: AuthRequest, res) => {
  const idx = db.milestones.findIndex((m) => m.id === Number(req.params.id))
  if (idx >= 0) { db.milestones[idx] = { ...db.milestones[idx], ...req.body }; saveDb() }
  res.json({ success: true })
})

router.delete('/admin/milestones/:id', authMiddleware, (req: AuthRequest, res) => {
  db.milestones = db.milestones.filter((m) => m.id !== Number(req.params.id))
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
  const idx = db.news.findIndex((n) => n.id === Number(req.params.id))
  if (idx >= 0) { db.news[idx] = { ...db.news[idx], ...req.body }; saveDb() }
  res.json({ success: true })
})

router.delete('/admin/news/:id', authMiddleware, (req: AuthRequest, res) => {
  db.news = db.news.filter((n) => n.id !== Number(req.params.id))
  saveDb()
  res.json({ success: true })
})

router.get('/admin/care-guides', authMiddleware, (_req, res) => {
  res.json({ data: db.care_guides.sort((a, b) => a.order_index - b.order_index) })
})

router.post('/admin/care-guides', authMiddleware, (req: AuthRequest, res) => {
  const newItem = { id: getNextId(db.care_guides), ...req.body, order_index: db.care_guides.length }
  db.care_guides.push(newItem)
  saveDb()
  res.json({ success: true, id: newItem.id })
})

router.put('/admin/care-guides/:id', authMiddleware, (req: AuthRequest, res) => {
  const idx = db.care_guides.findIndex((g) => g.id === Number(req.params.id))
  if (idx >= 0) { db.care_guides[idx] = { ...db.care_guides[idx], ...req.body }; saveDb() }
  res.json({ success: true })
})

router.delete('/admin/care-guides/:id', authMiddleware, (req: AuthRequest, res) => {
  db.care_guides = db.care_guides.filter((g) => g.id !== Number(req.params.id))
  saveDb()
  res.json({ success: true })
})

router.get('/admin/faqs', authMiddleware, (_req, res) => {
  res.json({ data: db.faqs.sort((a, b) => a.order_index - b.order_index) })
})

router.post('/admin/faqs', authMiddleware, (req: AuthRequest, res) => {
  const newItem = { id: getNextId(db.faqs), ...req.body, order_index: db.faqs.length }
  db.faqs.push(newItem)
  saveDb()
  res.json({ success: true, id: newItem.id })
})

router.put('/admin/faqs/:id', authMiddleware, (req: AuthRequest, res) => {
  const idx = db.faqs.findIndex((f) => f.id === Number(req.params.id))
  if (idx >= 0) { db.faqs[idx] = { ...db.faqs[idx], ...req.body }; saveDb() }
  res.json({ success: true })
})

router.delete('/admin/faqs/:id', authMiddleware, (req: AuthRequest, res) => {
  db.faqs = db.faqs.filter((f) => f.id !== Number(req.params.id))
  saveDb()
  res.json({ success: true })
})

export default router
