---
name: gonyik-deploy
description: Deploy the GONYIK website (React + Express) from local dev to GitHub and then to the Tencent Cloud server. Use when the user asks to deploy, push code, restart the server, or perform any CI/CD-like operations for this project.
---

# GONYIK Website Deploy Skill

## Quick Workflow

```
Local build → Git push → Server pull/install/build → PM2 reload → Health check
```

Run the following from the project root:

```bash
npm run deploy
```

Or use the shell wrapper:

```bash
bash .agents/skills/gonyik-deploy/scripts/deploy.sh "feat: your message"
```

The deployment script works on **Windows / macOS / Linux** (uses Node.js under the hood).

### Manual Steps

```bash
# 1. Local build
npm run build

# 2. Commit & push
git add -A
git commit -m "feat: xxx"
git push origin main

# 3. Server deploy (password read from .deploy-key.md at runtime)
ssh root@111.231.141.7
cd /var/www/website_gonyik
git pull
npm install
npm run build
pm2 reload ecosystem.config.cjs
curl -s http://localhost:3001/api/health
```

## Password Rule

- Read `.deploy-key.md` for the ciphertext and offset.
- Decrypt at runtime: subtract offset from each character's ASCII code.
- **Never hardcode the plaintext password in scripts or commits.**
- The deploy script (`deploy.mjs`) decrypts at runtime using Node.js.

## One-Command Deploy

```bash
npm run deploy
```

Options:

```bash
npm run deploy "feat: your message"   # 自定义提交信息
npm run deploy -y                      # 非交互模式，跳过确认
```

The script auto-decrypts the password and runs the full pipeline. If `git push` fails (see Network Issues below), it prints the workaround instructions.

## Network Issues (VPN / GitHub Timeout)

**Symptom:** `git push` times out even though browser/VPN works.

**Root cause:** Some VPN clients only proxy browser HTTP traffic; SSH/HTTPS to GitHub is blocked.

**Workaround — Server Relay Push:**

1. Generate a patch from the local commit:
   ```bash
   git format-patch -1 --stdout > /tmp/deploy.patch
   ```
2. SCP the patch to the server and apply it there:
   ```bash
   # 登录服务器后执行
   cd /var/www/website_gonyik
   git checkout -- src/pages/CHANGED_FILE.tsx
   git config user.email 'deploy@gonyik.com'
   git config user.name 'Deploy Bot'
   git am /tmp/deploy.patch
   git push origin main
   ```
3. Then proceed with normal server pull + build + restart:
   ```bash
   npm install
   npm run build
   pm2 reload ecosystem.config.cjs
   curl -s http://localhost:3001/api/health
   ```

> The server (Tencent Cloud) has direct access to GitHub, so pushing from the server often works when the local machine cannot.

## Critical Checklist

| Item | Rule |
|------|------|
| `db.json` | Never commit. Managed independently on the server. |
| Server code changes | Must `pm2 reload gonyik` (or `pm2 restart gonyik`). |
| Build failures | Fix locally before pushing. Never push broken builds. |
| Dependency changes | Server auto-deploy now runs `npm install` when code changes. |
| Cross-platform | Use `npm run deploy` on any OS; do not rely on hardcoded paths. |

## Reference

- Detailed server info & diagnostic commands: see `references/server-info.md`
