---
name: gonyik-deploy
description: Deploy the GONYIK website (React + Express) from local dev to GitHub and then to the Tencent Cloud server. Use when the user asks to deploy, push code, restart the server, or perform any CI/CD-like operations for this project.
---

# GONYIK Website Deploy Skill

## Quick Workflow

```
Local build → Git push → Server pull & build → PM2 restart → Health check
```

Run `scripts/deploy.sh` for one-command deployment, or follow the manual steps below.

### Manual Steps

```bash
cd /Users/ccar/Desktop/web_gangyi

# 1. Local build
npm run build

# 2. Commit & push
git add -A
git commit -m "feat: xxx"
git push origin main

# 3. Server deploy (password from .deploy-key.md, decrypt with Caesar cipher offset 3)
ssh root@111.231.141.7
cd /var/www/website_gonyik
git pull
npm run build
pm2 restart gonyik
curl -s http://localhost:3001/api/health
```

## Password Rule

- Read `.deploy-key.md` for the ciphertext and offset
- Decrypt: subtract offset from each character's ASCII code
- **Never hardcode the plaintext password in scripts or commits**
- The deploy script (`scripts/deploy.sh`) decrypts at runtime using Node.js

## One-Command Deploy

```bash
bash .agents/skills/gonyik-deploy/scripts/deploy.sh "feat: your message"
```

The script auto-decrypts the password and runs the full pipeline. If `git push` fails (see Network Issues below), it prints the workaround instructions.

## Network Issues (VPN / GitHub Timeout)

**Symptom:** `git push` times out even though browser/VPN works.

**Root cause:** Some VPN clients only proxy browser HTTP traffic; SSH to `github.com:22` is blocked.

**Workaround — Server Relay Push:**

1. Generate a patch from the local commit:
   ```bash
   git format-patch -1 --stdout > /tmp/deploy.patch
   ```
2. SCP the patch to the server and apply it there:
   ```bash
   sshpass -p 'PASSWORD' scp /tmp/deploy.patch root@111.231.141.7:/tmp/
   sshpass -p 'PASSWORD' ssh root@111.231.141.7 \
     "cd /var/www/website_gonyik && \
      git checkout -- src/pages/CHANGED_FILE.tsx && \
      git config user.email 'deploy@gonyik.com' && \
      git config user.name 'Deploy Bot' && \
      git am /tmp/deploy.patch && \
      git push origin main"
   ```
3. Then proceed with normal server pull + build + restart.

> The server (Tencent Cloud) has direct access to GitHub, so pushing from the server always works.

## Critical Checklist

| Item | Rule |
|------|------|
| `db.json` | Never commit. Managed independently on the server. |
| Server code changes | Must `pm2 restart gonyik` (tsx cache). |
| Build failures | Fix locally before pushing. Never push broken builds. |
| Auto-deploy script | The cron job `scripts/auto-deploy.sh` is unreliable — always deploy manually. |

## Reference

- Detailed server info & diagnostic commands: see `references/server-info.md`
