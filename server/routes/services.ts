import { Router } from 'express'
import { db, saveDb, getNextId, sortByOrderIndex, updateById, deleteById, nextOrderIndex } from '../db'
import { authMiddleware, AuthRequest } from '../middleware/auth'

const router = Router()

function registerContentCollection(resource: string, getCollection: () => any[]) {
  router.get(`/${resource}`, (_req, res) => {
    const collection = getCollection()
    res.json({ data: collection.sort(sortByOrderIndex) })
  })
  router.get(`/admin/${resource}`, authMiddleware, (_req, res) => {
    const collection = getCollection()
    res.json({ data: collection.sort(sortByOrderIndex) })
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

registerContentCollection('care-guides', () => db.care_guides)
registerContentCollection('faqs', () => db.faqs)
registerContentCollection('resources', () => db.support_resources)

export default router
