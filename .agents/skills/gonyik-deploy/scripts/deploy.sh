#!/bin/bash
set -e

PROJECT_DIR="/Users/ccar/Desktop/web_gangyi"
SERVER_IP="111.231.141.7"
SERVER_USER="root"
SERVER_PATH="/var/www/website_gonyik"

COMMIT_MSG="${1:-deploy: auto deploy}"

# 从 Caesar cipher 解密密码（密文和偏移量来自 .deploy-key.md）
PASSWORD=$(node -e "const c='Wye_b594;:55;'; const o=3; console.log([...c].map(ch=>String.fromCharCode(ch.charCodeAt(0)-o)).join(''))")

cd "$PROJECT_DIR"

echo "=== Step 1: Local build ==="
npm run build

echo "=== Step 2: Git commit & push ==="
git add -A
git commit -m "$COMMIT_MSG" || echo "No changes to commit"

if ! git push origin main; then
  echo ""
  echo "ERROR: git push failed. Common causes:"
  echo "  1. VPN/proxy blocks SSH to GitHub"
  echo "  2. Network instability"
  echo ""
  echo "Workaround: use server relay push (see SKILL.md -> Network Issues)"
  exit 1
fi

echo "=== Step 3: Server deploy ==="
sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no "${SERVER_USER}@${SERVER_IP}" \
  "cd ${SERVER_PATH} && git pull && npm run build && pm2 restart gonyik && curl -s http://localhost:3001/api/health"

echo ""
echo "=== Deploy finished ==="
