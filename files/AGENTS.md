# 港翼科技 GONYIK 官网 — Agent 开发指南

## 项目速览
- **品牌**：港翼科技（GONYIK）— 科技面料品牌
- **技术栈**：React 19 + TypeScript + Vite + Tailwind CSS + Express + JSON DB
- **内容管理**：全站内容通过 `/admin` 后台维护，数据存在 `db.json`
- **字体**：Inter（英文）+ 阿里巴巴普惠体（中文）

## 关键文件
| 文件 | 作用 |
|------|------|
| `files/PROJECT_LOG.md` | 完整项目决策记录、功能清单、待办事项 |
| `files/PRD.md` | 原始产品需求文档 |
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

> **目标**：任何 AI Agent 或开发者换设备后，都能直接执行这套「修改 → 同步到 GitHub → 部署到服务器」的流程，且支持 Windows / macOS / Linux。
> **密码**：服务器 root 密码已加密存储在本地 `.deploy-key.md`，部署脚本会自动读取解密，**不要硬编码到代码里**。

### 服务器信息
| 项目 | 详情 |
|------|------|
| 供应商 | 腾讯云 CVM |
| IP | `111.231.141.7` |
| 系统 | OpenCloudOS 9.4 |
| 登录用户 | `root` |
| 密码 | 凯撒密码加密：`Wyeb594;:55;`（偏移量见本地 `.deploy-key.md`） |
| 项目路径 | `/var/www/website_gonyik` |
| 后端服务 | `gonyik` (PM2 管理)，监听 `localhost:3001` |
| PM2 配置 | `ecosystem.config.cjs` |
| nginx | 80 端口 → 反向代理到 `localhost:3001`，配置在 `/etc/nginx/conf.d/gonyik.conf` |
| 定时任务 | `*/5 * * * *` 执行 `scripts/auto-deploy.sh`（已修复为通过 commit hash 判断更新） |

### 一键部署（推荐）

```bash
npm run deploy
```

非交互模式（Agent 自动执行）：

```bash
npm run deploy -y
```

该命令会依次完成：本地构建 → Git 提交 → Git 推送 → SSH 登录服务器 → 拉代码 → 安装依赖 → 构建 → PM2 重启 → 健康检查。

### 完整手动部署命令

**第 1 步：本地验证 + 推送**
```bash
npm run build          # 确保本地构建通过
git add -A
git commit -m "feat: xxx"
git push origin main
```

**第 2 步：SSH 到服务器执行部署**
```bash
ssh root@111.231.141.7
cd /var/www/website_gonyik
git pull
npm install
npm run build
pm2 reload ecosystem.config.cjs
curl -s http://localhost:3001/api/health
```

### 关键注意事项

| 问题 | 说明 |
|------|------|
| `db.json` 不提交 | 被 `.gitignore` 排除，服务器上独立维护 |
| 向后兼容 | `server/db.ts` 的 `initDatabase()` 会自动补全新增字段，**一般无需手动修改服务器 db.json** |
| 服务端运行方式 | 生产环境使用 `node --import tsx server/index.ts`（PM2 管理），修改 `server/` 代码后必须 `pm2 reload gonyik` |
| 前端缓存 | `index.html` 已加 `Cache-Control: no-cache`，但 CDN/浏览器仍可能缓存，清缓存或硬刷新 |
| 自动部署 | `scripts/auto-deploy.sh` 每 5 分钟检查一次，通过 commit hash 判断是否有更新 |
| 跨平台 | 优先使用 `npm run deploy`，不要依赖硬编码的本地路径 |

### 日常诊断命令
```bash
# 查看 PM2 状态
pm2 status
pm2 logs gonyik --lines 20

# 查看后端端口
ss -tlnp | grep 3001

# 测试 API
curl -s http://localhost:3001/api/health

# 查看 nginx 配置
cat /etc/nginx/conf.d/gonyik.conf
```

---

## 开发注意
1. 上传的文件存到 `public/uploads/`，被 gitignore 排除
2. 添加新页面需在 `src/App.tsx` 注册路由
3. 添加新后台模块需在 `src/admin/` 创建页面并在 `Dashboard.tsx` 添加导航
4. 导航/页面配置等运营数据通过 `/admin` 后台维护，存在 `db.json` 中。修改 `server/db.ts` 的默认数据后，需手动同步到服务器上的 `db.json`（或清理 db.json 让服务器重启时重新初始化）
