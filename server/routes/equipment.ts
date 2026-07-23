import { Router } from 'express'
import { db, saveDb, getNextId, sortByOrderIndex, updateById, deleteById } from '../db'
import { registerUploadedFile } from '../mediaAssets'
import { authMiddleware, AuthRequest } from '../middleware/auth'
import { upload } from '../middleware/upload'

const router = Router()

function parseRelatedSkuIds(value: unknown): number[] {
  const normalize = (items: unknown[]) => [...new Set(items.map(Number).filter((id) => Number.isInteger(id) && id > 0))]
  if (Array.isArray(value)) return normalize(value)
  if (typeof value !== 'string' || !value.trim()) return []
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? normalize(parsed) : []
  } catch {
    return normalize(value.split(','))
  }
}

function validRelatedSkuIds(value: unknown) {
  return parseRelatedSkuIds(value).filter((id) => db.fabric_sku.some((sku) => sku.id === id))
}

function enrichProduct(product: any) {
  const relatedIds = parseRelatedSkuIds(product.related_sku_ids)
  const related_skus = relatedIds.flatMap((id) => {
    const sku = db.fabric_sku.find((item: any) => item.id === id && item.visibility !== 'hidden' && item.status !== 'archived')
    if (!sku) return []
    const series = db.fabric_series.find((item: any) => item.id === sku.series_id)
    if (!series) return []
    return [{ id: sku.id, sku_code: sku.sku_code, public_name: sku.public_name, name: sku.name, series_slug: series.slug, series_name: series.name }]
  })
  return { ...product, related_sku_ids: relatedIds, related_skus }
}

function nextProductOrderIndex(excludeId?: number) {
  const rows = db.equipment_products.filter((product) => product.id !== excludeId)
  return rows.length ? Math.max(...rows.map((product) => Number(product.order_index) || 0)) + 1 : 0
}

router.get('/categories', (_req, res) => {
  res.json({ data: [...db.equipment_categories].sort(sortByOrderIndex) })
})

router.get('/products', (_req, res) => {
  const products = db.equipment_products
    .filter((product) => product.visibility !== 'hidden' && product.status !== 'archived')
    .sort(sortByOrderIndex)
    .map(enrichProduct)
  res.json({ data: { products } })
})

router.get('/categories/:slug/products', (req, res) => {
  const cat = db.equipment_categories.find((c) => c.slug === req.params.slug)
  if (!cat) { res.status(404).json({ error: 'Category not found' }); return }
  const products = db.equipment_products.filter((p) => p.category_id === cat.id && p.visibility !== 'hidden' && p.status !== 'archived').sort(sortByOrderIndex).map(enrichProduct)
  res.json({ data: { ...cat, products } })
})

router.get('/admin/categories', authMiddleware, (_req, res) => {
  res.json({ data: [...db.equipment_categories].sort(sortByOrderIndex) })
})

router.get('/admin/products', authMiddleware, (req, res) => {
  const catId = req.query.category_id
  const rows = catId ? db.equipment_products.filter((p) => p.category_id === Number(catId)) : db.equipment_products
  res.json({ data: [...rows].sort(sortByOrderIndex) })
})

router.post('/admin/products', authMiddleware, upload.single('image'), (req: AuthRequest, res) => {
  const { category_id, name, features, card_summary, visibility, status, related_sku_ids } = req.body
  const categoryId = Number(category_id)
  if (!db.equipment_categories.some((category) => category.id === categoryId)) { res.status(400).json({ error: '所属分类不存在' }); return }
  if (!String(name || '').trim()) { res.status(400).json({ error: '产品名不能为空' }); return }
  const image = req.file ? registerUploadedFile(req.file, 'equipment', '装备产品图片').url : null
  const newProd = {
    id: getNextId(db.equipment_products),
    category_id: categoryId,
    name: String(name).trim(),
    image,
    features,
    card_summary: card_summary || '',
    visibility: visibility || 'public',
    status: status || 'active',
    related_sku_ids: validRelatedSkuIds(related_sku_ids),
    order_index: nextProductOrderIndex(),
  }
  db.equipment_products.push(newProd)
  saveDb()
  res.json({ success: true, id: newProd.id })
})

router.put('/admin/product-order', authMiddleware, (req: AuthRequest, res) => {
  const ids = Array.isArray(req.body.ordered_ids) ? req.body.ordered_ids.map(Number) : []
  const rows = ids.map((id) => db.equipment_products.find((item) => item.id === id)).filter(Boolean)
  const allIds = db.equipment_products.map((item) => item.id)
  if (rows.length !== ids.length || ids.length !== allIds.length || allIds.some((id) => !ids.includes(id))) { res.status(400).json({ error: '排序数据无效' }); return }
  ids.forEach((id: number, order_index: number) => updateById(db.equipment_products, id, { order_index }))
  saveDb()
  res.json({ success: true })
})

router.put('/admin/products/:id', authMiddleware, upload.single('image'), (req: AuthRequest, res) => {
  const id = Number(req.params.id)
  const existing = db.equipment_products.find((p) => p.id === id)
  if (!existing) { res.status(404).json({ error: 'Not found' }); return }
  const { category_id, name, features, card_summary, visibility, status, order_index, related_sku_ids } = req.body
  const targetCategoryId = category_id ? Number(category_id) : existing.category_id
  if (!db.equipment_categories.some((category) => category.id === targetCategoryId)) { res.status(400).json({ error: '所属分类不存在' }); return }
  if (name !== undefined && !String(name).trim()) { res.status(400).json({ error: '产品名不能为空' }); return }
  const removeImage = req.body.remove_image === 'true'
  const image = req.file ? registerUploadedFile(req.file, 'equipment', '装备产品图片').url : (removeImage ? null : existing.image)
  updateById(db.equipment_products, id, {
    category_id: targetCategoryId,
    name: name === undefined ? existing.name : String(name).trim(),
    image,
    features: features ?? existing.features,
    card_summary: card_summary ?? existing.card_summary,
    visibility: visibility ?? existing.visibility,
    status: status ?? existing.status,
    related_sku_ids: related_sku_ids === undefined ? validRelatedSkuIds(existing.related_sku_ids) : validRelatedSkuIds(related_sku_ids),
    order_index: order_index === undefined ? existing.order_index : Number(order_index),
  })
  saveDb()
  res.json({ success: true })
})

router.delete('/admin/products/:id', authMiddleware, (req: AuthRequest, res) => {
  const id = Number(req.params.id)
  if (!db.equipment_products.some((product) => product.id === id)) { res.status(404).json({ error: '产品不存在' }); return }
  deleteById(db.equipment_products, id)
  saveDb()
  res.json({ success: true })
})

export default router
