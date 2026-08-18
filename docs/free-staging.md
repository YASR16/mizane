# Free public beta (0 DH)

Cloudflare Pages / Workers cannot host Mizane: Node PDF/upload APIs, Prisma, Auth.js and cron need a Node server.

Fly.io is **not free** for new accounts (pay-as-you-go). Do not create a Fly app unless you accept billing.

## Target stack (all $0)

| Layer | Provider | Public hostname | Limits |
| --- | --- | --- | --- |
| App | Render Free web service (Frankfurt) | `https://<name>.onrender.com` | 512 MB RAM, sleeps after 15 min, ~30–60 s cold start |
| Postgres | Neon Free | connection string | 0.5 GB storage, scale-to-zero after 5 min |
| CV files | `STORAGE_DRIVER=postgres` (private BYTEA) | no public URL | counts toward Neon 0.5 GB; switch to Cloudflare R2 when you have an account |
| Payments | `PAYMENT_PROVIDER=disabled` | — | UI: « Paiement bientôt disponible ». No unlock. |
| Cron | [cron-job.org](https://cron-job.org) free | hits `/api/cron/purge` | daily |

## Owner steps (cannot be automated here)

This machine has no Render/Neon/Cloudflare login, no GitHub CLI, and no git remote.

### 1. Neon Postgres (free, no card)

1. Open https://console.neon.tech/signup
2. Sign in with GitHub (or email). No password of yours is stored in this repo.
3. New project, region **Europe (Frankfurt or Paris)**.
4. Copy the connection string.
5. Store it as Render env `DATABASE_URL` (never commit it).

### 2. Render web service (free, no card)

1. Open https://dashboard.render.com/register
2. Sign in with **GitHub**.
3. Push this repo to GitHub (first commit), then New → Web Service → this repo.
4. Instance: **Free**, region **Frankfurt**, Docker runtime (`Dockerfile`).
5. After the first deploy, set:
   - `NEXT_PUBLIC_APP_URL` = `https://<service>.onrender.com`
   - `AUTH_URL` = same value
   - `AUTH_SECRET` = 32+ random chars
   - `CRON_SECRET` = random
   - `ADMIN_PASSWORD` = 12+ chars, not `change-me-now`
   - `DATABASE_URL` = Neon URI
6. Redeploy so `NEXT_PUBLIC_*` is baked in.

Optional Blueprint: `render.yaml` (you still paste secrets in the dashboard).

### 3. Daily purge (free)

1. Open https://cron-job.org/en/signup/
2. Job: daily `POST https://<service>.onrender.com/api/cron/purge`
3. Header: `Authorization: Bearer <CRON_SECRET>`

## Backup / restore (tested locally)

- **Location:** `backups/mizane-local.dump` (gitignored). Size on 2026-08-18: 45 412 bytes.
- **How:** `docker compose exec postgres pg_dump -U mizane -d mizane -F c -f /tmp/mizane.dump`
- **Restore (throwaway DB only):** `createdb mizane_restore` then `pg_restore -d mizane_restore --no-owner --no-acl`.
- **Result:** PASS. Restored 19 relations including `PrivateObject`. Counts: 3 users, 6 CV documents, 6 payments.
- **Neon Free:** 6-hour instant restore window; no extra paid backup product. Render Free Postgres is **not** used (expires in 30 days).
- **Frequency on free stack:** manual dump after meaningful data, plus Neon history. Daily cron-job.org for CV purge is separate.

- Cloudflare R2: https://dash.cloudflare.com → R2 → create **private** bucket → `STORAGE_DRIVER=s3`
- Sentry: https://sentry.io/signup/ → project DSN → `SENTRY_DSN` (server only)
- Google Search Console: https://search.google.com/search-console → URL prefix = Render URL → paste `GOOGLE_SITE_VERIFICATION`
- Bing Webmaster: https://www.bing.com/webmasters → same URL → `BING_SITE_VERIFICATION` / IndexNow key
