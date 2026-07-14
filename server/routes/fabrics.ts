import { Router } from 'express'
import { db, saveDb, getNextId, sortByOrderIndex, updateById, deleteById, uploadUrl, nextOrderIndex } from '../db'
import { authMiddleware, AuthRequest } from '../middleware/auth'
import { upload } from '../middleware/upload'
import { FABRIC_CAPABILITY_THEMES } from '../../src/config/fabricCapabilities'

const router = Router()
const capabilityThemes = new Set(FABRIC_CAPABILITY_THEMES.map((item) => item.value))

function readFeatureKeys(value: unknown) {
  if (Array.isArray(value)) return value.map(String)
  if (typeof value !== 'string') return []
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed.map(String) : []
  } catch {
    return value.split(/[,、·]/).map((item) => item.trim()).filter(Boolean)
  }
}

router.get('/capabilities', (_req, res) => {
  res.json({ data: db.fabric_capabilities.sort(sortByOrderIndex) })
})

router.get('/admin/capabilities', authMiddleware, (_req, res) => {
  res.json({ data: db.fabric_capabilities.sort(sortByOrderIndex) })
})

router.post('/admin/capabilities', authMiddleware, (req: AuthRequest, res) => {
  const label = String(req.body.label || '').trim()
  const theme = capabilityThemes.has(req.body.theme) ? req.body.theme : 'neutral'
  if (!label) { res.status(400).json({ error: 'Label is required' }); return }
  if (db.fabric_capabilities.some((item) => String(item.label).toLowerCase() === label.toLowerCase())) { res.status(409).json({ error: 'Label already exists' }); return }
  const id = getNextId(db.fabric_capabilities)
  const capability = { id, key: `custom-${id}`, label, theme, aliases: [], order_index: nextOrderIndex(db.fabric_capabilities) }
  db.fabric_capabilities.push(capability)
  saveDb()
  res.json({ success: true, data: capability })
})

router.put('/admin/capabilities/:id', authMiddleware, (req: AuthRequest, res) => {
  const id = Number(req.params.id)
  const existing = db.fabric_capabilities.find((item) => item.id === id)
  if (!existing) { res.status(404).json({ error: 'Not found' }); return }
  const label = req.body.label === undefined ? existing.label : String(req.body.label).trim()
  if (!label) { res.status(400).json({ error: 'Label is required' }); return }
  if (db.fabric_capabilities.some((item) => item.id !== id && String(item.label).toLowerCase() === label.toLowerCase())) { res.status(409).json({ error: 'Label already exists' }); return }
  updateById(db.fabric_capabilities, id, {
    label,
    theme: capabilityThemes.has(req.body.theme) ? req.body.theme : existing.theme,
  })
  saveDb()
  res.json({ success: true })
})

router.delete('/admin/capabilities/:id', authMiddleware, (req: AuthRequest, res) => {
  const id = Number(req.params.id)
  const existing = db.fabric_capabilities.find((item) => item.id === id)
  if (!existing) { res.status(404).json({ error: 'Not found' }); return }
  deleteById(db.fabric_capabilities, id)
  db.fabric_sku = db.fabric_sku.map((sku) => ({
    ...sku,
    features: JSON.stringify(readFeatureKeys(sku.features).filter((key) => key !== existing.key)),
  }))
  saveDb()
  res.json({ success: true })
})

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
  const skus = db.fabric_sku.filter((k) => k.series_id === series.id && k.visibility !== 'hidden' && k.status !== 'archived').sort(sortByOrderIndex)
  res.json({ data: { ...series, skus, capabilities: db.fabric_capabilities.sort(sortByOrderIndex) } })
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
  const { name, slug, description, tagline, sub_series_data, home_image, home_badge_image } = req.body
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
    home_badge_image: home_badge_image || null,
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
  const { name, slug, description, tagline, sub_series_data, home_image, home_badge_image } = req.body
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
    home_badge_image: home_badge_image ?? existing.home_badge_image,
  })
  saveDb()
  res.json({ success: true })
})

router.delete('/admin/series/:id/home-image', authMiddleware, (req: AuthRequest, res) => {
  const id = Number(req.params.id)
  const existing = db.fabric_series.find((s) => s.id === id)
  if (!existing) { res.status(404).json({ error: 'Not found' }); return }
  updateById(db.fabric_series, id, { home_image: null })
  saveDb()
  res.json({ success: true })
})

router.delete('/admin/series/:id/home-badge', authMiddleware, (req: AuthRequest, res) => {
  const id = Number(req.params.id)
  const existing = db.fabric_series.find((s) => s.id === id)
  if (!existing) { res.status(404).json({ error: 'Not found' }); return }
  updateById(db.fabric_series, id, { home_badge_image: null })
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
  const { series_id, name, sku_code, features, specifications, card_summary, visibility, status } = req.body
  const image = req.file ? uploadUrl(req.file) : null
  const newSku = {
    id: getNextId(db.fabric_sku),
    series_id: Number(series_id),
    name,
    sku_code,
    image,
    features,
    specifications,
    card_summary: card_summary || '',
    visibility: visibility || 'public',
    status: status || 'active',
    order_index: nextOrderIndex(db.fabric_sku),
  }
  db.fabric_sku.push(newSku)
  saveDb()
  res.json({ success: true, id: newSku.id })
})

router.put('/admin/sku-order', authMiddleware, (req: AuthRequest, res) => {
  const ids = Array.isArray(req.body.ordered_ids) ? req.body.ordered_ids.map(Number) : []
  ids.forEach((id: number, order_index: number) => updateById(db.fabric_sku, id, { order_index }))
  saveDb()
  res.json({ success: true })
})

router.put('/admin/sku/:id', authMiddleware, upload.single('image'), (req: AuthRequest, res) => {
  const id = Number(req.params.id)
  const existing = db.fabric_sku.find((k) => k.id === id)
  if (!existing) { res.status(404).json({ error: 'Not found' }); return }
  const { series_id, name, sku_code, features, specifications, card_summary, visibility, status, order_index } = req.body
  const image = req.file ? uploadUrl(req.file) : (req.body.image || existing.image)
  updateById(db.fabric_sku, id, {
    series_id: series_id ? Number(series_id) : existing.series_id,
    name: name ?? existing.name,
    sku_code: sku_code ?? existing.sku_code,
    image,
    features: features ?? existing.features,
    specifications: specifications ?? existing.specifications,
    card_summary: card_summary ?? existing.card_summary,
    visibility: visibility ?? existing.visibility,
    status: status ?? existing.status,
    order_index: order_index === undefined ? existing.order_index : Number(order_index),
  })
  saveDb()
  res.json({ success: true })
})

router.delete('/admin/sku/:id', authMiddleware, (req: AuthRequest, res) => {
  deleteById(db.fabric_sku, Number(req.params.id))
  saveDb()
  res.json({ success: true })
})

export default router
