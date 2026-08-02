# 港翼官网 Agent 交接指南

## 先读

1. `files/PRD.md`：当前产品、页面、CMS、数据、设计、安全和验收的唯一事实源；
2. `files/COMPETITIVE_AUDIT_2026-08.md`：竞争对标、文案风险和下一步；
3. `files/SECURITY_AND_LOAD.md`：安全、限流、备份和大流量措施；
4. `files/QUALITY_AUDIT.md`：自动质量审计说明。

## 项目概览

- React 19 + TypeScript + Vite + Tailwind CSS；
- Express API + JSON 环境数据库；
- 全站 CMS 路径 `/admin`；
- 默认市场为中国大陆，支持 `/global` 和其他市场路径；
- 字体、图片和关键动效资源自托管；
- 官网展示与获客，不提供零售支付。

## 开始开发

```bash
npm ci
npm run dev
```

发布前：

```bash
npm test
npm run typecheck
npm run build
npm run audit:quality
```

## 数据与资源

- `db.json` 和 `public/uploads/` 不提交 Git；
- 修改 `server/db.ts` 时迁移必须幂等，不能覆盖 CMS 已有内容；
- 系列/装备分类与 SKU/产品是映射关系，禁止级联删除；
- 删除媒体前必须检查引用；
- 精确复刻生产需要同版本数据和 uploads 备份。

## 内容纪律

- 不公开工商/股东关系；
- 不把内部约束写到前台；
- 不把合作方认证泛化到全产品；
- 高校、奖项、认证、医学和性能比较必须可核验；
- 完整 TDS 与测试报告定向提供，不做公开报告下载中心。

## 部署

使用仓库已有部署流程。凭据只允许来自未跟踪的本机文件或 CI secret；不得在文档或源码记录服务器 IP、root 密码、管理员默认密码或 JWT 密钥。

常规发布优先执行：

```bash
npm run deploy
```

本任务如果只要求推送 GitHub，不得自动部署生产。

## 代码约束

- 优先复用现有组件；
- 交互优先使用原生 `button`、`a`、`dialog`、表单控件；
- 页面公共数据走 `/api/bootstrap`，页面域数据走聚合接口；
- 动效优先 transform/opacity，并支持 reduced motion；
- 不覆盖与当前任务无关的用户改动。
