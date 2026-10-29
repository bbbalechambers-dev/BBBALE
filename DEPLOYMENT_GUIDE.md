# Setup and deployment guide

## 1. Install dependencies
Use Node.js 24.12.0 or newer (the lockfile contains packages with that minimum requirement). From the project directory run:

```bash
npm ci
```

## 2. Build the frontend

```bash
npm run build:cloudflare
```

## 3. Verify deployment configuration

```bash
node scripts/predeploy-check.mjs
```

This intentionally fails until `wrangler.jsonc` contains the **verified existing production D1 database name and ID**. Make the same change in `wrangler.toml` so the two configurations remain consistent. Do not guess the database ID and do not create a replacement database just to make the check pass.

## 4. Configure secrets
Set any required secret values using Wrangler secrets rather than committing them to GitHub. For the counsel bypass feature, configure `COUNSEL_BYPASS_TOKEN` only if the feature is genuinely needed. Never place secret values in `.env.example`, source code, or GitHub commits.

## 5. Before any deployment
- Export/backup the existing D1 database and verify the backup is usable.
- Verify the target Worker and D1 binding in the Cloudflare Dashboard.
- Complete the authentication, authorization, and password-storage release blockers listed in `REBUILD_STATUS.md`.
- Run `npm run lint`, `npm run build:cloudflare`, and `npx wrangler deploy --dry-run` after dependencies are installed.
- Test login and create/read/update/delete on two devices using staging data. Confirm saved records survive a Worker restart.

Do not deploy this package to production until these checks pass.
