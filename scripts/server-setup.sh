#!/bin/bash
# Run once as the dedicated deploy user after Node.js, Git, PM2 and flock are installed.
set -euo pipefail

: "${GONYIK_DEPLOY_PATH:?GONYIK_DEPLOY_PATH is required}"
: "${GONYIK_REPOSITORY_URL:?GONYIK_REPOSITORY_URL is required}"

if [ ! -d "$GONYIK_DEPLOY_PATH/.git" ]; then
  git clone "$GONYIK_REPOSITORY_URL" "$GONYIK_DEPLOY_PATH"
fi

cd "$GONYIK_DEPLOY_PATH"
npm ci
npm run build:client
mkdir -p logs backups public/uploads
pm2 start ecosystem.config.cjs
pm2 save

echo "Server initialized. Releases are triggered only by npm run deploy; no polling cron was installed."
