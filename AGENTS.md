# 港翼科技 GONYIK 官网 — Agent 开发指南

## 项目速览
- **品牌**：港翼科技（GONYIK）— 科技面料品牌
- **技术栈**：React 19 + TypeScript + Vite + Tailwind CSS + Express + JSON DB
- **内容管理**：全站内容通过 `/admin` 后台维护，数据存在 `db.json`
- **字体**：Inter（英文）+ 阿里巴巴普惠体（中文）

## 关键文件
| 文件 | 作用 |
|------|------|
| `PROJECT_LOG.md` | 完整项目决策记录、功能清单、待办事项 |
| `PRD.md` | 原始产品需求文档 |
| `server/db.ts` | 数据库定义和默认数据 |
| `src/api/client.ts` | 前端 API 封装 |
| `src/components/Header.tsx` | 全局导航（GORE-TEX 风格） |
| `src/components/Footer.tsx` | 全局页脚 + 社交媒体 + 后台入口 |

## 设计规范
- **色彩**：主背景 `#EDEDED`，深黑 `#0D0D0D`，主文字 `#1A1A1A`
- **卡片/按钮**：无圆角（`0px`）
- **页面水平内边距**：48px（桌面）/ 24px（移动端）
- **响应式**：iPhone 375px 为基准移动端适配

## 后台管理
- 入口：`http://localhost:5173/admin` 或 Footer 右下角齿轮
- 账号：`admin`
- 密码：`888888`

## 部署工作流（核心）

> **目标**：任何 AI Agent 或开发者换设备后，都能直接执行这套「修改 → 同步到 GitHub → 部署到服务器」的流程。
> **密码**：服务器 root 密码不记得时直接问用户，**不要猜测或硬编码**。

### 服务器信息
| 项目 | 详情 |
|------|------|
| 供应商 | 腾讯云 CVM |
| IP | `111.231.141.7` |
| 系统 | OpenCloudOS 9.4 |
| 登录用户 | `root` |
| 密码 | 凯撒密码加密：`Wye_b594;:55;`（偏移量见本地 `.deploy-key.md`） |
| 项目路径 | `/var/www/website_gonyik` |
| 后端服务 | `gonyik` (PM2 管理)，监听 `localhost:3001` |
| nginx | 80 端口 → 反向代理到 `localhost:3001`，配置在 `/etc/nginx/conf.d/gonyik.conf` |
| 定时任务 | 理论上 `*/5 * * * *` 执行 `scripts/auto-deploy.sh`（**实际经常失效，需手动部署**） |

### 完整手动部署命令（每次改完代码必执行）

**第 1 步：本地验证 + 推送**
```bash
cd /Users/ccar/Desktop/web_gangyi
npm run build          # 确保本地构建通过
git add -A
git commit -m "feat: xxx"
git push origin main
```

**第 2 步：SSH 到服务器执行部署**
```bash
# SSH 登录（密码问用户）
ssh root@111.231.141.7

# 进入项目目录
cd /var/www/website_gonyik

# 拉取最新代码
git pull

# 构建前端
npm run build

# 重启后端（tsx 有缓存，server 代码修改后必须重启）
pm2 restart gonyik

# 验证后端是否存活
curl -s http://localhost:3001/api/equipment/categories
```

**或用 sshpass 一键执行（需先装 sshpass）**
```bash
# 密码问用户，替换 PASSWORD
sshpass -p 'PASSWORD' ssh -o StrictHostKeyChecking=no root@111.231.141.7 \
  'cd /var/www/website_gonyik && git pull && npm run build && pm2 restart gonyik'
```

### 关键注意事项

| 问题 | 说明 |
|------|------|
| `db.json` 不提交 | 被 `.gitignore` 排除，服务器上独立维护 |
| 向后兼容 | `server/db.ts` 的 `initDatabase()` 会自动补全新增字段，**一般无需手动修改服务器 db.json** |
| tsx 缓存 | 修改 `server/` 下任何代码后，**必须** `pm2 restart gonyik`，否则新代码不生效 |
| 前端缓存 | `index.html` 已加 `Cache-Control: no-cache`，但 CDN/浏览器仍可能缓存，清缓存或硬刷新 |
| 自动部署失效 | `scripts/auto-deploy.sh` 定时任务经常不工作，**不要依赖它**，改完代码手动部署 |
| 密码使用规则 | **有完整上下文时**（能直接看到本行密码）可直接使用；**上下文压缩后**（看不到密码）**必须先询问用户** |

### 日常诊断命令
```bash
# 查看 PM2 状态
pm2 status
pm2 logs gonyik --lines 20

# 查看后端端口
ss -tlnp | grep 3001

# 测试 API
curl -s http://localhost:3001/api/equipment/scenes

# 查看 nginx 配置
cat /etc/nginx/conf.d/gonyik.conf
```

---

## 开发注意
1. 上传的文件存到 `public/uploads/`，被 gitignore 排除
2. 添加新页面需在 `src/App.tsx` 注册路由
3. 添加新后台模块需在 `src/admin/` 创建页面并在 `Dashboard.tsx` 添加导航
4. 导航/页面配置等运营数据通过 `/admin` 后台维护，存在 `db.json` 中。修改 `server/db.ts` 的默认数据后，需手动同步到服务器上的 `db.json`（或清理 db.json 让服务器重启时重新初始化）
