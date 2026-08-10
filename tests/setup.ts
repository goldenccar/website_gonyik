import assert from 'node:assert/strict'
import crypto from 'node:crypto'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { after } from 'node:test'

if (!process.env.GONYIK_DB_PATH) {
  const workspaceDb = path.resolve(process.cwd(), 'db.json')
  const before = fs.existsSync(workspaceDb)
    ? { hash: crypto.createHash('sha256').update(fs.readFileSync(workspaceDb)).digest('hex'), mtimeMs: fs.statSync(workspaceDb).mtimeMs }
    : null
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'gonyik-test-'))
  process.env.GONYIK_DB_PATH = path.join(tempRoot, 'db.json')
  process.env.GONYIK_UPLOADS_DIR = path.join(tempRoot, 'uploads')

  after(() => {
    const afterState = fs.existsSync(workspaceDb)
      ? { hash: crypto.createHash('sha256').update(fs.readFileSync(workspaceDb)).digest('hex'), mtimeMs: fs.statSync(workspaceDb).mtimeMs }
      : null
    assert.deepEqual(afterState, before, 'tests must not create or modify the workspace db.json')
    fs.rmSync(tempRoot, { recursive: true, force: true })
  })
}
