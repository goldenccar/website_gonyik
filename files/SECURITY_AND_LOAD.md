# 轻量生产防护基线

代码层已经启用：安全响应头、同源/白名单 CORS、请求体上限、全局 API 限流、登录限流、联系表单限流、健康检查与冒烟测试。

生产部署保持简单：

1. 只开放 80/443，由 Nginx 或 CDN 终止 TLS；Node 端口仅监听内网。
2. Nginx/CDN 开启 Brotli 或 Gzip、静态资源缓存和单 IP 基础限速。
3. `NODE_ENV=production`，并设置不少于 32 字符的随机 `JWT_SECRET`；如经过一层反向代理则设置 `TRUST_PROXY=1`；`ALLOWED_ORIGINS` 只填写正式域名。缺少合格密钥时后台登录会拒绝启动令牌签发，避免退回公开默认密钥。
4. 用 systemd 或现有 PM2 `ecosystem.config.cjs` 自动重启进程；访问量上升时先增加到 2 个无状态实例，再由反向代理分流。
5. CDN 开启托管 WAF、Bot/挑战模式和 DDoS 基础防护。发现攻击时先提高挑战级别、临时收紧 `/api/admin` 与 `/api/contact`，不要直接暴露源站 IP。
6. 每日备份 `db.json` 与 `public/uploads`，保留至少 7 个版本；恢复演练比只“有备份”更重要。
7. 每次发布前运行 `npm test && npm run build`，并定期运行 `npm audit --omit=dev`。

上传接口只接受服务端白名单中的 JPEG、PNG、GIF、WebP、PDF 与常见视频格式，文件名和扩展名由服务端生成；SVG 不通过 CMS 上传，避免同源可执行内容风险。

此方案适合当前单机 CMS。若以后改为多实例，内存限流应迁移到 Redis，`db.json` 应迁移到可并发写入的数据库。

## 依赖审计说明

当前 `react-router` 漏洞库会对 7.12 及以上版本报告 RSC Server Action 的 CSRF 告警。本站只使用浏览器端 `Routes`/`BrowserRouter`，没有启用 React Server Components、Framework Mode 或 Server Action，相关攻击面不存在；不为消除扫描提示而强制降级。继续跟踪上游安全版本，待有正常升级路径时更新。
