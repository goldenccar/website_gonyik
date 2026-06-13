# Server Info Reference

## Connection

| Item | Value |
|------|-------|
| IP | `111.231.141.7` |
| User | `root` |
| Password | Encrypted in `.deploy-key.md` (Caesar cipher, offset 3) |
| Project path | `/var/www/website_gonyik` |
| Backend service | `gonyik` (PM2), listens `localhost:3001` |
| Nginx config | `/etc/nginx/conf.d/gonyik.conf` |
| PM2 config | `ecosystem.config.cjs` |

## Key Commands

```bash
# PM2 status
pm2 status
pm2 logs gonyik --lines 20

# Port check
ss -tlnp | grep 3001

# API health check
curl -s http://localhost:3001/api/health

# Nginx config
cat /etc/nginx/conf.d/gonyik.conf

# Manual full deploy on server
cd /var/www/website_gonyik
git pull
npm install
npm run build
pm2 reload ecosystem.config.cjs
curl -s http://localhost:3001/api/health
```

## Important Notes

- `db.json` is excluded by `.gitignore` and maintained independently on the server.
- `server/db.ts` `initDatabase()` auto-adds missing fields for backward compatibility.
- Production server runs TypeScript directly via `node --import tsx server/index.ts` (managed by PM2).
- After modifying any file under `server/`, run `pm2 reload gonyik` so the changes take effect.
- `index.html` has `Cache-Control: no-cache`, but CDN/browser may still cache — hard refresh if needed.
