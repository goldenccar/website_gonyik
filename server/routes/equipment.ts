import { Router } from 'express'
import { db, saveDb, getNextId, sortByOrderIndex, updateById, deleteById, nextOrderIndex } from '../db'
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

function enrichProduct(product: any) {
  const relatedIds = parseRelatedSkuIds(product.related_sku_ids)
  const related_skus = relatedIds.flatMap((id) => {
    const sku = db.fabric_sku.find((item: any) => item.id === id && item.visibility !== 'hidden' && item.status !== 'archived')
    if (!sku) return []
    const series = db.fabric_series.find((item: any) => item.id === sku.series_id)
    if (!series) return []
    return [{ id: sku.id, sku_code: sku.sku_code, name: sku.name, series_slug: series.slug, series_name: series.name }]
  })
  return { ...product, related_sku_ids: relatedIds, related_skus }
}

router.get('/categories', (_req, res) => {
  res.json({ data: db.equipment_categories.sort(sortByOrderIndex) })
})

router.get('/categories/:slug/products', (req, res) => {
  const cat = db.equipment_categories.find((c) => c.slug === req.params.slug)
  if (!cat) { res.status(404).json({ error: 'Category not found' }); return }
  const products = db.equipment_products.filter((p) => p.category_id === cat.id && p.visibility !== 'hidden' && p.status !== 'archived').sort(sortByOrderIndex).map(enrichProduct)
  res.json({ data: { ...cat, products } })
})

router.get('/admin/categories', authMiddleware, (_req, res) => {
  res.json({ data: db.equipment_categories.sort(sortByOrderIndex) })
})

router.post('/admin/categories', authMiddleware, upload.single('bg_image'), (req: AuthRequest, res) => {
  const { name, slug, description, image_fit } = req.body
  const bg_image = req.file ? registerUploadedFile(req.file, 'equipment', '装备分类背景').url : null
  const newCat = {
    id: getNextId(db.equipment_categories),
    name,
    slug,
    description,
    bg_image,
    image_fit: image_fit || 'cover',
    order_index: nextOrderIndex(db.equipment_categories),
  }
  db.equipment_categories.push(newCat)
  saveDb()
  res.json({ success: true, id: newCat.id })
})

router.put('/admin/categories/:id', authMiddleware, upload.single('bg_image'), (req: AuthRequest, res) => {
  const id = Number(req.params.id)
  const existing = db.equipment_categories.find((c) => c.id === id)
  if (!existing) { res.status(404).json({ error: 'Not found' }); return }
  const { name, slug, description, image_fit } = req.body
  const bg_image = req.file ? registerUploadedFile(req.file, 'equipment', '装备分类背景').url : (req.body.bg_image || existing.bg_image)
  updateById(db.equipment_categories, id, {
    name: name ?? existing.name,
    slug: slug ?? existing.slug,
    description: description ?? existing.description,
    bg_image,
    image_fit: image_fit || existing.image_fit || 'cover',
  })
  saveDb()
  res.json({ success: true })
})

router.delete('/admin/categories/:id', authMiddleware, (req: AuthRequest, res) => {
  const id = Number(req.params.id)
  deleteById(db.equipment_categories, id)
  db.equipment_products = db.equipment_products.filter((p) => p.category_id !== id)
  saveDb()
  res.json({ success: true })
})

router.get('/admin/products', authMiddleware, (req, res) => {
  const catId = req.query.category_id
  const rows = catId ? db.equipment_products.filter((p) => p.category_id === Number(catId)) : db.equipment_products
  res.json({ data: rows.sort(sortByOrderIndex) })
})

router.post('/admin/products', authMiddleware, upload.single('image'), (req: AuthRequest, res) => {
  const { category_id, name, features, card_summary, visibility, status, related_sku_ids } = req.body
  const image = req.file ? registerUploadedFile(req.file, 'equipment', '装备产品图片').url : null
  const newProd = {
    id: getNextId(db.equipment_products),
    category_id: Number(category_id),
    name,
    image,
    features,
    card_summary: card_summary || '',
    visibility: visibility || 'public',
    status: status || 'active',
    related_sku_ids: parseRelatedSkuIds(related_sku_ids),
    order_index: nextOrderIndex(db.equipment_products),
  }
  db.equipment_products.push(newProd)
  saveDb()
  res.json({ success: true, id: newProd.id })
})

router.put('/admin/product-order', authMiddleware, (req: AuthRequest, res) => {
  const ids = Array.isArray(req.body.ordered_ids) ? req.body.ordered_ids.map(Number) : []
  ids.forEach((id: number, order_index: number) => updateById(db.equipment_products, id, { order_index }))
  saveDb()
  res.json({ success: true })
})

router.put('/admin/products/:id', authMiddleware, upload.single('image'), (req: AuthRequest, res) => {
  const id = Number(req.params.id)
  const existing = db.equipment_products.find((p) => p.id === id)
  if (!existing) { res.status(404).json({ error: 'Not found' }); return }
  const { category_id, name, features, card_summary, visibility, status, order_index, related_sku_ids } = req.body
  const image = req.file ? registerUploadedFile(req.file, 'equipment', '装备产品图片').url : (req.body.image || existing.image)
  updateById(db.equipment_products, id, {
    category_id: category_id ? Number(category_id) : existing.category_id,
    name: name ?? existing.name,
    image,
    features: features ?? existing.features,
    card_summary: card_summary ?? existing.card_summary,
    visibility: visibility ?? existing.visibility,
    status: status ?? existing.status,
    related_sku_ids: related_sku_ids === undefined ? parseRelatedSkuIds(existing.related_sku_ids) : parseRelatedSkuIds(related_sku_ids),
    order_index: order_index === undefined ? existing.order_index : Number(order_index),
  })
  saveDb()
  res.json({ success: true })
})

router.delete('/admin/products/:id', authMiddleware, (req: AuthRequest, res) => {
  deleteById(db.equipment_products, Number(req.params.id))
  saveDb()
  res.json({ success: true })
})

export default router
