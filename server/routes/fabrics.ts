import { Router } from 'express'
import { db, saveDb, getNextId, sortByOrderIndex, updateById, deleteById, nextOrderIndex } from '../db'
import { registerUploadedFile } from '../mediaAssets'
import { authMiddleware, AuthRequest } from '../middleware/auth'
import { upload } from '../middleware/upload'
import { FABRIC_CAPABILITY_THEMES } from '../../src/config/fabricCapabilities'

const router = Router()
const capabilityThemes = new Set(FABRIC_CAPABILITY_THEMES.map((item) => item.value))

function toPublicSku(sku: any) {
  const { internal_code: _internalCode, ...publicSku } = sku
  return publicSku
}

function getSeriesCode(seriesId: number) {
  const slug = db.fabric_series.find((series) => series.id === seriesId)?.slug
  return slug === 'otter' ? 'OT' : slug === 'rayo' ? 'RA' : slug === 'kais' ? 'KA' : null
}

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
  const series = db.fabric_series.find((s) => s.slug === slug)
  if (!series) { res.status(404).json({ error: 'Series not found' }); return }
  const skus = db.fabric_sku.filter((k) => k.series_id === series.id && k.visibility !== 'hidden' && k.status !== 'archived').sort(sortByOrderIndex).map(toPublicSku)
  res.json({ data: { ...series, skus, capabilities: db.fabric_capabilities.sort(sortByOrderIndex) } })
})

router.get('/sku/:id', (req, res) => {
  const row = db.fabric_sku.find((k) => k.id === Number(req.params.id))
  if (!row) { res.status(404).json({ error: 'SKU not found' }); return }
  res.json({ data: toPublicSku(row) })
})

router.get('/admin/series', authMiddleware, (_req, res) => {
  res.json({ data: db.fabric_series.sort(sortByOrderIndex) })
})

router.post('/admin/series', authMiddleware, (req: AuthRequest, res) => {
  const { name, slug, description, tagline, home_image, home_badge_image } = req.body
  const normalizedHomeImage = home_image && home_image !== 'undefined' ? home_image : null
  const newSeries = {
    id: getNextId(db.fabric_series),
    name,
    slug,
    description,
    tagline: tagline || '',
    home_image: normalizedHomeImage,
    home_badge_image: home_badge_image || null,
    order_index: nextOrderIndex(db.fabric_series),
  }
  db.fabric_series.push(newSeries)
  saveDb()
  res.json({ success: true, id: newSeries.id })
})

router.put('/admin/series/:id', authMiddleware, (req: AuthRequest, res) => {
  const id = Number(req.params.id)
  const existing = db.fabric_series.find((s) => s.id === id)
  if (!existing) { res.status(404).json({ error: 'Not found' }); return }
  const { name, slug, description, tagline, home_image, home_badge_image } = req.body
  const normalizedHomeImage = home_image && home_image !== 'undefined' ? home_image : null
  updateById(db.fabric_series, id, {
    name: name ?? existing.name,
    slug: slug ?? existing.slug,
    description: description ?? existing.description,
    tagline: tagline ?? existing.tagline,
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
  const { series_id, name, sku_code, internal_code, features, specifications, card_summary, visibility, status } = req.body
  const externalCode = String(sku_code || '').trim().toUpperCase()
  const internalCode = String(internal_code || '').trim().toUpperCase()
  const seriesCode = getSeriesCode(Number(series_id))
  if (!/^(OT|RA|KA)-\d{2}$/.test(externalCode)) { res.status(400).json({ error: '对外简码必须使用 OT-01、RA-01 或 KA-01 格式' }); return }
  if (!internalCode) { res.status(400).json({ error: '内部结构码不能为空' }); return }
  if (!seriesCode || !externalCode.startsWith(`${seriesCode}-`) || !internalCode.startsWith(seriesCode)) { res.status(400).json({ error: '对外简码和内部结构码必须与所属系列一致' }); return }
  if ((db.product_code_registry || []).some((item) => item.sku_code === externalCode || item.internal_code === internalCode)) { res.status(409).json({ error: '对外简码或内部结构码已被使用，不得重新分配' }); return }
  const image = req.file ? registerUploadedFile(req.file, 'fabrics', '面料 SKU 图片').url : null
  const newSku = {
    id: getNextId(db.fabric_sku),
    series_id: Number(series_id),
    name,
    sku_code: externalCode,
    internal_code: internalCode,
    image,
    features,
    specifications,
    card_summary: card_summary || '',
    visibility: visibility || 'public',
    status: status || 'active',
    order_index: nextOrderIndex(db.fabric_sku),
  }
  db.fabric_sku.push(newSku)
  db.product_code_registry = [...(db.product_code_registry || []), { sku_code: externalCode, internal_code: internalCode }]
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
  const { series_id, name, sku_code, internal_code, features, specifications, card_summary, visibility, status, order_index } = req.body
  const externalCode = sku_code === undefined ? existing.sku_code : String(sku_code).trim().toUpperCase()
  const internalCode = internal_code === undefined ? existing.internal_code : String(internal_code).trim().toUpperCase()
  const targetSeriesId = series_id ? Number(series_id) : existing.series_id
  const seriesCode = getSeriesCode(targetSeriesId)
  if (!/^(OT|RA|KA)-\d{2}$/.test(externalCode)) { res.status(400).json({ error: '对外简码必须使用 OT-01、RA-01 或 KA-01 格式' }); return }
  if (!internalCode) { res.status(400).json({ error: '内部结构码不能为空' }); return }
  if (externalCode !== existing.sku_code || internalCode !== existing.internal_code) { res.status(409).json({ error: '已使用的产品代码不得修改；结构发生实质变化时请新建 SKU' }); return }
  if (!seriesCode || !externalCode.startsWith(`${seriesCode}-`) || !internalCode.startsWith(seriesCode)) { res.status(400).json({ error: '对外简码和内部结构码必须与所属系列一致' }); return }
  if (db.fabric_sku.some((item) => item.id !== id && (item.sku_code === externalCode || item.internal_code === internalCode))) { res.status(409).json({ error: '对外简码或内部结构码已被使用' }); return }
  const image = req.file ? registerUploadedFile(req.file, 'fabrics', '面料 SKU 图片').url : (req.body.image || existing.image)
  updateById(db.fabric_sku, id, {
    series_id: targetSeriesId,
    name: name ?? existing.name,
    sku_code: externalCode,
    internal_code: internalCode,
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
