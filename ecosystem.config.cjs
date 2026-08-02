const fs = require('node:fs')
const path = require('node:path')

function readProductionEnv() {
  const envPath = path.resolve(__dirname, '.env.production')
  if (!fs.existsSync(envPath)) return {}
  return Object.fromEntries(
    fs.readFileSync(envPath, 'utf8')
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#') && line.includes('='))
      .map((line) => {
        const separator = line.indexOf('=')
        const key = line.slice(0, separator).trim()
        const value = line.slice(separator + 1).trim().replace(/^(['"])(.*)\1$/, '$2')
        return [key, value]
      }),
  )
}

const productionEnv = readProductionEnv()

module.exports = {
  apps: [
    {
      name: 'gonyik',
      cwd: __dirname,
      script: './server/index.ts',
      interpreter: 'node',
      interpreter_args: '--import ./node_modules/tsx/dist/loader.mjs',
      env: {
        ...productionEnv,
        NODE_ENV: 'production',
        PORT: 3001,
      },
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '500M',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_file: './logs/pm2-combined.log',
      merge_logs: true,
      time: true,
    },
  ],
}
