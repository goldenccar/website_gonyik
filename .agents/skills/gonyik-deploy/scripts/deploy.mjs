#!/usr/bin/env node
import { spawn } from 'node:child_process'
import { access, readFile } from 'node:fs/promises'
import { constants as fsConstants } from 'node:fs'
import { createInterface } from 'node:readline'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { releaseFingerprint } from '../../../../scripts/release-fingerprint.mjs'

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../../..')
const RELEASE_STAMP_PATH = resolve(REPO_ROOT, 'dist/.release-verified.json')
const MAX_STAMP_AGE_MS = 2 * 60 * 60 * 1000

function run(command, args, { capture = false } = {}) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(command, args, { cwd: REPO_ROOT, stdio: capture ? ['ignore', 'pipe', 'pipe'] : 'inherit' })
    let output = ''
    let error = ''
    if (capture) {
      child.stdout.on('data', (chunk) => { output += chunk })
      child.stderr.on('data', (chunk) => { error += chunk })
    }
    child.on('error', reject)
    child.on('close', (code) => code === 0 ? resolvePromise(output.trim()) : reject(new Error(error.trim() || `${command} exited with ${code}`)))
  })
}

async function hasCurrentReleaseVerification() {
  try {
    const stamp = JSON.parse(await readFile(RELEASE_STAMP_PATH, 'utf8'))
    const age = Date.now() - Date.parse(stamp.verified_at)
    return age >= 0 && age <= MAX_STAMP_AGE_MS && stamp.fingerprint === await releaseFingerprint(REPO_ROOT)
  } catch {
    return false
  }
}

function requiredEnvironment(name) {
  const value = String(process.env[name] || '').trim()
  if (!value) throw new Error(`${name} is required`)
  return value
}

function shellQuote(value) {
  return `'${String(value).replaceAll("'", "'\\''")}'`
}

async function confirm(commit) {
  if (process.argv.includes('-y') || process.argv.includes('--yes') || !process.stdin.isTTY) return true
  const prompt = createInterface({ input: process.stdin, output: process.stdout })
  return new Promise((resolvePromise) => prompt.question(`部署已验证 commit ${commit}？ [y/N] `, (answer) => {
    prompt.close()
    resolvePromise(/^y(?:es)?$/i.test(answer.trim()))
  }))
}

async function main() {
  const dirty = await run('git', ['status', '--porcelain', '--untracked-files=all'], { capture: true })
  if (dirty) throw new Error(`工作区不是干净状态，部署已中止：\n${dirty}`)
  const branch = await run('git', ['branch', '--show-current'], { capture: true })
  if (branch !== 'main') throw new Error(`只能从 main 部署，当前分支为 ${branch || '(detached HEAD)'}`)
  const commit = await run('git', ['rev-parse', 'HEAD'], { capture: true })

  if (!await hasCurrentReleaseVerification()) await run('npm', ['run', 'test:release'])
  if (!await confirm(commit)) return

  await run('git', ['push', 'origin', 'main'])

  const host = requiredEnvironment('GONYIK_DEPLOY_HOST')
  const user = requiredEnvironment('GONYIK_DEPLOY_USER')
  const deployPath = requiredEnvironment('GONYIK_DEPLOY_PATH')
  const identityFile = resolve(requiredEnvironment('GONYIK_DEPLOY_SSH_KEY'))
  const port = String(process.env.GONYIK_DEPLOY_PORT || '22')
  if (!/^\d{1,5}$/.test(port) || Number(port) > 65535) throw new Error('GONYIK_DEPLOY_PORT is invalid')
  if (!/^\/[A-Za-z0-9._/-]+$/.test(deployPath)) throw new Error('GONYIK_DEPLOY_PATH must be an absolute safe path')
  await access(identityFile, fsConstants.R_OK)

  const remoteScript = `set -euo pipefail
exec 9>/tmp/gonyik-deploy.lock
flock -n 9 || { echo 'Another deployment is running'; exit 75; }
cd ${shellQuote(deployPath)}
OLD_COMMIT=$(git rev-parse HEAD)
TARGET_COMMIT=${shellQuote(commit)}
git fetch origin main
git cat-file -e "$TARGET_COMMIT^{commit}"
mkdir -p backups logs
STAMP=$(date -u +%Y%m%dT%H%M%SZ)
BACKUP_PATH="backups/db-$STAMP-$TARGET_COMMIT.json"
if [ -f db.json ]; then cp -p db.json "$BACKUP_PATH"; else BACKUP_PATH="none (no db.json)"; fi
echo "deploy old=$OLD_COMMIT new=$TARGET_COMMIT backup=$BACKUP_PATH"
git checkout main
git reset --hard "$TARGET_COMMIT"
if git diff --name-only "$OLD_COMMIT" "$TARGET_COMMIT" | grep -qE '^package(-lock)?\\.json$'; then npm ci; else echo 'Dependencies unchanged'; fi
npm run build:client
export DEPLOY_COMMIT="$TARGET_COMMIT"
pm2 reload ecosystem.config.cjs --update-env || pm2 start ecosystem.config.cjs
pm2 save
HEALTH=''
for attempt in 1 2 3 4 5; do HEALTH=$(curl -fsS http://localhost:3001/api/health || true); case "$HEALTH" in *"\\\"commit\\\":\\\"$TARGET_COMMIT\\\""*) break;; esac; sleep 2; done
case "$HEALTH" in *"\\\"commit\\\":\\\"$TARGET_COMMIT\\\""*) echo "health=$HEALTH";; *) echo "Health check failed: $HEALTH"; echo "Code rollback: git reset --hard $OLD_COMMIT && pm2 reload ecosystem.config.cjs --update-env"; echo "Data restore candidate: $BACKUP_PATH"; exit 1;; esac`

  const sshArgs = ['-p', port, '-i', identityFile, '-o', 'BatchMode=yes', '-o', 'StrictHostKeyChecking=yes']
  const knownHosts = String(process.env.GONYIK_DEPLOY_KNOWN_HOSTS || '').trim()
  if (knownHosts) sshArgs.push('-o', `UserKnownHostsFile=${resolve(knownHosts)}`)
  sshArgs.push(`${user}@${host}`, `bash -lc ${shellQuote(remoteScript)}`)
  await run('ssh', sshArgs)
  console.log(`Deployed commit ${commit}`)
}

main().catch((error) => {
  console.error(`Deployment failed: ${error.message}`)
  process.exitCode = 1
})
