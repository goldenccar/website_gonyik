import { Router } from 'express'
import { db, saveDb, getNextId } from '../db'
import { authMiddleware, AuthRequest } from '../middleware/auth'
import { upload } from '../middleware/upload'

const router = Router()

router.get('/series', (_req, res) => {
  res.json({ data: db.fabric_series.sort((a, b) => a.order_index - b.order_index) })
})

router.get('/series/:slug', (req, res) => {
  const slug = req.params.slug
  let series = db.fabric_series.find((s) => s.slug === slug)
  // If not found as a top-level series, check sub_series_data of all series
  if (!series) {
    for (const s of db.fabric_series) {
      if (s.sub_series_data) {
        try {
          const subs = JSON.parse(s.sub_series_data)
          const sub = subs.find((x: any) => x.slug === slug)
          if (sub) {
            series = {
              ...s,
              id: s.id * 100 + (subs.indexOf(sub) + 1), // pseudo-id
              name: sub.name,
              slug: sub.slug,
              description: sub.description,
              tagline: sub.subtitle || '',
              sub_series_data: null,
            }
            break
          }
        } catch {}
      }
    }
  }
  if (!series) { res.status(404).json({ error: 'Series not found' }); return }
  const skus = db.fabric_sku.filter((k) => k.series_id === series.id).sort((a, b) => a.order_index - b.order_index)
  res.json({ data: { ...series, skus } })
})

router.get('/sku/:id', (req, res) => {
  const row = db.fabric_sku.find((k) => k.id === Number(req.params.id))
  if (!row) { res.status(404).json({ error: 'SKU not found' }); return }
  res.json({ data: row })
})

router.get('/admin/series', authMiddleware, (_req, res) => {
  res.json({ data: db.fabric_series.sort((a, b) => a.order_index - b.order_index) })
})

router.post('/admin/series', authMiddleware, upload.single('cover_image'), (req: AuthRequest, res) => {
  const { name, slug, description, tagline, sub_series_data } = req.body
  const cover_image = req.file ? `/uploads/${req.file.filename}` : null
  const newSeries = { id: getNextId(db.fabric_series), name, slug, description, tagline: tagline || '', sub_series_data: sub_series_data || null, cover_image, order_index: db.fabric_series.length }
  db.fabric_series.push(newSeries)
  saveDb()
  res.json({ success: true, id: newSeries.id })
})

router.put('/admin/series/:id', authMiddleware, upload.single('cover_image'), (req: AuthRequest, res) => {
  const idx = db.fabric_series.findIndex((s) => s.id === Number(req.params.id))
  if (idx < 0) { res.status(404).json({ error: 'Not found' }); return }
  const { name, slug, description, tagline, sub_series_data } = req.body
  const cover_image = req.file ? `/uploads/${req.file.filename}` : (req.body.cover_image || db.fabric_series[idx].cover_image)
  db.fabric_series[idx] = { ...db.fabric_series[idx], name, slug, description, tagline: tagline ?? db.fabric_series[idx].tagline, sub_series_data: sub_series_data ?? db.fabric_series[idx].sub_series_data, cover_image }
  saveDb()
  res.json({ success: true })
})

router.delete('/admin/series/:id', authMiddleware, (req: AuthRequest, res) => {
  db.fabric_series = db.fabric_series.filter((s) => s.id !== Number(req.params.id))
  db.fabric_sku = db.fabric_sku.filter((k) => k.series_id !== Number(req.params.id))
  saveDb()
  res.json({ success: true })
})

router.get('/admin/sku', authMiddleware, (req, res) => {
  const seriesId = req.query.series_id
  const rows = seriesId ? db.fabric_sku.filter((k) => k.series_id === Number(seriesId)) : db.fabric_sku
  res.json({ data: rows.sort((a, b) => a.order_index - b.order_index) })
})

router.post('/admin/sku', authMiddleware, upload.single('image'), (req: AuthRequest, res) => {
  const { series_id, name, sku_code, features, specifications } = req.body
  const image = req.file ? `/uploads/${req.file.filename}` : null
  const newSku = { id: getNextId(db.fabric_sku), series_id: Number(series_id), name, sku_code, image, features, specifications, order_index: db.fabric_sku.length }
  db.fabric_sku.push(newSku)
  saveDb()
  res.json({ success: true, id: newSku.id })
})

router.put('/admin/sku/:id', authMiddleware, upload.single('image'), (req: AuthRequest, res) => {
  const idx = db.fabric_sku.findIndex((k) => k.id === Number(req.params.id))
  if (idx < 0) { res.status(404).json({ error: 'Not found' }); return }
  const { series_id, name, sku_code, features, specifications } = req.body
  const image = req.file ? `/uploads/${req.file.filename}` : (req.body.image || db.fabric_sku[idx].image)
  db.fabric_sku[idx] = { ...db.fabric_sku[idx], series_id: Number(series_id), name, sku_code, image, features, specifications }
  saveDb()
  res.json({ success: true })
})

router.delete('/admin/sku/:id', authMiddleware, (req: AuthRequest, res) => {
  db.fabric_sku = db.fabric_sku.filter((k) => k.id !== Number(req.params.id))
  saveDb()
  res.json({ success: true })
})

// Scenes (public)
router.get('/scenes', (_req, res) => {
  res.json({ data: db.fabric_scenes.sort((a, b) => a.order_index - b.order_index) })
})

// Scenes (admin)
router.get('/admin/scenes', authMiddleware, (_req, res) => {
  res.json({ data: db.fabric_scenes.sort((a, b) => a.order_index - b.order_index) })
})

router.post('/admin/scenes', authMiddleware, (req: AuthRequest, res) => {
  const { category, label, series_slug } = req.body
  const newScene = { id: getNextId(db.fabric_scenes), category, label, series_slug, order_index: db.fabric_scenes.length }
  db.fabric_scenes.push(newScene)
  saveDb()
  res.json({ success: true, id: newScene.id })
})

router.put('/admin/scenes/:id', authMiddleware, (req: AuthRequest, res) => {
  const idx = db.fabric_scenes.findIndex((s) => s.id === Number(req.params.id))
  if (idx < 0) { res.status(404).json({ error: 'Not found' }); return }
  const { category, label, series_slug } = req.body
  db.fabric_scenes[idx] = { ...db.fabric_scenes[idx], category, label, series_slug }
  saveDb()
  res.json({ success: true })
})

router.delete('/admin/scenes/:id', authMiddleware, (req: AuthRequest, res) => {
  db.fabric_scenes = db.fabric_scenes.filter((s) => s.id !== Number(req.params.id))
  saveDb()
  res.json({ success: true })
})

export default router
