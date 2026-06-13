#!/usr/bin/env node
/**
 * 跨平台一键部署脚本
 *
 * 运行方式：
 *   npm run deploy
 *   或
 *   bash .agents/skills/gonyik-deploy/scripts/deploy.sh "feat: xxx"
 *   或
 *   node .agents/skills/gonyik-deploy/scripts/deploy.mjs "feat: xxx"
 */
import { spawn } from 'node:child_process'
import { readFile } from 'node:fs/promises'
import { createInterface } from 'node:readline'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { Client } from 'ssh2'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
// 脚本位于 .agents/skills/gonyik-deploy/scripts，项目根目录向上 3 层
const REPO_ROOT = resolve(__dirname, '../../../..')

const DEPLOY_KEY_PATH = resolve(REPO_ROOT, '.deploy-key.md')
const SERVER_IP = '111.231.141.7'
const SERVER_USER = 'root'
const SERVER_PATH = '/var/www/website_gonyik'

function parseArgs(argv) {
  let yes = false
  let message = null
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (arg === '-y' || arg === '--yes') {
      yes = true
    } else if (arg === '-m' || arg === '--message') {
      message = argv[++i] || ''
    } else if (!arg.startsWith('-')) {
      message = arg
    }
  }
  return { yes, message: message || 'deploy: auto deploy' }
}

async function loadDeployKey() {
  const content = await readFile(DEPLOY_KEY_PATH, 'utf8')
  const cipherMatch = content.match(/\*\*Ciphertext\*\*[: \t]+`([^`]+)`/i)
  const offsetMatch = content.match(/\*\*Offset\*\*[: \t]+`(\d+)`/i)
  if (!cipherMatch || !offsetMatch) {
    throw new Error('无法从 .deploy-key.md 解析密文或偏移量')
  }
  const cipher = cipherMatch[1]
  const offset = parseInt(offsetMatch[1], 10)
  const password = [...cipher]
    .map((ch) => String.fromCharCode(ch.charCodeAt(0) - offset))
    .join('')
  return { password, cipher, offset }
}

function run(cmd, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, {
      cwd: REPO_ROOT,
      stdio: 'inherit',
      ...options,
    })
    child.on('error', reject)
    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`命令退出码 ${code}: ${cmd} ${args.join(' ')}`))
      } else {
        resolve()
      }
    })
  })
}

function runNpm(args) {
  if (process.platform === 'win32') {
    return run('cmd', ['/c', 'npm', ...args])
  }
  return run('npm', args)
}

function runCapture(cmd, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { cwd: REPO_ROOT })
    let out = ''
    let err = ''
    child.stdout.on('data', (d) => (out += d))
    child.stderr.on('data', (d) => (err += d))
    child.on('error', reject)
    child.on('close', (code) => {
      if (code !== 0) reject(new Error(err || out))
      else resolve(out.trim())
    })
  })
}

async function ensureGitIdentity() {
  const email = await runCapture('git', ['config', 'user.email']).catch(() => '')
  const name = await runCapture('git', ['config', 'user.name']).catch(() => '')
  if (!email || !name) {
    await run('git', ['config', 'user.email', 'agent@gonyik.com'])
    await run('git', ['config', 'user.name', 'GONYIK Agent'])
    console.log('已自动配置本地 Git 身份信息（仅当前仓库）')
  }
}

async function confirm(message) {
  if (!process.stdin.isTTY) return true
  const rl = createInterface({ input: process.stdin, output: process.stdout })
  return new Promise((resolve) => {
    rl.question(`${message} [Y/n] `, (answer) => {
      rl.close()
      resolve(!answer || answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes')
    })
  })
}

async function deployRemote(password) {
  const remoteCmd = [
    `cd ${SERVER_PATH}`,
    '# 丢弃工作区变更（db.json / uploads 等已被 gitignore，不会受影响）',
    'git reset --hard HEAD',
    'git pull origin main',
    'npm install',
    'npm run build',
    'mkdir -p logs',
    'pm2 reload ecosystem.config.cjs || pm2 start ecosystem.config.cjs',
    'pm2 save',
    'curl -s http://localhost:3001/api/health',
  ].join(' && ')

  const conn = new Client()
  return new Promise((resolve, reject) => {
    conn
      .on('ready', () => {
        console.log('\n=== Step 3: 服务器部署 ===')
        conn.exec(remoteCmd, (err, stream) => {
          if (err) return reject(err)
          stream
            .on('close', (code) => {
              conn.end()
              if (code === 0) {
                resolve()
              } else {
                reject(new Error(`服务器部署失败，退出码 ${code}`))
              }
            })
            .on('data', (data) => {
              process.stdout.write(data)
            })
            .stderr.on('data', (data) => {
              process.stderr.write(data)
            })
        })
      })
      .on('error', (err) => {
        reject(new Error(`SSH 连接失败: ${err.message}`))
      })
      .connect({
        host: SERVER_IP,
        port: 22,
        username: SERVER_USER,
        password,
        // 自动接受主机密钥；生产环境若需要更高安全性，可改为读取 known_hosts
        hostVerifier: () => true,
        readyTimeout: 30000,
      })
  })
}

async function main() {
  const { yes, message } = parseArgs(process.argv.slice(2))
  const { password } = await loadDeployKey()

  console.log('=== Step 0: 本地构建 ===')
  await runNpm(['run', 'build'])

  if (!yes) {
    const ok = await confirm('构建通过，是否继续提交、推送并部署到服务器？')
    if (!ok) {
      console.log('已取消部署')
      process.exit(0)
    }
  }

  console.log('\n=== Step 1: Git 提交 ===')
  await ensureGitIdentity()
  await run('git', ['add', '-A'])
  try {
    await run('git', ['commit', '-m', message])
  } catch {
    console.log('没有变更需要提交，继续推送...')
  }

  console.log('\n=== Step 2: Git 推送 ===')
  try {
    await run('git', ['push', 'origin', 'main'])
  } catch {
    console.error('\nERROR: git push 失败。常见原因：VPN/代理屏蔽了到 GitHub 的连接。')
    console.error(' workaround：使用服务器中转推送，详见 .agents/skills/gonyik-deploy/SKILL.md')
    process.exit(1)
  }

  await deployRemote(password)

  console.log('\n=== Deploy finished ===')
}

main().catch((err) => {
  console.error('\n部署失败:', err.message)
  process.exit(1)
})
