import { Router } from 'express'
import { db, saveDb, getNextId, sortByOrderIndex, updateById, deleteById } from '../db'
import { registerUploadedFile } from '../mediaAssets'
import { authMiddleware, AuthRequest } from '../middleware/auth'
import { upload } from '../middleware/upload'
import { normalizeMaterialPlatforms } from '../../src/config/materialPlatforms'
import { pageVisible, requestMarket } from '../market'

const router = Router()

function parseIdList(value: unknown): number[] {
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
  return parseIdList(value).filter((id) => db.fabric_sku.some((sku) => sku.id === id))
}

function validCategoryIds(value: unknown) {
  return parseIdList(value).filter((id) => db.equipment_categories.some((category) => category.id === id))
}

function productCategoryIds(productId: number) {
  return db.equipment_product_categories
    .filter((mapping) => mapping.product_id === productId)
    .map((mapping) => mapping.category_id)
}

function setProductCategories(productId: number, categoryIds: number[]) {
  db.equipment_product_categories = db.equipment_product_categories.filter((mapping) => mapping.product_id !== productId)
  db.equipment_product_categories.push(...categoryIds.map((category_id) => ({ product_id: productId, category_id })))
}

function visibleCategories() {
  const visibleRoots = db.equipment_categories.filter((category) => category.parent_id == null && category.visibility !== 'hidden')
  const visibleRootIds = new Set(visibleRoots.map((category) => category.id))
  return db.equipment_categories
    .filter((category) => category.visibility !== 'hidden' && (category.parent_id == null || visibleRootIds.has(category.parent_id)))
    .sort((a, b) => {
      if (a.parent_id === b.parent_id) return sortByOrderIndex(a, b) || a.id - b.id
      if (a.parent_id == null) return -1
      if (b.parent_id == null) return 1
      return a.parent_id - b.parent_id || sortByOrderIndex(a, b)
    })
}

function enrichProduct(product: any, publicOnly = false) {
  const allowedCategories = publicOnly ? visibleCategories() : db.equipment_categories
  const allowedCategoryIds = new Set(allowedCategories.map((category) => category.id))
  const category_ids = productCategoryIds(product.id).filter((id) => allowedCategoryIds.has(id))
  const categories = category_ids.flatMap((id) => {
    const category = allowedCategories.find((item) => item.id === id)
    return category ? [category] : []
  })
  const related_sku_ids = parseIdList(product.related_sku_ids)
  const related_skus = related_sku_ids.flatMap((id) => {
    const sku = db.fabric_sku.find((item: any) => item.id === id && (!publicOnly || (item.visibility !== 'hidden' && item.status !== 'archived')))
    if (!sku) return []
    const series = db.fabric_series.find((item: any) => item.id === sku.series_id)
    if (!series) return []
    return [{ id: sku.id, sku_code: sku.sku_code, public_name: sku.public_name, name: sku.name, series_slug: series.slug, series_name: series.name }]
  })
  return { ...product, material_platforms: normalizeMaterialPlatforms(product.material_platforms), category_ids, categories, related_sku_ids, related_skus }
}

function nextProductOrderIndex(excludeId?: number) {
  const rows = db.equipment_products.filter((product) => product.id !== excludeId)
  return rows.length ? Math.max(...rows.map((product) => Number(product.order_index) || 0)) + 1 : 0
}

function nextCategoryOrderIndex(parentId: number | null, excludeId?: number) {
  const rows = db.equipment_categories.filter((category) => (category.parent_id ?? null) === parentId && category.id !== excludeId)
  return rows.length ? Math.max(...rows.map((category) => Number(category.order_index) || 0)) + 1 : 0
}

function publicRootCount(excludeId?: number) {
  return db.equipment_categories.filter((category) => category.id !== excludeId && category.parent_id == null && category.visibility !== 'hidden').length
}

function categoryPayload(category: any) {
  const countedCategoryIds = category.parent_id == null
    ? new Set([category.id, ...db.equipment_categories.filter((item) => item.parent_id === category.id).map((item) => item.id)])
    : new Set([category.id])
  const productCount = new Set(
    db.equipment_product_categories
      .filter((mapping) => countedCategoryIds.has(mapping.category_id))
      .map((mapping) => mapping.product_id),
  ).size
  return {
    ...category,
    parent_id: category.parent_id ?? null,
    visibility: category.visibility || 'public',
    product_count: productCount,
  }
}

function validateSlug(value: unknown, excludeId?: number) {
  const slug = String(value || '').trim().toLowerCase()
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return { error: '标识只能使用小写字母、数字和短横线' }
  if (db.equipment_categories.some((category) => category.id !== excludeId && category.slug === slug)) return { error: '分类标识已存在' }
  return { slug }
}

router.get('/categories', (req, res) => {
  if (!pageVisible('equipment', requestMarket(req))) { res.json({ data: [] }); return }
  res.json({ data: visibleCategories().map(categoryPayload) })
})

