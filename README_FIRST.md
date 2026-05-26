# README_FIRST — 港翼科技 GONYIK 官网

> **先看这个文档**，它会告诉你这个项目有哪些文档、什么时候该看哪个。

---

## 项目一句话

港翼科技（GONYIK）科技面料品牌官网 —— React + Express + JSON DB，全站内容通过 `/admin` 后台 CMS 维护，零代码更新。

---

## 文档地图

| 文档 | 什么时候看 | 核心内容 |
|------|-----------|---------|
| **[AGENTS.md](./AGENTS.md)** | **Agent/开发者第一次接手项目** | 技术栈、设计规范、关键文件、部署工作流（含服务器信息、密码规则）、开发注意事项 |
| **[PRD.md](./PRD.md)** | 需要了解产品全貌、需求细节、技术架构时 | 产品需求文档：目标用户、设计原则、完整技术栈、页面模块详解、数据结构设计 |
| **[PROJECT_LOG.md](./PROJECT_LOG.md)** | 需要了解项目历史、当前功能清单、待办事项、启动方式时 | 项目决策记录、已实现功能、待办列表、`npm run dev/build` 命令 |
| **[CONTENT_STRATEGY.md](./CONTENT_STRATEGY.md)** | 需要撰写/修改品牌文案、理解产品定位时 | 品牌定位、信息架构、各页面文案规范、图片需求、SEO 关键词 |
| **[.deploy-key.md](./.deploy-key.md)** | **需要 SSH 登录服务器执行部署时** | 服务器 root 密码（凯撒密码加密，偏移量见文件内）。**本地文件，勿提交到 Git** |
| **[.agents/skills/gonyik-deploy/SKILL.md](./.agents/skills/gonyik-deploy/SKILL.md)** | **需要执行部署操作时** | 一键部署脚本、完整部署工作流、VPN 网络异常处理方案（服务器中转 push） |
| **[.agents/skills/gonyik-deploy/references/server-info.md](./.agents/skills/gonyik-deploy/references/server-info.md)** | 需要服务器诊断、PM2/nginx 操作时 | 服务器 IP/路径/服务名、常用诊断命令 |

---

## 快速决策：我现在该看什么？

```
我是新接手的 Agent/开发者？
  └─→ 先看 AGENTS.md

我要了解产品做了什么、还有什么没做？
  └─→ 看 PROJECT_LOG.md

我要改文案、写内容、理解品牌定位？
  └─→ 看 CONTENT_STRATEGY.md

我要了解原始产品需求和技术架构？
  └─→ 看 PRD.md

我要部署代码到服务器？
  └─→ 看 .agents/skills/gonyik-deploy/SKILL.md
  └─→ 密码在 .deploy-key.md（本地文件，勿提交）

服务器出问题了，需要诊断？
  └─→ 看 .agents/skills/gonyik-deploy/references/server-info.md
```

---

## 项目关键信息（备忘）

| 项目 | 详情 |
|------|------|
| 技术栈 | React 19 + TypeScript + Vite + Tailwind CSS + Express + JSON DB |
| 后台入口 | `/admin`（账号 `admin` / 密码 `888888`） |
| 本地开发 | `npm run dev`（前后端同时启动） |
| 生产构建 | `npm run build` |
| 部署服务器 | 腾讯云 `111.231.141.7`（详见 AGENTS.md & deploy skill） |

---

*本文档只负责导航，具体内容请进入对应文档阅读。*
