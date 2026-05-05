import { Router } from 'express'
import { db, saveDb } from '../db'
import { authMiddleware, AuthRequest } from '../middleware/auth'
import { upload } from '../middleware/upload'

const router = Router()

router.get('/home', (_req, res) => {
  res.json({ data: db.home_config })
})

router.get('/site-config', (_req, res) => {
  res.json({ data: db.site_config })
})

router.put('/admin/site-config', authMiddleware, (req: AuthRequest, res) => {
  db.site_config = { ...db.site_config, ...req.body }
  saveDb()
  res.json({ success: true })
})

router.put('/admin/site-config/logo', authMiddleware, upload.single('file'), (req: AuthRequest, res) => {
  if (!req.file) { res.status(400).json({ error: 'No file' }); return }
  const url = `/uploads/${req.file.filename}`
  db.site_config.logo_url = url
  saveDb()
  res.json({ success: true, url })
})

router.put('/admin/site-config/favicon', authMiddleware, upload.single('file'), (req: AuthRequest, res) => {
  if (!req.file) { res.status(400).json({ error: 'No file' }); return }
  const url = `/uploads/${req.file.filename}`
  db.site_config.favicon_url = url
  saveDb()
  res.json({ success: true, url })
})

router.get('/page/:pageKey', (req, res) => {
  const row = db.page_configs.find((p) => p.page_key === req.params.pageKey)
  res.json({ data: row || null })
})

router.get('/navigation', (_req, res) => {
  res.json({ data: db.navigation.sort((a, b) => a.order_index - b.order_index) })
})

router.get('/footer', (_req, res) => {
  res.json({ data: db.footer_config })
})

router.get('/social', (_req, res) => {
  res.json({ data: db.social_media })
})

router.get('/contact-config', (_req, res) => {
  res.json({ data: db.contact_config })
})

router.put('/admin/contact-config', authMiddleware, (req: AuthRequest, res) => {
  db.contact_config = { ...db.contact_config, ...req.body }
  saveDb()
  res.json({ success: true })
})

router.get('/fluorine-sections', (_req, res) => {
  res.json({ data: db.fluorine_sections.filter((s) => s.page_key === 'fluorine-free').sort((a, b) => a.order_index - b.order_index) })
})

router.put('/admin/fluorine-sections/:id', authMiddleware, (req: AuthRequest, res) => {
  const idx = db.fluorine_sections.findIndex((s) => s.id === Number(req.params.id))
  if (idx < 0) { res.status(404).json({ error: 'Not found' }); return }
  db.fluorine_sections[idx] = { ...db.fluorine_sections[idx], ...req.body }
  saveDb()
  res.json({ success: true })
})

router.put('/admin/home', authMiddleware, (req: AuthRequest, res) => {
  db.home_config = { ...db.home_config, ...req.body }
  saveDb()
  res.json({ success: true })
})

router.put('/admin/home/background', authMiddleware, upload.single('file'), (req: AuthRequest, res) => {
  if (!req.file) { res.status(400).json({ error: 'No file' }); return }
  const url = `/uploads/${req.file.filename}`
  db.home_config.hero_background = url
  saveDb()
  res.json({ success: true, url })
})

router.put('/admin/page/:pageKey', authMiddleware, (req: AuthRequest, res) => {
  const idx = db.page_configs.findIndex((p) => p.page_key === req.params.pageKey)
  if (idx >= 0) {
    db.page_configs[idx] = { ...db.page_configs[idx], ...req.body }
    saveDb()
  }
  res.json({ success: true })
})

router.put('/admin/navigation', authMiddleware, (req: AuthRequest, res) => {
  db.navigation = req.body.items.map((item: any, i: number) => ({ ...item, order_index: i }))
  saveDb()
  res.json({ success: true })
})

router.put('/admin/footer', authMiddleware, (req: AuthRequest, res) => {
  db.footer_config = { ...db.footer_config, ...req.body }
  saveDb()
  res.json({ success: true })
})

router.put('/admin/social', authMiddleware, upload.single('qrcode'), (req: AuthRequest, res) => {
  const { platform, account } = req.body
  const idx = db.social_media.findIndex((s) => s.platform === platform)
  const qrcode_url = req.file ? `/uploads/${req.file.filename}` : req.body.qrcode_url
  if (idx >= 0) {
    db.social_media[idx] = { ...db.social_media[idx], account, qrcode_url }
    saveDb()
  }
  res.json({ success: true })
})

router.get('/inquiry-subjects', (_req, res) => {
  res.json({ data: db.inquiry_subjects.sort((a, b) => a.order_index - b.order_index) })
})

router.put('/admin/inquiry-subjects', authMiddleware, (req: AuthRequest, res) => {
  db.inquiry_subjects = (req.body.items || []).map((item: any, i: number) => ({
    id: item.id || getNextId(db.inquiry_subjects),
    label: item.label,
    order_index: i,
  }))
  saveDb()
  res.json({ success: true })
})

export default router