router.get('/products', (req, res) => {
  if (!pageVisible('equipment', requestMarket(req))) { res.json({ data: { products: [] } }); return }
  const products = db.equipment_products
    .filter((product) => product.visibility !== 'hidden' && product.status !== 'archived')
    .sort(sortByOrderIndex)
    .map((product) => enrichProduct(product, true))
    .filter((product) => product.category_ids.length > 0)
  res.json({ data: { products } })
})

router.get('/admin/categories', authMiddleware, (_req, res) => {
  const rows = [...db.equipment_categories]
    .sort((a, b) => (a.parent_id ?? 0) - (b.parent_id ?? 0) || sortByOrderIndex(a, b) || a.id - b.id)
    .map(categoryPayload)
  res.json({ data: rows })
})

router.post('/admin/categories', authMiddleware, (req: AuthRequest, res) => {
  const name = String(req.body.name || '').trim()
  if (!name) { res.status(400).json({ error: '分类名称不能为空' }); return }
  const slugResult = validateSlug(req.body.slug)
  if (slugResult.error) { res.status(400).json({ error: slugResult.error }); return }
  const parentId = req.body.parent_id ? Number(req.body.parent_id) : null
  if (parentId !== null) {
    const parent = db.equipment_categories.find((category) => category.id === parentId)
    if (!parent || parent.parent_id != null) { res.status(400).json({ error: '二级分类只能归属于一级分类' }); return }
  }
  const category = {
    id: getNextId(db.equipment_categories),
    parent_id: parentId,
    name,
    slug: slugResult.slug,
    description: String(req.body.description || '').trim(),
    visibility: req.body.visibility === 'hidden' ? 'hidden' : 'public',
    order_index: nextCategoryOrderIndex(parentId),
  }
  db.equipment_categories.push(category)
  saveDb()
  res.json({ success: true, id: category.id })
})

router.put('/admin/categories/order', authMiddleware, (req: AuthRequest, res) => {
  const parentId = req.body.parent_id === null || req.body.parent_id === '' ? null : Number(req.body.parent_id)
  const ids = parseIdList(req.body.ordered_ids)
  const siblings = db.equipment_categories.filter((category) => (category.parent_id ?? null) === parentId)
  const siblingIds = siblings.map((category) => category.id)
  if (ids.length !== siblingIds.length || siblingIds.some((id) => !ids.includes(id))) {
    res.status(400).json({ error: '分类排序数据无效' }); return
  }
  ids.forEach((id, order_index) => updateById(db.equipment_categories, id, { order_index }))
  saveDb()
  res.json({ success: true })
})

router.put('/admin/categories/:id', authMiddleware, (req: AuthRequest, res) => {
  const id = Number(req.params.id)
  const existing = db.equipment_categories.find((category) => category.id === id)
  if (!existing) { res.status(404).json({ error: '分类不存在' }); return }
  const name = req.body.name === undefined ? existing.name : String(req.body.name).trim()
  if (!name) { res.status(400).json({ error: '分类名称不能为空' }); return }
  const slugResult = validateSlug(req.body.slug === undefined ? existing.slug : req.body.slug, id)
  if (slugResult.error) { res.status(400).json({ error: slugResult.error }); return }

  const parentId = req.body.parent_id === undefined
    ? (existing.parent_id ?? null)
    : (req.body.parent_id === null || req.body.parent_id === '' ? null : Number(req.body.parent_id))
  if (parentId === id) { res.status(400).json({ error: '分类不能归属于自身' }); return }
  if (parentId !== null) {
    const parent = db.equipment_categories.find((category) => category.id === parentId)
    if (!parent || parent.parent_id != null) { res.status(400).json({ error: '二级分类只能归属于一级分类' }); return }
    if (db.equipment_categories.some((category) => category.parent_id === id)) {
      res.status(400).json({ error: '存在二级分类的一级分类不能直接改为二级分类' }); return
    }
  }

  const visibility = req.body.visibility === undefined ? (existing.visibility || 'public') : (req.body.visibility === 'hidden' ? 'hidden' : 'public')
  const removesVisibleRoot = existing.parent_id == null && existing.visibility !== 'hidden' && (parentId !== null || visibility === 'hidden')
  if (removesVisibleRoot && publicRootCount(id) === 0) {
    res.status(400).json({ error: '终端装备页至少需要保留一个显示中的一级分类' }); return
  }
  const parentChanged = (existing.parent_id ?? null) !== parentId
  updateById(db.equipment_categories, id, {
    parent_id: parentId,
    name,
    slug: slugResult.slug,
    description: req.body.description === undefined ? existing.description : String(req.body.description || '').trim(),
    visibility,
    order_index: parentChanged ? nextCategoryOrderIndex(parentId, id) : existing.order_index,
  })
  saveDb()
  res.json({ success: true })
})

