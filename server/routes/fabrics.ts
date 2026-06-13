import { Router } from 'express'
import { db, saveDb, getNextId, sortByOrderIndex, updateById, deleteById, uploadUrl, nextOrderIndex } from '../db'
import { authMiddleware, AuthRequest } from '../middleware/auth'
import { upload } from '../middleware/upload'

const router = Router()

router.get('/series', (_req, res) => {
  res.json({ data: db.fabric_series.sort(sortByOrderIndex) })
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
  const skus = db.fabric_sku.filter((k) => k.series_id === series.id).sort(sortByOrderIndex)
  res.json({ data: { ...series, skus } })
})

router.get('/sku/:id', (req, res) => {
  const row = db.fabric_sku.find((k) => k.id === Number(req.params.id))
  if (!row) { res.status(404).json({ error: 'SKU not found' }); return }
  res.json({ data: row })
})

router.get('/admin/series', authMiddleware, (_req, res) => {
  const series = db.fabric_series.sort(sortByOrderIndex).map((s) => {
    let sub_series: any[] = []
    if (s.sub_series_data) {
      try { sub_series = JSON.parse(s.sub_series_data) } catch { /* ignore */ }
    }
    return { ...s, sub_series }
  })
  res.json({ data: series })
})

router.post('/admin/series', authMiddleware, upload.single('cover_image'), (req: AuthRequest, res) => {
  const { name, slug, description, tagline, sub_series_data, home_image } = req.body
  const cover_image = req.file ? uploadUrl(req.file) : null
  const normalizedHomeImage = home_image && home_image !== 'undefined' ? home_image : null
  const newSeries = {
    id: getNextId(db.fabric_series),
    name,
    slug,
    description,
    tagline: tagline || '',
    sub_series_data: sub_series_data || null,
    cover_image,
    home_image: normalizedHomeImage,
    order_index: nextOrderIndex(db.fabric_series),
  }
  db.fabric_series.push(newSeries)
  saveDb()
  res.json({ success: true, id: newSeries.id })
})

router.put('/admin/series/:id', authMiddleware, upload.single('cover_image'), (req: AuthRequest, res) => {
  const id = Number(req.params.id)
  const existing = db.fabric_series.find((s) => s.id === id)
  if (!existing) { res.status(404).json({ error: 'Not found' }); return }
  const { name, slug, description, tagline, sub_series_data, home_image } = req.body
  const cover_image = req.file ? uploadUrl(req.file) : (req.body.cover_image || existing.cover_image)
  const normalizedHomeImage = home_image && home_image !== 'undefined' ? home_image : null
  updateById(db.fabric_series, id, {
    name: name ?? existing.name,
    slug: slug ?? existing.slug,
    description: description ?? existing.description,
    tagline: tagline ?? existing.tagline,
    sub_series_data: sub_series_data ?? existing.sub_series_data,
    cover_image,
    home_image: normalizedHomeImage ?? existing.home_image,
  })
  saveDb()
  res.json({ success: true })
})

router.delete('/admin/series/:id', authMiddleware, (req: AuthRequest, res) => {
  const id = Number(req.params.id)
  deleteById(db.fabric_series, id)
  db.fabric_sku = db.fabric_sku.filter((k) => k.series_id !== id)
  saveDb()
  res.json({ success: true })
})

router.get('/admin/sku', authMiddleware, (req, res) => {
  const seriesId = req.query.series_id
  const rows = seriesId ? db.fabric_sku.filter((k) => k.series_id === Number(seriesId)) : db.fabric_sku
  res.json({ data: rows.sort(sortByOrderIndex) })
})

router.post('/admin/sku', authMiddleware, upload.single('image'), (req: AuthRequest, res) => {
  const { series_id, name, sku_code, features, specifications } = req.body
  const image = req.file ? uploadUrl(req.file) : null
  const newSku = {
    id: getNextId(db.fabric_sku),
    series_id: Number(series_id),
    name,
    sku_code,
    image,
    features,
    specifications,
    order_index: nextOrderIndex(db.fabric_sku),
  }
  db.fabric_sku.push(newSku)
  saveDb()
  res.json({ success: true, id: newSku.id })
})

