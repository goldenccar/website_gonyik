import fs from 'fs'
import path from 'path'
import { db, getNextId, uploadUrl } from './db'

const UPLOADS_DIR = path.resolve(process.cwd(), 'public/uploads')

type UploadedFile = {
  filename: string
  mimetype?: string
  size?: number
}

const CATEGORY_KEYS = ['home', 'fabrics', 'equipment', 'fluorine', 'services', 'contact', 'global']

function categoryFromReference(reference: string): string {
  return CATEGORY_KEYS.find((category) => reference.includes(category)) || 'other'
}

export function registerUploadedFile(file: UploadedFile, category = 'other', description = '') {
  const existing = db.media_items.find((item) => item.filename === file.filename)
  if (existing) return existing

  const item = {
    id: getNextId(db.media_items),
    filename: file.filename,
    url: uploadUrl(file),
    category,
    description,
    file_type: file.mimetype || '',
    size: file.size || 0,
    created_at: new Date().toISOString(),
  }
  db.media_items.push(item)
  return item
}

function collectReferences(value: unknown, currentPath: string, output: Map<string, string[]>) {
  if (typeof value === 'string' && value.startsWith('/uploads/')) {
    const references = output.get(value) || []
    references.push(currentPath)
    output.set(value, references)
    return
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => collectReferences(item, `${currentPath}[${index}]`, output))
    return
  }
  if (value && typeof value === 'object') {
    Object.entries(value).forEach(([key, child]) => collectReferences(child, currentPath ? `${currentPath}.${key}` : key, output))
  }
}

export function getUploadReferences(): Map<string, string[]> {
  const references = new Map<string, string[]>()
  Object.entries(db).forEach(([key, value]) => {
    if (key !== 'media_items') collectReferences(value, key, references)
  })
  return references
}

export function findUploadReferences(url: string): string[] {
  return getUploadReferences().get(url) || []
}

export function syncReferencedMedia(): number {
  const references = getUploadReferences()
  let registered = 0

  for (const [url, locations] of references) {
    const filename = path.basename(url)
    if (db.media_items.some((item) => item.filename === filename)) continue
    const filePath = path.join(UPLOADS_DIR, filename)
    if (!fs.existsSync(filePath)) continue
    const stats = fs.statSync(filePath)
    registerUploadedFile(
      { filename, size: stats.size },
      categoryFromReference(locations.join(' ')),
      '系统补登记的在用资源',
    )
    registered += 1
  }

  return registered
}
