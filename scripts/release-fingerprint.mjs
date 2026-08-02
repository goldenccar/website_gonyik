import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

export function releaseFingerprint(repoRoot) {
  const runGit = (args, encoding = 'utf8') => execFileSync('git', args, { cwd: repoRoot, encoding })
  const hash = createHash('sha256')
  hash.update(runGit(['rev-parse', 'HEAD']))
  const changed = runGit(['ls-files', '-m', '-o', '--exclude-standard', '-z'])
    .split('\0')
    .filter(Boolean)
    .sort()

  for (const relativePath of changed) {
    hash.update(relativePath)
    try {
      hash.update(readFileSync(resolve(repoRoot, relativePath)))
    } catch {
      hash.update('<deleted>')
    }
  }
  return hash.digest('hex')
}
