# Deployment server reference

Actual hostnames, addresses, usernames, private keys and filesystem paths belong in local environment configuration or CI secrets, never in the repository.

The deployment account needs only:

- read/write access to `GONYIK_DEPLOY_PATH`;
- permission to run Git, npm and `flock` there;
- permission to reload the single GONYIK PM2 process;
- no interactive password or root login.

The service listens on an internal interface behind TLS termination. Keep this JSON database architecture at one application instance until the database and rate-limit state move to shared external services.

Operational checks:

```bash
pm2 status
pm2 logs gonyik --lines 20
curl -fsS http://localhost:3001/api/health
```

Every release log must identify the old commit, target commit, pre-release database snapshot and health response. Uploads are backed up independently on a daily schedule and restored together with the matching database recovery point.
