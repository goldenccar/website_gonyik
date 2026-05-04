#!/bin/bash
# 服务器初始化脚本 — 新服务器首次部署时运行
# 功能：安装依赖、克隆项目、构建、PM2 启动、配置定时任务
set -e

PROJECT_DIR="/var/www/website_gonyik"
REPO_URL="git@github.com:goldenccar/website_gonyik.git"

echo "=== GONYIK 服务器初始化 ==="

# 1. 安装系统依赖
echo "[1/6] 检查依赖..."
if ! command -v node &> /dev/null; then
  echo "正在安装 Node.js..."
  curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
  yum install -y nodejs
fi
if ! command -v git &> /dev/null; then
  yum install -y git
fi
if ! command -v pm2 &> /dev/null; then
  npm install -g pm2
fi

# 2. 创建目录
echo "[2/6] 创建项目目录..."
mkdir -p /var/www
cd /var/www

# 3. 克隆项目（如果目录不存在）
if [ ! -d "$PROJECT_DIR/.git" ]; then
  echo "[3/6] 克隆项目..."
  git clone "$REPO_URL" "$PROJECT_DIR"
else
  echo "[3/6] 项目已存在，跳过克隆"
fi

cd "$PROJECT_DIR"

# 4. 安装依赖并构建
echo "[4/6] 安装依赖..."
npm install
echo "[5/6] 构建项目..."
npm run build

# 5. PM2 启动
echo "[6/6] 启动服务..."
pm2 start dist/server/index.js --name gonyik || pm2 restart gonyik
pm2 save

# 6. 配置定时任务
echo "配置自动部署定时任务..."
(crontab -l 2>/dev/null | grep -v auto-deploy; echo "*/5 * * * * /bin/bash /var/www/website_gonyik/scripts/auto-deploy.sh") | crontab -

echo "=== 初始化完成 ==="
echo "项目路径: $PROJECT_DIR"
echo "服务状态:"
pm2 status
echo ""
echo "定时任务:"
crontab -l
echo ""
echo "后续更新：代码 push 到 GitHub 后，服务器每5分钟自动拉取并部署"
