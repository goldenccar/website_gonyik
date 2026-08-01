import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

const DEVELOPMENT_JWT_SECRET = 'gonyik-local-development-only'

function jwtSecret() {
  const configured = process.env.JWT_SECRET?.trim()
  if (process.env.NODE_ENV === 'production' && (!configured || configured.length < 32)) {
    throw new Error('JWT_SECRET must be configured with at least 32 characters in production')
  }
  return configured || DEVELOPMENT_JWT_SECRET
}

export function assertAuthConfiguration() {
  jwtSecret()
}

export interface AuthRequest extends Request {
  user?: { id: number; username: string }
}

export function generateToken(userId: number, username: string): string {
  return jwt.sign({ id: userId, username }, jwtSecret(), { expiresIn: '7d' })
}

export function verifyToken(token: string): { id: number; username: string } | null {
  try {
    return jwt.verify(token, jwtSecret()) as { id: number; username: string }
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
