import { Router } from 'express'
import { db, saveDb, getNextId } from '../db'
import { authMiddleware, AuthRequest } from '../middleware/auth'
import { upload } from '../middleware/upload'

const router = Router()

router.get('/categories', (_req, res) => {
  res.json({ data: db.equipment_categories.sort((a, b) => a.order_index - b.order_index) })
})

router.get('/categories/:slug/products', (req, res) => {
  const cat = db.equipment_categories.find((c) => c.slug === req.params.slug)
  if (!cat) { res.status(404).json({ error: 'Category not found' }); return }
  const products = db.equipment_products.filter((p) => p.category_id === cat.id).sort((a, b) => a.order_index - b.order_index)
  res.json({ data: { ...cat, products } })
})

router.get('/admin/categories', authMiddleware, (_req, res) => {
  res.json({ data: db.equipment_categories.sort((a, b) => a.order_index - b.order_index) })
})

router.post('/admin/categories', authMiddleware, upload.single('bg_image'), (req: AuthRequest, res) => {
  const { name, slug, description, image_fit } = req.body
  const bg_image = req.file ? `/uploads/${req.file.filename}` : null
  const newCat = { id: getNextId(db.equipment_categories), name, slug, description, bg_image, image_fit: image_fit || 'cover', order_index: db.equipment_categories.length }
  db.equipment_categories.push(newCat)
  saveDb()
  res.json({ success: true, id: newCat.id })
})

router.put('/admin/categories/:id', authMiddleware, upload.single('bg_image'), (req: AuthRequest, res) => {
  const idx = db.equipment_categories.findIndex((c) => c.id === Number(req.params.id))
  if (idx < 0) { res.status(404).json({ error: 'Not found' }); return }
  const { name, slug, description, image_fit } = req.body
  const bg_image = req.file ? `/uploads/${req.file.filename}` : (req.body.bg_image || db.equipment_categories[idx].bg_image)
  db.equipment_categories[idx] = { ...db.equipment_categories[idx], name, slug, description, bg_image, image_fit: image_fit || 'cover' }
  saveDb()
  res.json({ success: true })
})

router.delete('/admin/categories/:id', authMiddleware, (req: AuthRequest, res) => {
  db.equipment_categories = db.equipment_categories.filter((c) => c.id !== Number(req.params.id))
  db.equipment_products = db.equipment_products.filter((p) => p.category_id !== Number(req.params.id))
  saveDb()
  res.json({ success: true })
})

router.get('/admin/products', authMiddleware, (req, res) => {
  const catId = req.query.category_id
  const rows = catId ? db.equipment_products.filter((p) => p.category_id === Number(catId)) : db.equipment_products
  res.json({ data: rows.sort((a, b) => a.order_index - b.order_index) })
})

router.post('/admin/products', authMiddleware, upload.single('image'), (req: AuthRequest, res) => {
  const { category_id, name, features } = req.body
  const image = req.file ? `/uploads/${req.file.filename}` : null
  const newProd = { id: getNextId(db.equipment_products), category_id: Number(category_id), name, image, features, order_index: db.equipment_products.length }
  db.equipment_products.push(newProd)
  saveDb()
  res.json({ success: true, id: newProd.id })
})

router.put('/admin/products/:id', authMiddleware, upload.single('image'), (req: AuthRequest, res) => {
  const idx = db.equipment_products.findIndex((p) => p.id === Number(req.params.id))
  if (idx < 0) { res.status(404).json({ error: 'Not found' }); return }
  const { category_id, name, features } = req.body
  const image = req.file ? `/uploads/${req.file.filename}` : (req.body.image || db.equipment_products[idx].image)
  db.equipment_products[idx] = { ...db.equipment_products[idx], category_id: Number(category_id), name, image, features }
  saveDb()
  res.json({ success: true })
})

router.delete('/admin/products/:id', authMiddleware, (req: AuthRequest, res) => {
  db.equipment_products = db.equipment_products.filter((p) => p.id !== Number(req.params.id))
  saveDb()
  res.json({ success: true })
})

// Equipment Scenes (public)
router.get('/scenes', (_req, res) => {
  res.json({ data: db.equipment_scenes.sort((a, b) => a.order_index - b.order_index) })
})

// Equipment Scenes (admin)
router.get('/admin/equipment-scenes', authMiddleware, (_req, res) => {
  res.json({ data: db.equipment_scenes.sort((a, b) => a.order_index - b.order_index) })
})

router.post('/admin/equipment-scenes', authMiddleware, (req: AuthRequest, res) => {
  const { category, label, equipment_slug } = req.body
  const newScene = { id: getNextId(db.equipment_scenes), category, label, equipment_slug, order_index: db.equipment_scenes.length }
  db.equipment_scenes.push(newScene)
  saveDb()
  res.json({ success: true, id: newScene.id })
})

router.put('/admin/equipment-scenes/:id', authMiddleware, (req: AuthRequest, res) => {
  const idx = db.equipment_scenes.findIndex((s) => s.id === Number(req.params.id))
  if (idx < 0) { res.status(404).json({ error: 'Not found' }); return }
  const { category, label, equipment_slug } = req.body
  db.equipment_scenes[idx] = { ...db.equipment_scenes[idx], category, label, equipment_slug }
  saveDb()
  res.json({ success: true })
})

router.delete('/admin/equipment-scenes/:id', authMiddleware, (req: AuthRequest, res) => {
  db.equipment_scenes = db.equipment_scenes.filter((s) => s.id !== Number(req.params.id))
  saveDb()
  res.json({ success: true })
})

export default router
