import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'gonyik-secret-key-2026'

export interface AuthRequest extends Request {
  user?: { id: number; username: string }
}

export function generateToken(userId: number, username: string): string {
  return jwt.sign({ id: userId, username }, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): { id: number; username: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { id: number; username: string }
  } catch {
    return null
  }
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }
  const token = authHeader.slice(7)
  const payload = verifyToken(token)
  if (!payload) {
    res.status(401).json({ error: 'Invalid token' })
    return
  }
  req.user = payload
  next()
}
