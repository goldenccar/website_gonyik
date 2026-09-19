# 港翼科技官网

当前项目说明以 [files/PRD.md](files/PRD.md) 为准。该文档覆盖产品定位、全部路由、CMS、数据关系、视觉、性能、安全、部署和验收，可作为新 Agent 的重建基线。

## 本地启动

当前审阅基线为 2026-09-19 已发布版本 `462ca42`。逐页修改请使用已经同步生产公开内容的预览：

```bash
npm run review:local
```

地址：`http://127.0.0.1:5180/`。同步与旧稿恢复说明见 [当前生产基线](files/PRODUCTION_BASELINE_2026-09-19.md)。

2026-09-19 材料科技审阅版已发布生产，生产代码版本为 `52f5b87`，入口为 `/pfas-free-innovation/rpo-material-platform`。发布范围、内容迁移与验证见 [RPO 发布记录](files/RELEASE_RPO_2026-09-19.md)。本地预览保留同一审阅内容，最初同步快照仍保留旧版本信息供追溯。

默认开发服务器仍可使用以下命令，但它读取的是根目录数据库，不保证与当前线上内容一致：

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
