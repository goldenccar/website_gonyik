#!/bin/bash
# 自动部署脚本 — 由服务器 crontab 每5分钟调用
# 功能：git pull 检测更新 → 有更新则 install → build → PM2 重启
set -e

PROJECT_DIR="/var/www/website_gonyik"
LOG_FILE="/var/www/deploy.log"

cd "$PROJECT_DIR"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] 开始检查更新..." >> "$LOG_FILE"

# 通过 commit hash 判断是否有更新，避免 locale 影响
BEFORE=$(git rev-parse HEAD)
git pull origin main >> "$LOG_FILE" 2>&1
AFTER=$(git rev-parse HEAD)

if [ "$BEFORE" = "$AFTER" ]; then
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] 无更新，跳过构建" >> "$LOG_FILE"
else
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] 检测到更新 ($BEFORE -> $AFTER)，开始部署..." >> "$LOG_FILE"
  npm install >> "$LOG_FILE" 2>&1
  npm run build >> "$LOG_FILE" 2>&1
  mkdir -p logs
  pm2 reload ecosystem.config.cjs >> "$LOG_FILE" 2>&1
  curl -s http://localhost:3001/api/health >> "$LOG_FILE" 2>&1
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] 部署完成" >> "$LOG_FILE"
fi