router.put('/admin/sku/:id', authMiddleware, upload.single('image'), (req: AuthRequest, res) => {
  const id = Number(req.params.id)
  const existing = db.fabric_sku.find((k) => k.id === id)
  if (!existing) { res.status(404).json({ error: 'Not found' }); return }
  const { series_id, name, sku_code, features, specifications } = req.body
  const image = req.file ? uploadUrl(req.file) : (req.body.image || existing.image)
  updateById(db.fabric_sku, id, {
    series_id: series_id ? Number(series_id) : existing.series_id,
    name: name ?? existing.name,
    sku_code: sku_code ?? existing.sku_code,
    image,
    features: features ?? existing.features,
    specifications: specifications ?? existing.specifications,
  })
  saveDb()
  res.json({ success: true })
})

router.delete('/admin/sku/:id', authMiddleware, (req: AuthRequest, res) => {
  deleteById(db.fabric_sku, Number(req.params.id))
  saveDb()
  res.json({ success: true })
})

// Scenes (public)
router.get('/scenes', (_req, res) => {
  res.json({ data: db.fabric_scenes.sort(sortByOrderIndex) })
})

// Scenes (admin)
router.get('/admin/scenes', authMiddleware, (_req, res) => {
  res.json({ data: db.fabric_scenes.sort(sortByOrderIndex) })
})

router.post('/admin/scenes', authMiddleware, (req: AuthRequest, res) => {
  const { category, label, series_slug } = req.body
  const newScene = {
    id: getNextId(db.fabric_scenes),
    category,
    label,
    series_slug,
    order_index: nextOrderIndex(db.fabric_scenes),
  }
  db.fabric_scenes.push(newScene)
  saveDb()
  res.json({ success: true, id: newScene.id })
})

router.put('/admin/scenes/:id', authMiddleware, (req: AuthRequest, res) => {
  const ok = updateById(db.fabric_scenes, Number(req.params.id), req.body)
  if (!ok) { res.status(404).json({ error: 'Not found' }); return }
  saveDb()
  res.json({ success: true })
})

router.delete('/admin/scenes/:id', authMiddleware, (req: AuthRequest, res) => {
  deleteById(db.fabric_scenes, Number(req.params.id))
  saveDb()
  res.json({ success: true })
})

// Digital Assets (public)
router.get('/digital-assets', (req, res) => {
  const seriesSlug = req.query.series_slug as string | undefined
  const rows = seriesSlug
    ? db.digital_assets.filter((a) => a.series_slug === seriesSlug)
    : db.digital_assets
  res.json({ data: rows.sort(sortByOrderIndex) })
})

// Digital Assets (admin)
router.get('/admin/digital-assets', authMiddleware, (_req, res) => {
  res.json({ data: db.digital_assets.sort(sortByOrderIndex) })
})

router.post('/admin/digital-assets', authMiddleware, upload.single('file'), (req: AuthRequest, res) => {
  const { series_slug, file_name, file_type } = req.body
  const file_url = req.file ? uploadUrl(req.file) : null
  const newAsset = {
    id: getNextId(db.digital_assets),
    series_slug,
    file_name: file_name || (req.file ? req.file.originalname : ''),
    file_url,
    file_type: file_type || (req.file ? req.file.mimetype : ''),
    order_index: nextOrderIndex(db.digital_assets),
  }
  db.digital_assets.push(newAsset)
  saveDb()
  res.json({ success: true, id: newAsset.id })
})

router.put('/admin/digital-assets/:id', authMiddleware, upload.single('file'), (req: AuthRequest, res) => {
  const id = Number(req.params.id)
  const existing = db.digital_assets.find((a) => a.id === id)
  const { series_slug, file_name, file_type } = req.body
  const file_url = req.file ? uploadUrl(req.file) : (req.body.file_url || existing?.file_url)
  const ok = updateById(db.digital_assets, id, {
    series_slug: series_slug || existing?.series_slug,
    file_name: file_name || existing?.file_name,
    file_url,
    file_type: file_type || existing?.file_type,
  })
  if (!ok) { res.status(404).json({ error: 'Not found' }); return }
  saveDb()
  res.json({ success: true })
})

router.delete('/admin/digital-assets/:id', authMiddleware, (req: AuthRequest, res) => {
  deleteById(db.digital_assets, Number(req.params.id))
  saveDb()
  res.json({ success: true })
})

export default router
