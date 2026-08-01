import multer from 'multer'
import path from 'path'
import fs from 'fs'
import crypto from 'crypto'

const UPLOADS_DIR = path.resolve(process.cwd(), 'public/uploads')

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true })
}

const allowedMimeTypes = new Map([
  ['image/jpeg', '.jpg'],
  ['image/png', '.png'],
  ['image/gif', '.gif'],
  ['image/webp', '.webp'],
  ['application/pdf', '.pdf'],
  ['video/mp4', '.mp4'],
  ['video/webm', '.webm'],
  ['video/quicktime', '.mov'],
])

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR)
  },
  filename: (_req, file, cb) => {
    const ext = allowedMimeTypes.get(file.mimetype)
    if (!ext) {
      cb(new Error('Unsupported file type'), '')
      return
    }
    cb(null, `${Date.now()}-${crypto.randomUUID()}${ext}`)
  },
})

export const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024,
    files: 1,
    fields: 24,
    fieldSize: 256 * 1024,
  },
  fileFilter: (_req, file, cb) => {
    if (allowedMimeTypes.has(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Only images, videos and PDF are allowed'))
    }
  },
})
