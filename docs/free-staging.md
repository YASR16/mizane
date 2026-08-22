# Free public beta (0 DH)

Docker on a Node host remains the supported runtime. Cloudflare OpenNext was re-checked (Aug 2026): Workers **Free** is 10 ms CPU, 128 MB, 3 MB gzip — unusable for PDF parse, Prisma, and CV analysis. Do not add an OpenNext branch. Keep the Dockerfile for later Fly/Koyeb/Render paid production.

## Hosting reality (2026-08-22)

Public staging runs on **Back4App Containers Free** (≈256 MB RAM, USA, port 8000).

| Item | Value |
| --- | --- |
| Public URL (current temporary) | `https://mizane-kntol4ix.b4a.run` |
| Previous temporary URL | `https://mizane-fft13q12.b4a.run` (expired → CloudFront 404) |
| Health | `GET /api/health` → `{"ok":true,"env":"staging","paymentsEnabled":false}` |
| Database | Neon Free project `floral-sky-97693789` (`neondb`) |
| Storage | `STORAGE_DRIVER=postgres` (private BYTEA) |
| Runtime | Node 22, Next.js 16 standalone, Docker multi-stage |
| Memory cap | `NODE_OPTIONS=--max-old-space-size=192` |
| Cost | **0 DH/month** (do not Upgrade / Permanent URL / Change Plan) |

The dashboard still labels the URL **temporary (~60 minutes)**. Redeploy on Free refreshes the temporary hostname when it expires. Update `NEXT_PUBLIC_APP_URL` and `AUTH_URL` to the new `https://….b4a.run` (no trailing slash), then **rebuild**. Keep `AUTH_TRUST_HOST=true`.

Prisma migrations run at container start via `scripts/start-koyeb.sh` (direct Neon host for DDL; pooled host OK for runtime). Init migration must be UTF-8 **without BOM**.

| Host | Result |
| --- | --- |
| Cloudflare Workers + OpenNext | Rejected: 10 ms CPU / 128 MB / 3 MB worker. |
| Cloudflare Pages / Containers | Rejected (Workers limits / paid). |
| Zeabur / Oracle / Seenode / SnapDeploy | Rejected (card, trial, or Turnstile). |
| Back4App Containers | **Live 0 DH Docker host** — use this. |
| Render / Koyeb / Fly | Card or paid for new accounts. |

Do **not** add a credit card to bypass any of the above.

## Target stack

| Layer | Provider | Notes |
| --- | --- | --- |
| App | Docker Node 22, `PORT=8000`, `scripts/start-koyeb.sh` | migrate then `node server.js` |
| Postgres | Neon Free | 0.5 GB; scale-to-zero |
| CV files | `STORAGE_DRIVER=postgres` | Switch to R2 in production |
| Payments | `PAYMENT_PROVIDER=disabled` | UI: « Paiement bientôt disponible » |
| Cron | cron-job.org free → `POST /api/cron/purge` | Owner sets Bearer `CRON_SECRET` |

## Staging env (names only — values live in host / gitignored files)

- `MIZANE_ENV=staging`
- `NODE_ENV=production`
- `PAYMENT_PROVIDER=disabled`
- `STORAGE_DRIVER=postgres`
- `AUTH_TRUST_HOST=true`
- `PORT=8000`
- `CV_RETENTION_DAYS=30`
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `AUTH_SECRET` / `CRON_SECRET`
- `DATABASE_URL` (Neon — never in git or chat)
- `NEXT_PUBLIC_APP_URL` / `AUTH_URL` = current temporary HTTPS URL → **rebuild** when URL changes
- `NODE_OPTIONS=--max-old-space-size=192`

## Deploy / migrate notes

1. Push to `master` (Back4App GitHub build).
2. Or Action → Deploy the latest commit.
3. Start script: strip `-pooler.` for migrate; on failure `prisma migrate resolve --rolled-back 20260817170000_init` then retry deploy.
4. Confirm logs: migrations applied, Next Ready on `:8000`, health 200.

## Public verification

```bash
AUDIT_BASE=https://mizane-kntol4ix.b4a.run npx tsx scripts/public-beta-audit.ts
```

Covers health, locales, register/login, CV upload/analysis, hostile uploads, payment lock, IDOR, privacy delete, noindex.

Upload rate limit: **20 / 10 min** in staging, **8 / 10 min** otherwise.

## Owner-only (non-blocking for basic beta)

- cron-job.org → daily `POST https://<host>/api/cron/purge` with `Authorization: Bearer <CRON_SECRET>`
- Google Search Console / Bing prefix verification → `GOOGLE_SITE_VERIFICATION` / `BING_SITE_VERIFICATION`
- Optional Sentry free → `SENTRY_DSN` (server only)
- When temporary URL expires: redeploy Free (never Upgrade) and update APP/AUTH URLs

## Rollback

GitHub `master`. Redeploy last known-good image. Restore Postgres only onto a **throwaway** database (`CONFIRM_RESTORE=yes`).

## Known limitations (staging)

- Payments disabled on purpose. No mock unlock in staging/production.
- Temporary Back4App Free URL (~60 min); hostname can change after redeploy.
- Postgres BYTEA for CVs counts toward Neon 0.5 GB.
- Free PaaS cold starts; distinguish from persistent latency.
- Heap capped at 192 MB inside ~256 MB container — CV analysis must stay streaming/cleanup-friendly.
- Production still needs live Payzone, private R2, EU VM, and a real domain.
