import { Router } from 'express'
import { db, saveDb, getNextId, sortByOrderIndex, updateById, deleteById, uploadUrl, nextOrderIndex } from '../db'
import { authMiddleware, AuthRequest } from '../middleware/auth'
import { upload } from '../middleware/upload'

const router = Router()

router.get('/categories', (_req, res) => {
  res.json({ data: db.equipment_categories.sort(sortByOrderIndex) })
})

router.get('/categories/:slug/products', (req, res) => {
  const cat = db.equipment_categories.find((c) => c.slug === req.params.slug)
  if (!cat) { res.status(404).json({ error: 'Category not found' }); return }
  const products = db.equipment_products.filter((p) => p.category_id === cat.id && p.visibility !== 'hidden' && p.status !== 'archived').sort(sortByOrderIndex)
  res.json({ data: { ...cat, products } })
})

router.get('/admin/categories', authMiddleware, (_req, res) => {
  res.json({ data: db.equipment_categories.sort(sortByOrderIndex) })
})

router.post('/admin/categories', authMiddleware, upload.single('bg_image'), (req: AuthRequest, res) => {
  const { name, slug, description, image_fit } = req.body
  const bg_image = req.file ? uploadUrl(req.file) : null
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
  const bg_image = req.file ? uploadUrl(req.file) : (req.body.bg_image || existing.bg_image)
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
  const { category_id, name, features, card_summary, visibility, status } = req.body
  const image = req.file ? uploadUrl(req.file) : null
  const newProd = {
    id: getNextId(db.equipment_products),
    category_id: Number(category_id),
    name,
    image,
    features,
    card_summary: card_summary || '',
    visibility: visibility || 'public',
    status: status || 'active',
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
  const { category_id, name, features, card_summary, visibility, status, order_index } = req.body
  const image = req.file ? uploadUrl(req.file) : (req.body.image || existing.image)
  updateById(db.equipment_products, id, {
    category_id: category_id ? Number(category_id) : existing.category_id,
    name: name ?? existing.name,
    image,
    features: features ?? existing.features,
    card_summary: card_summary ?? existing.card_summary,
    visibility: visibility ?? existing.visibility,
    status: status ?? existing.status,
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

// Equipment Scenes (public)
router.get('/scenes', (_req, res) => {
  res.json({ data: db.equipment_scenes.sort(sortByOrderIndex) })
})

// Equipment Scenes (admin)
router.get('/admin/equipment-scenes', authMiddleware, (_req, res) => {
  res.json({ data: db.equipment_scenes.sort(sortByOrderIndex) })
})

router.post('/admin/equipment-scenes', authMiddleware, (req: AuthRequest, res) => {
  const { category, label, equipment_slug } = req.body
  const newScene = {
    id: getNextId(db.equipment_scenes),
    category,
    label,
    equipment_slug,
    order_index: nextOrderIndex(db.equipment_scenes),
  }
  db.equipment_scenes.push(newScene)
  saveDb()
  res.json({ success: true, id: newScene.id })
})

router.put('/admin/equipment-scenes/:id', authMiddleware, (req: AuthRequest, res) => {
  const ok = updateById(db.equipment_scenes, Number(req.params.id), req.body)
  if (!ok) { res.status(404).json({ error: 'Not found' }); return }
  saveDb()
  res.json({ success: true })
})

router.delete('/admin/equipment-scenes/:id', authMiddleware, (req: AuthRequest, res) => {
  deleteById(db.equipment_scenes, Number(req.params.id))
  saveDb()
  res.json({ success: true })
})

export default router
