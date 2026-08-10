---
name: gonyik-deploy
description: Deploy the GONYIK website from a verified, committed local main branch to the configured production server.
---

# GONYIK deployment

The repository has one production trigger:

```bash
npm run deploy
```

Deployment does not stage or commit files. It stops on a dirty worktree, runs `npm run test:release` unless the exact source fingerprint was recently verified, pushes the committed `main` HEAD, then deploys that commit over SSH.

## Required local or CI environment

```text
GONYIK_DEPLOY_HOST
GONYIK_DEPLOY_USER
GONYIK_DEPLOY_PATH
GONYIK_DEPLOY_SSH_KEY
GONYIK_DEPLOY_PORT             # optional, defaults to 22
GONYIK_DEPLOY_KNOWN_HOSTS      # optional custom known_hosts path
```

Use a dedicated non-root deployment account with the minimum repository and PM2 permissions. The SSH key must not have a password fallback. Host verification is strict and uses the system `known_hosts` unless `GONYIK_DEPLOY_KNOWN_HOSTS` is supplied.

## Release behavior

The remote release acquires a `flock`, records the old and target commits, copies `db.json` to `backups/db-<UTC time>-<commit>.json`, checks out the exact pushed commit, runs `npm ci` only when package files changed, builds the client, reloads PM2 and verifies that `/api/health` reports the target commit.

If health verification fails, the output prints the previous commit and database snapshot path. Restore data only when migration damage is confirmed; do not automatically overwrite current data.

New servers use `scripts/server-setup.sh`. Uploads require a separate scheduled backup and restore policy. No repository script installs a polling deployment cron.

See `references/server-info.md` for variable and permission guidance.
