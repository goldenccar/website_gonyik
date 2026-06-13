import { readFile } from 'node:fs/promises'
import { Client } from 'ssh2'

const content = await readFile('.deploy-key.md', 'utf8')
const cipherMatch = content.match(/\*\*Ciphertext\*\*[: \t]+`([^`]+)`/i)
const offsetMatch = content.match(/\*\*Offset\*\*[: \t]+`(\d+)`/i)
const cipher = cipherMatch[1]
const offset = parseInt(offsetMatch[1], 10)
const password = [...cipher].map((ch) => String.fromCharCode(ch.charCodeAt(0) - offset)).join('')

const conn = new Client()
conn
  .on('ready', () => {
    const cmd = `cd /var/www/website_gonyik && pm2 status && pm2 logs gonyik --lines 30 && ss -tlnp | grep 3001 && curl -s http://localhost:3001/api/health`
    conn.exec(cmd, (err, stream) => {
      if (err) throw err
      stream
        .on('close', (code) => {
          console.log('exit code:', code)
          conn.end()
        })
        .on('data', (data) => process.stdout.write(data))
        .stderr.on('data', (data) => process.stderr.write(data))
    })
  })
  .on('error', (err) => {
    console.error('SSH error:', err.message)
    process.exit(1)
  })
  .connect({
    host: '111.231.141.7',
    port: 22,
    username: 'root',
    password,
    hostVerifier: () => true,
    readyTimeout: 30000,
  })
