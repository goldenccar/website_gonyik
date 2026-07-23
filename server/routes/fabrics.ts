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
  const slug = String(db.fabric_series.find((series) => series.id === seriesId)?.slug || '')
  if (!slug) return null
  if (slug === 'otter') return 'OT'
  if (slug === 'rayo') return 'RA'
  if (slug === 'kais') return 'KA'
  return slug.replace(/[^a-z0-9]/gi, '').slice(0, 2).toUpperCase() || 'SK'
}

function nextLegacySkuCode(seriesId: number) {
  const prefix = getSeriesCode(seriesId)
  if (!prefix) return null
  const usedCodes = [
    ...db.fabric_sku.map((item) => String(item.sku_code || '')),
    ...(db.product_code_registry || []).map((item) => String(item.sku_code || '')),
  ]
  const max = usedCodes.reduce((current, code) => {
    const match = code.match(new RegExp(`^${prefix}-(\\d+)$`, 'i'))
    return match ? Math.max(current, Number(match[1])) : current
  }, 0)
  return `${prefix}-${String(max + 1).padStart(2, '0')}`
}

function nextSkuOrderIndex(seriesId: number, excludeId?: number) {
  const rows = db.fabric_sku.filter((sku) => sku.series_id === seriesId && sku.id !== excludeId)
  return rows.length ? Math.max(...rows.map((sku) => Number(sku.order_index) || 0)) + 1 : 0
}