router.delete('/admin/categories/:id', authMiddleware, (req: AuthRequest, res) => {
  const id = Number(req.params.id)
  const existing = db.equipment_categories.find((category) => category.id === id)
  if (!existing) { res.status(404).json({ error: '分类不存在' }); return }
  if (db.equipment_categories.some((category) => category.parent_id === id)) {
    res.status(400).json({ error: '请先移动或删除该一级分类下的二级分类' }); return
  }
  if (existing.parent_id == null && existing.visibility !== 'hidden' && publicRootCount(id) === 0) {
    res.status(400).json({ error: '终端装备页至少需要保留一个显示中的一级分类' }); return
  }
  const detachedCount = db.equipment_product_categories.filter((mapping) => mapping.category_id === id).length
  db.equipment_product_categories = db.equipment_product_categories.filter((mapping) => mapping.category_id !== id)
  deleteById(db.equipment_categories, id)
  saveDb()
  res.json({ success: true, detached_count: detachedCount })
})

router.get('/admin/products', authMiddleware, (req, res) => {
  const categoryId = req.query.category_id ? Number(req.query.category_id) : null
  const requestedCategory = categoryId ? db.equipment_categories.find((category) => category.id === categoryId) : null
  const acceptedCategoryIds = requestedCategory && requestedCategory.parent_id == null
    ? new Set([requestedCategory.id, ...db.equipment_categories.filter((category) => category.parent_id === requestedCategory.id).map((category) => category.id)])
    : new Set(categoryId ? [categoryId] : [])
  const rows = categoryId
    ? db.equipment_products.filter((product) => productCategoryIds(product.id).some((id) => acceptedCategoryIds.has(id)))
    : db.equipment_products
  res.json({ data: [...rows].sort(sortByOrderIndex).map((product) => enrichProduct(product)) })
})

router.post('/admin/products', authMiddleware, upload.single('image'), (req: AuthRequest, res) => {
  const { name, features, card_summary, visibility, status, related_sku_ids, category_ids } = req.body
  if (!String(name || '').trim()) { res.status(400).json({ error: '产品名不能为空' }); return }
  const image = req.file ? registerUploadedFile(req.file, 'equipment', '装备产品图片').url : null
  const newProduct = {
    id: getNextId(db.equipment_products),
    name: String(name).trim(),
    image,
    features,
    card_summary: card_summary || '',
    material_platforms: normalizeMaterialPlatforms(req.body.material_platforms),
    visibility: visibility || 'public',
    status: status || 'active',
    related_sku_ids: validRelatedSkuIds(related_sku_ids),
    order_index: nextProductOrderIndex(),
  }
  db.equipment_products.push(newProduct)
  setProductCategories(newProduct.id, validCategoryIds(category_ids))
  saveDb()
  res.json({ success: true, id: newProduct.id })
})

router.put('/admin/product-order', authMiddleware, (req: AuthRequest, res) => {
  const ids: number[] = Array.isArray(req.body.ordered_ids) ? req.body.ordered_ids.map(Number) : []
  const rows = ids.map((id) => db.equipment_products.find((item) => item.id === id)).filter(Boolean)
  const allIds = db.equipment_products.map((item) => item.id)
  if (rows.length !== ids.length || ids.length !== allIds.length || allIds.some((id) => !ids.includes(id))) {
    res.status(400).json({ error: '排序数据无效' }); return
  }
  ids.forEach((id: number, order_index: number) => updateById(db.equipment_products, id, { order_index }))
  saveDb()
  res.json({ success: true })
})

router.put('/admin/products/:id', authMiddleware, upload.single('image'), (req: AuthRequest, res) => {
  const id = Number(req.params.id)
  const existing = db.equipment_products.find((product) => product.id === id)
  if (!existing) { res.status(404).json({ error: '产品不存在' }); return }
  const { name, features, card_summary, visibility, status, order_index, related_sku_ids, category_ids } = req.body
  if (name !== undefined && !String(name).trim()) { res.status(400).json({ error: '产品名不能为空' }); return }
  const removeImage = req.body.remove_image === 'true'
  const image = req.file ? registerUploadedFile(req.file, 'equipment', '装备产品图片').url : (removeImage ? null : existing.image)
  updateById(db.equipment_products, id, {
    name: name === undefined ? existing.name : String(name).trim(),
    image,
    features: features ?? existing.features,
    card_summary: card_summary ?? existing.card_summary,
    material_platforms: req.body.material_platforms === undefined
      ? normalizeMaterialPlatforms(existing.material_platforms)
      : normalizeMaterialPlatforms(req.body.material_platforms),
    visibility: visibility ?? existing.visibility,
    status: status ?? existing.status,
    related_sku_ids: related_sku_ids === undefined ? validRelatedSkuIds(existing.related_sku_ids) : validRelatedSkuIds(related_sku_ids),
    order_index: order_index === undefined ? existing.order_index : Number(order_index),
  })
  if (category_ids !== undefined) setProductCategories(id, validCategoryIds(category_ids))
  saveDb()
  res.json({ success: true })
})

router.delete('/admin/products/:id', authMiddleware, (req: AuthRequest, res) => {
  const id = Number(req.params.id)
  if (!db.equipment_products.some((product) => product.id === id)) { res.status(404).json({ error: '产品不存在' }); return }
  deleteById(db.equipment_products, id)
  db.equipment_product_categories = db.equipment_product_categories.filter((mapping) => mapping.product_id !== id)
  saveDb()
  res.json({ success: true })
})

export default router
