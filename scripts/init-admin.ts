import bcrypt from 'bcryptjs'
import { db, getNextId, initDatabase, saveDb } from '../server/db'

const username = String(process.env.GONYIK_INITIAL_ADMIN_USERNAME || '').trim()
const password = String(process.env.GONYIK_INITIAL_ADMIN_PASSWORD || '')

if (!username || !/^[A-Za-z0-9_.-]{3,64}$/.test(username)) {
  throw new Error('GONYIK_INITIAL_ADMIN_USERNAME must be 3-64 safe characters')
}
if (password.length < 12) {
  throw new Error('GONYIK_INITIAL_ADMIN_PASSWORD must contain at least 12 characters')
}

initDatabase()
if (db.users.length > 0) throw new Error('An administrator already exists; use the CMS password page')

db.users.push({
  id: getNextId(db.users),
  username,
  password_hash: bcrypt.hashSync(password, 12),
  must_change_password: 1,
  created_at: new Date().toISOString(),
})
saveDb()
console.log(`Administrator ${username} created; password change is required at first login.`)
