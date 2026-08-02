import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { releaseFingerprint } from './release-fingerprint.mjs'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const stampPath = resolve(repoRoot, 'dist/.release-verified.json')
await mkdir(dirname(stampPath), { recursive: true })
await writeFile(stampPath, JSON.stringify({
  fingerprint: releaseFingerprint(repoRoot),
  verified_at: new Date().toISOString(),
}, null, 2))
console.log('Release verification stamp written.')
