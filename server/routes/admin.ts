import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { db, saveDb } from '../db'
import { generateToken, authMiddleware, AuthRequest } from '../middleware/auth'

const router = Router()

router.post('/login', (req, res) => {
  const { username, password } = req.body
  const user = db.users.find((u) => u.username === username)
  if (!user) { res.status(401).json({ error: 'Invalid credentials' }); return }
  const valid = bcrypt.compareSync(password, user.password_hash)
  if (!valid) { res.status(401).json({ error: 'Invalid credentials' }); return }
  const token = generateToken(user.id, user.username)
  res.json({ success: true, token, user: { id: user.id, username: user.username, must_change_password: user.must_change_password } })
})

router.post('/change-password', authMiddleware, (req: AuthRequest, res) => {
  const { current_password, new_password } = req.body
  const user = db.users.find((u) => u.id === req.user!.id)
  if (!user) { res.status(400).json({ error: 'User not found' }); return }
  const valid = bcrypt.compareSync(current_password, user.password_hash)
  if (!valid) { res.status(400).json({ error: 'Current password is incorrect' }); return }
  const newHash = bcrypt.hashSync(new_password, 10)
  user.password_hash = newHash
  user.must_change_password = 0
  saveDb()
  res.json({ success: true })
})

export default router
