#!/bin/bash
# 自动部署脚本 — 由服务器 crontab 每5分钟调用
# 功能：git pull 检测更新 → 有更新则 build → PM2 重启
set -e

PROJECT_DIR="/var/www/website_gonyik"
LOG_FILE="/var/www/deploy.log"

cd "$PROJECT_DIR"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] 开始检查更新..." >> "$LOG_FILE"

GIT_OUTPUT=$(git pull origin main 2>&1)
echo "$GIT_OUTPUT" >> "$LOG_FILE"

if echo "$GIT_OUTPUT" | grep -q 'Already up to date'; then
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] 无更新，跳过构建" >> "$LOG_FILE"
else
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] 检测到更新，开始构建..." >> "$LOG_FILE"
  npm run build >> "$LOG_FILE" 2>&1
  pm2 restart gonyik >> "$LOG_FILE" 2>&1
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] 部署完成" >> "$LOG_FILE"
fi
