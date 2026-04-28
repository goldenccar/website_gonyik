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

## 开发注意
1. 修改后台数据会实时写入 `db.json`，但**不要提交 `db.json` 到 Git**（已在 `.gitignore` 中排除）
2. 上传的文件存到 `public/uploads/`，同样被 gitignore
3. 添加新页面需在 `src/App.tsx` 注册路由
4. 添加新后台模块需在 `src/admin/` 创建页面并在 `Dashboard.tsx` 添加导航
