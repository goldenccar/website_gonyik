import fs from 'fs'
import path from 'path'
import { db, getNextId, uploadUrl } from './db'

const PUBLIC_DIR = path.resolve(process.cwd(), 'public')
const SOURCE_DIRS = ['src']
const LOCAL_MEDIA_PATTERN = /\/(?:uploads|visuals)\/[^\s"'`)<>?#]+\.(?:avif|webp|png|jpe?g|gif|svg|mp4|webm|mov|pdf)/gi

type UploadedFile = {
  filename: string
  mimetype?: string
  size?: number
}

const CATEGORY_KEYS = ['home', 'fabrics', 'equipment', 'fluorine', 'services', 'contact', 'global']

function categoryFromReference(reference: string): string {
  const normalized = reference.toLowerCase()
  if (/fabric|面料/.test(normalized)) return 'fabrics'
  if (/equipment|装备/.test(normalized)) return 'equipment'
  if (/technology|fluorine|pfas|membrane|fiber|lamination|supply|testing|rpo/.test(normalized)) return 'fluorine'
  if (/service|care|digital/.test(normalized)) return 'services'
  if (/contact/.test(normalized)) return 'contact'
  if (/home/.test(normalized)) return 'home'
  return CATEGORY_KEYS.find((category) => normalized.includes(category)) || 'global'
}

export function registerUploadedFile(file: UploadedFile, category = 'other', description = '') {
  const url = uploadUrl(file)
  const existing = db.media_items.find((item) => item.url === url)
  if (existing) return existing

  const item = {
    id: getNextId(db.media_items),
    filename: file.filename,
    url,
    category,
    description,
    file_type: file.mimetype || '',
    size: file.size || 0,
    created_at: new Date().toISOString(),
    origin: 'upload',
  }
  db.media_items.push(item)
  return item
}

function collectReferences(value: unknown, currentPath: string, output: Map<string, string[]>) {
  if (typeof value === 'string') {
    const matches = value.match(LOCAL_MEDIA_PATTERN) || []
    matches.forEach((url) => {
      const references = output.get(url) || []
      references.push(currentPath)
      output.set(url, references)
    })
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

function collectSourceReferences(directory: string, output: Map<string, string[]>) {
  if (!fs.existsSync(directory)) return
  fs.readdirSync(directory, { withFileTypes: true }).forEach((entry) => {
    const absolutePath = path.join(directory, entry.name)
    if (entry.isDirectory()) {
      collectSourceReferences(absolutePath, output)
      return
    }
    if (!/\.(?:ts|tsx|css)$/.test(entry.name)) return
    const source = fs.readFileSync(absolutePath, 'utf8')
    const matches = source.match(LOCAL_MEDIA_PATTERN) || []
    const relativePath = path.relative(process.cwd(), absolutePath)
    matches.forEach((url) => {
      const references = output.get(url) || []
      references.push(`source:${relativePath}`)
      output.set(url, references)
    })
  })
}

export function getLocalMediaReferences(): Map<string, string[]> {
  const references = new Map<string, string[]>()
  Object.entries(db).forEach(([key, value]) => {
    if (key !== 'media_items') collectReferences(value, key, references)
  })
  SOURCE_DIRS.forEach((directory) => collectSourceReferences(path.resolve(process.cwd(), directory), references))
  return references
}

export function findUploadReferences(url: string): string[] {
  return getLocalMediaReferences().get(url) || []
}

export function resolveLocalMediaPath(url: string): string | null {
  const normalizedUrl = url.split(/[?#]/)[0]
  if (!normalizedUrl.match(/^\/(?:uploads|visuals)\//)) return null
  const resolved = path.resolve(PUBLIC_DIR, normalizedUrl.replace(/^\/+/, ''))
  return resolved.startsWith(`${PUBLIC_DIR}${path.sep}`) ? resolved : null
}

function inferMimeType(filename: string): string {
  const extension = path.extname(filename).toLowerCase()
  const mimeTypes: Record<string, string> = {
    '.avif': 'image/avif', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
    '.gif': 'image/gif', '.svg': 'image/svg+xml', '.mp4': 'video/mp4', '.webm': 'video/webm', '.mov': 'video/quicktime', '.pdf': 'application/pdf',
  }
  return mimeTypes[extension] || 'application/octet-stream'
}

export function syncReferencedMedia(): number {
  const references = getLocalMediaReferences()
  let registered = 0

  for (const [url, locations] of references) {
    const filename = path.basename(url)
    if (db.media_items.some((item) => item.url === url)) continue
    const filePath = resolveLocalMediaPath(url)
    if (!filePath) continue
    if (!fs.existsSync(filePath)) continue
    const stats = fs.statSync(filePath)
    db.media_items.push({
      id: getNextId(db.media_items),
      filename,
      url,
      category: categoryFromReference(locations.join(' ')),
      description: '站内正在使用的资源',
      file_type: inferMimeType(filename),
      size: stats.size,
      created_at: stats.birthtime.toISOString(),
      origin: url.startsWith('/uploads/') ? 'upload' : 'site',
    })
    registered += 1
  }

  return registered
}
