import path from 'node:path'

export const databasePath = () => path.resolve(process.env.GONYIK_DB_PATH || path.join(process.cwd(), 'db.json'))
export const uploadsPath = () => path.resolve(process.env.GONYIK_UPLOADS_DIR || path.join(process.cwd(), 'public/uploads'))