function normalizeIdentity(value: unknown) {
  return String(value || '').trim().toLocaleLowerCase()
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

function parsePosition(value: unknown) {
  if (value === '' || value === null || value === undefined) return null
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return null
  return Math.min(9, Math.max(1, Math.round(parsed)))
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
  const removedValues = new Set([existing.key, existing.label, ...(existing.aliases || [])].map(normalizeIdentity))
  let affected = 0
  db.fabric_sku = db.fabric_sku.map((sku) => {
    const features = readFeatureKeys(sku.features)
    const nextFeatures = features.filter((value) => !removedValues.has(normalizeIdentity(value)))
    const summary = readFeatureKeys(sku.card_summary)
    const nextSummary = summary.filter((value) => !removedValues.has(normalizeIdentity(value)))
    const summaryChanged = nextSummary.length !== summary.length
    if (nextFeatures.length === features.length && !summaryChanged) return sku
    affected += 1
    return {
      ...sku,
      features: JSON.stringify(nextFeatures),
      card_summary: summaryChanged ? (nextSummary.length ? JSON.stringify(nextSummary) : '') : sku.card_summary,
    }
  })
  saveDb()
  res.json({ success: true, affected })
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
  const normalizedName = String(name || '').trim()
  const normalizedSlug = String(slug || '').trim().toLowerCase()
  if (!normalizedName || !normalizedSlug) { res.status(400).json({ error: '系列名称和 Slug 不能为空' }); return }
  if (db.fabric_series.some((series) => String(series.slug).toLowerCase() === normalizedSlug)) { res.status(409).json({ error: 'Slug 已被使用' }); return }
  const normalizedHomeImage = home_image && home_image !== 'undefined' ? home_image : null
  const newSeries = {
    id: getNextId(db.fabric_series),
    name: normalizedName,
    slug: normalizedSlug,
    description: String(description || '').trim(),
    tagline: String(tagline || '').trim(),
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
  const normalizedName = name === undefined ? existing.name : String(name).trim()
  const normalizedSlug = slug === undefined ? existing.slug : String(slug).trim().toLowerCase()
  if (!normalizedName || !normalizedSlug) { res.status(400).json({ error: '系列名称和 Slug 不能为空' }); return }
  if (db.fabric_series.some((series) => series.id !== id && String(series.slug).toLowerCase() === normalizedSlug)) { res.status(409).json({ error: 'Slug 已被使用' }); return }
  const normalizedHomeImage = home_image && home_image !== 'undefined' ? home_image : null
  updateById(db.fabric_series, id, {
    name: normalizedName,
    slug: normalizedSlug,
    description: description === undefined ? existing.description : String(description).trim(),
    tagline: tagline === undefined ? existing.tagline : String(tagline).trim(),
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
  if (!db.fabric_series.some((series) => series.id === id)) { res.status(404).json({ error: '系列不存在' }); return }
  const removedSkuIds = new Set(db.fabric_sku.filter((sku) => sku.series_id === id).map((sku) => sku.id))
  deleteById(db.fabric_series, id)
  db.fabric_sku = db.fabric_sku.filter((k) => k.series_id !== id)
  db.equipment_products = db.equipment_products.map((product) => ({
    ...product,
    related_sku_ids: (Array.isArray(product.related_sku_ids) ? product.related_sku_ids : []).map(Number).filter((skuId: number) => !removedSkuIds.has(skuId)),
  }))
  saveDb()
  res.json({ success: true })
})

router.get('/admin/sku', authMiddleware, (req, res) => {
  const seriesId = req.query.series_id
  const rows = seriesId ? db.fabric_sku.filter((k) => k.series_id === Number(seriesId)) : db.fabric_sku
  if (seriesId) { res.json({ data: [...rows].sort(sortByOrderIndex) }); return }
  const seriesOrder = new Map([...db.fabric_series].sort(sortByOrderIndex).map((item, index) => [item.id, index]))
  res.json({ data: [...rows].sort((a, b) => (seriesOrder.get(a.series_id) ?? 999) - (seriesOrder.get(b.series_id) ?? 999) || sortByOrderIndex(a, b)) })
})

router.post('/admin/sku', authMiddleware, upload.single('image'), (req: AuthRequest, res) => {
  const { series_id, name, internal_code, public_name, product_type, features, specifications, card_summary, visibility, status } = req.body
  const targetSeriesId = Number(series_id)
  const publicName = String(public_name || '').trim()
  const internalCode = String(internal_code || '').trim().toUpperCase()
  const externalCode = nextLegacySkuCode(targetSeriesId)
  if (!externalCode) { res.status(400).json({ error: '所属系列不存在' }); return }
  if (!publicName) { res.status(400).json({ error: '对外商品编号不能为空' }); return }
  if (!internalCode) { res.status(400).json({ error: '内部编号不能为空' }); return }
  const registry = db.product_code_registry || []
  if (db.fabric_sku.some((item) => normalizeIdentity(item.public_name) === normalizeIdentity(publicName)) || registry.some((item: any) => normalizeIdentity(item.public_name) === normalizeIdentity(publicName))) { res.status(409).json({ error: '对外商品编号已被使用' }); return }
  if (db.fabric_sku.some((item) => normalizeIdentity(item.internal_code) === normalizeIdentity(internalCode)) || registry.some((item) => normalizeIdentity(item.internal_code) === normalizeIdentity(internalCode))) { res.status(409).json({ error: '内部编号已被使用' }); return }
  const image = req.file ? registerUploadedFile(req.file, 'fabrics', '面料 SKU 图片').url : null
  const newSku = {
    id: getNextId(db.fabric_sku),
    series_id: targetSeriesId,
    name: String(name || publicName).trim(),
    sku_code: externalCode,
    internal_code: internalCode,
    public_name: publicName,
    product_type: String(product_type || '').trim(),
    position_performance: parsePosition(req.body.position_performance),
    position_durability: parsePosition(req.body.position_durability),
    position_handfeel: parsePosition(req.body.position_handfeel),
    image,
    features: features || '[]',
    specifications: specifications || '{}',
    card_summary: card_summary || '',
    visibility: visibility || 'public',
    status: status || 'active',
    order_index: nextSkuOrderIndex(targetSeriesId),
  }
  db.fabric_sku.push(newSku)
  db.product_code_registry = [...registry, { sku_code: externalCode, internal_code: internalCode, public_name: publicName }]
  saveDb()
  res.json({ success: true, id: newSku.id })
})

router.put('/admin/sku-order', authMiddleware, (req: AuthRequest, res) => {
  const ids = Array.isArray(req.body.ordered_ids) ? req.body.ordered_ids.map(Number) : []
  const rows = ids.map((id) => db.fabric_sku.find((item) => item.id === id)).filter(Boolean)
  const seriesIds = new Set(rows.map((item: any) => item.series_id))
  const seriesId = rows[0]?.series_id
  const scopedIds = seriesId === undefined ? [] : db.fabric_sku.filter((item) => item.series_id === seriesId).map((item) => item.id)
  if (rows.length !== ids.length || seriesIds.size !== 1 || ids.length !== scopedIds.length || scopedIds.some((id) => !ids.includes(id))) { res.status(400).json({ error: '排序数据无效' }); return }
  ids.forEach((id: number, order_index: number) => updateById(db.fabric_sku, id, { order_index }))
  saveDb()
  res.json({ success: true })
})

router.put('/admin/sku/:id', authMiddleware, upload.single('image'), (req: AuthRequest, res) => {
  const id = Number(req.params.id)
  const existing = db.fabric_sku.find((k) => k.id === id)
  if (!existing) { res.status(404).json({ error: 'Not found' }); return }
  const { series_id, name, internal_code, public_name, product_type, features, specifications, card_summary, visibility, status, order_index } = req.body
  const externalCode = existing.sku_code
  const internalCode = internal_code === undefined ? existing.internal_code : String(internal_code).trim().toUpperCase()
  const publicName = public_name === undefined ? existing.public_name : String(public_name).trim()
  const targetSeriesId = series_id ? Number(series_id) : existing.series_id
  if (!db.fabric_series.some((series) => series.id === targetSeriesId)) { res.status(400).json({ error: '所属系列不存在' }); return }
  if (!publicName) { res.status(400).json({ error: '对外商品编号不能为空' }); return }
  if (!internalCode) { res.status(400).json({ error: '内部编号不能为空' }); return }
  const publicNameChanged = Boolean(String(existing.public_name || '').trim()) && normalizeIdentity(publicName) !== normalizeIdentity(existing.public_name)
  const internalCodeChanged = Boolean(String(existing.internal_code || '').trim()) && normalizeIdentity(internalCode) !== normalizeIdentity(existing.internal_code)
  if (publicNameChanged || internalCodeChanged) { res.status(409).json({ error: '已使用的对外商品编号和内部编号不可修改；请新建面料型号' }); return }
  if (db.fabric_sku.some((item) => item.id !== id && normalizeIdentity(item.public_name) === normalizeIdentity(publicName))) { res.status(409).json({ error: '对外商品编号已被使用' }); return }
  if (db.fabric_sku.some((item) => item.id !== id && normalizeIdentity(item.internal_code) === normalizeIdentity(internalCode))) { res.status(409).json({ error: '内部编号已被使用' }); return }
  if ((db.product_code_registry || []).some((item) => item.sku_code !== existing.sku_code && normalizeIdentity(item.public_name) === normalizeIdentity(publicName))) { res.status(409).json({ error: '对外商品编号已被使用' }); return }
  if ((db.product_code_registry || []).some((item) => item.sku_code !== existing.sku_code && normalizeIdentity(item.internal_code) === normalizeIdentity(internalCode))) { res.status(409).json({ error: '内部编号已被使用' }); return }
  const removeImage = req.body.remove_image === 'true'
  const image = req.file ? registerUploadedFile(req.file, 'fabrics', '面料 SKU 图片').url : (removeImage ? null : (req.body.image || existing.image))
  updateById(db.fabric_sku, id, {
    series_id: targetSeriesId,
    name: name ?? existing.name,
    sku_code: externalCode,
    internal_code: internalCode,
    public_name: publicName,
    product_type: product_type === undefined ? existing.product_type : String(product_type).trim(),
    position_performance: req.body.position_performance === undefined ? existing.position_performance : parsePosition(req.body.position_performance),
    position_durability: req.body.position_durability === undefined ? existing.position_durability : parsePosition(req.body.position_durability),
    position_handfeel: req.body.position_handfeel === undefined ? existing.position_handfeel : parsePosition(req.body.position_handfeel),
    image,
    features: features ?? existing.features,
    specifications: specifications ?? existing.specifications,
    card_summary: card_summary ?? existing.card_summary,
    visibility: visibility ?? existing.visibility,
    status: status ?? existing.status,
    order_index: order_index === undefined
      ? (targetSeriesId === existing.series_id ? existing.order_index : nextSkuOrderIndex(targetSeriesId, id))
      : Number(order_index),
  })
  const registryEntry = (db.product_code_registry || []).find((item) => item.sku_code === existing.sku_code)
  if (registryEntry) Object.assign(registryEntry, { internal_code: internalCode, public_name: publicName })
  saveDb()
  res.json({ success: true })
})

router.delete('/admin/sku/:id', authMiddleware, (req: AuthRequest, res) => {
  const id = Number(req.params.id)
  if (!db.fabric_sku.some((sku) => sku.id === id)) { res.status(404).json({ error: '面料不存在' }); return }
  deleteById(db.fabric_sku, id)
  db.equipment_products = db.equipment_products.map((product) => ({
    ...product,
    related_sku_ids: (Array.isArray(product.related_sku_ids) ? product.related_sku_ids : []).map(Number).filter((skuId: number) => skuId !== id),
  }))
  saveDb()
  res.json({ success: true })
})

export default router
