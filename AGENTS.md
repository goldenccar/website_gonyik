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

## 自动化部署工作流（核心）

> **目标**：任何 AI Agent 或开发者换设备后，都能直接执行这套「修改 → 同步到 GitHub → 自动部署到服务器」的流程。

### 流程图
```
本地修改代码 → git commit → git push origin main
                          ↓
              GitHub 仓库 (goldenccar/website_gonyik)
                          ↓
      腾讯云服务器每5分钟自动 git pull + build + PM2 重启
```

### 服务器信息
| 项目 | 详情 |
|------|------|
| 供应商 | 腾讯云 CVM |
| IP | `111.231.141.7` |
| 系统 | OpenCloudOS 9.4 |
| 登录用户 | `root` |
| 密码 | `Tvb_26187228` |
| 项目路径 | `/var/www/website_gonyik` |
| 服务进程 | `gonyik` (PM2 管理) |
| 定时任务 | `*/5 * * * *` 执行 `scripts/auto-deploy.sh` |
| 部署日志 | `/var/www/deploy.log` |

### 当前环境（已配置）
- Node.js v20.19.0 ✅
- Git 2.43.7 ✅
- PM2 ✅
- 自动部署脚本 ✅
- Crontab 定时任务 ✅

### 新服务器初始化（如需迁移）
```bash
# 1. SSH 登录服务器
ssh root@111.231.141.7
# 密码: Tvb_26187228

# 2. 运行初始化脚本
bash /var/www/website_gonyik/scripts/server-setup.sh
```

### 日常操作命令
```bash
# 查看服务状态
pm2 status

# 手动重启
pm2 restart gonyik

# 查看部署日志
cat /var/www/deploy.log

# 手动触发部署
bash /var/www/website_gonyik/scripts/auto-deploy.sh
```

### 部署脚本说明
| 文件 | 用途 |
|------|------|
| `scripts/auto-deploy.sh` | 服务器定时执行：git pull → 有更新则 build → PM2 重启 |
| `scripts/server-setup.sh` | 新服务器首次运行：安装依赖、克隆项目、构建、启动 PM2、配置定时任务 |

---

## 开发注意
1. 上传的文件存到 `public/uploads/`，被 gitignore 排除
2. 添加新页面需在 `src/App.tsx` 注册路由
3. 添加新后台模块需在 `src/admin/` 创建页面并在 `Dashboard.tsx` 添加导航
4. 导航/页面配置等运营数据通过 `/admin` 后台维护，存在 `db.json` 中。修改 `server/db.ts` 的默认数据后，需手动同步到服务器上的 `db.json`（或清理 db.json 让服务器重启时重新初始化）
