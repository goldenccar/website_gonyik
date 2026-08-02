import { Router, type Request } from 'express'
import { db, saveDb, getNextId, sortByOrderIndex, updateById, deleteById, nextOrderIndex } from '../db'
import { authMiddleware, AuthRequest } from '../middleware/auth'
import { pageVisible, requestMarket, visibleInMarket } from '../market'

const router = Router()

router.get('/bootstrap', (req, res) => {
  const market = requestMarket(req)
  const page = db.page_configs.find((item) => item.page_key === 'services') || null
  if (!pageVisible('services', market)) {
    res.json({ data: { page: null, sections: [] } })
    return
  }
  const sections = db.fluorine_sections
    .filter((section) => section.page_key === 'services' && section.status !== 'draft' && visibleInMarket(section, market))
    .sort(sortByOrderIndex)
  res.json({ data: { page, sections } })
})

function registerContentCollection(resource: string, getCollection: () => any[], filter?: (collection: any[], req: Request) => any[]) {
  router.get(`/${resource}`, (req, res) => {
    if (!pageVisible('services', requestMarket(req))) { res.json({ data: [] }); return }
    const collection = getCollection()
    res.json({ data: [...(filter ? filter(collection, req) : collection)].sort(sortByOrderIndex) })
  })
  router.get(`/admin/${resource}`, authMiddleware, (req, res) => {
    const collection = getCollection()
    res.json({ data: [...(filter ? filter(collection, req) : collection)].sort(sortByOrderIndex) })
  })
  router.post(`/admin/${resource}`, authMiddleware, (req: AuthRequest, res) => {
    const collection = getCollection()
    const newItem = { id: getNextId(collection), ...req.body, order_index: nextOrderIndex(collection) }
    collection.push(newItem)
    saveDb()
    res.json({ success: true, id: newItem.id })
  })
  router.put(`/admin/${resource}/:id`, authMiddleware, (req: AuthRequest, res) => {
    const collection = getCollection()
    if (!updateById(collection, Number(req.params.id), req.body)) {
      res.status(404).json({ error: 'Not found' })
      return
    }
    saveDb()
    res.json({ success: true })
  })
  router.delete(`/admin/${resource}/:id`, authMiddleware, (req: AuthRequest, res) => {
    const collection = getCollection()
    if (!deleteById(collection, Number(req.params.id))) {
      res.status(404).json({ error: 'Not found' })
      return
    }
    saveDb()
    res.json({ success: true })
  })
}

registerContentCollection('material-care-guides', () => db.material_care_guides)
registerContentCollection('care-guides', () => db.care_guides)
registerContentCollection('faqs', () => db.faqs, (collection, req) => {
  const category = String(req.query.category || '')
  return category ? collection.filter((item) => item.category === category) : collection
})
registerContentCollection('digital-fabric-formats', () => db.digital_fabric_formats)

export default router
