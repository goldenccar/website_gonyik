# 港翼科技官网

当前项目说明以 [files/PRD.md](files/PRD.md) 为准。该文档覆盖产品定位、全部路由、CMS、数据关系、视觉、性能、安全、部署和验收，可作为新 Agent 的重建基线。

## 本地启动

```bash
npm ci
npm run dev
```

## 发布前检查

```bash
npm test
npm run typecheck
npm run build
npm run audit:quality
```

## 重要边界

- `db.json` 与 `public/uploads/` 是环境数据，不随 Git 分发；
- 精确复刻生产内容必须恢复同版本 CMS 数据和媒体备份；
- 不要在源码或文档中写管理员密码、服务器凭据或密钥；
- 只要求推送 GitHub 时，不要部署生产。

更多说明：

- [Agent 交接](files/AGENTS.md)
- [竞争对标与 TODO](files/COMPETITIVE_AUDIT_2026-08.md)
- [安全与负载](files/SECURITY_AND_LOAD.md)
- [质量审计](files/QUALITY_AUDIT.md)
