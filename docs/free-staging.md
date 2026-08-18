# Free public beta (0 DH)

Docker on a Node host remains the supported runtime. Cloudflare OpenNext was re-checked (Aug 2026): Workers **Free** is 10 ms CPU, 128 MB, 3 MB gzip — unusable for PDF parse, Prisma, and CV analysis. Do not add an OpenNext branch. Keep the Dockerfile for later Fly/Koyeb/Render paid production.

## Hosting reality (2026-08-18)

The app is **staging-ready**. Back4App Free container **mizane** exists at `https://mizane-fft13q12.b4a.run` but is not a durable public beta yet: the first Docker build failed, the free URL is labeled **temporary (60 minutes)**, and `DATABASE_URL` is still empty on the host.

| Host | Result |
| --- | --- |
| Cloudflare Workers + OpenNext | Rejected: 10 ms CPU / 128 MB / 3 MB worker. Analysis and PDF cannot run. |
| Cloudflare Pages | Same Workers runtime for Next.js. Rejected. |
| Cloudflare Containers | Requires Workers Paid $5/month. Rejected. |
| Zeabur Free | Shared cluster deprecated; first project needs phone, credits, or card. Rejected. |
| Oracle Always Free | Card required for identity. Rejected. |
| Seenode | 7-day trial only. Rejected (no paid trials). |
| SnapDeploy | 512 MB Docker, no card, HTTPS. Blocked here: Cloudflare Turnstile + email signup. |
| Back4App Containers | **Chosen 0 DH Docker host**. App created (Free, 256 MB, USA, GitHub `YASR16/mizane` `master`, port 8000). First build failed: Node 22 alpine `npm ci` missing `@emnapi/core@1.11.3` / `@emnapi/runtime@1.11.3` from a Windows lockfile. Do not click Upgrade / Change Plan. |
| Render / Koyeb / Fly / HF Docker / Northflank | Card or paid plan for new accounts. |

Do **not** add a credit card to bypass any of the above.

Selected next deploy: **Back4App Containers** using the existing Dockerfile (`PORT=8000`). Deps stage uses `npm ci --ignore-scripts` so Prisma generate runs after the full source copy. Set `NODE_OPTIONS=--max-old-space-size=192` on that host so the process fits in 256 MB. Docker image stays multi-stage for later 512 MB+ production hosts.

Reuse Neon Free Postgres (`floral-sky-97693789`). Paste `DATABASE_URL` only in the future host’s env (never in git or chat).

## Target stack when a $0 Node host exists

| Layer | Provider | Notes |
| --- | --- | --- |
| App | Docker Node 22, `PORT=8000`, `scripts/start-koyeb.sh` (migrate then `node server.js`) | Same image for Koyeb / Render / Fly later |
| Postgres | Neon Free (EU) | 0.5 GB; scale-to-zero |
| CV files | `STORAGE_DRIVER=postgres` (private BYTEA) | Switch to R2 in production |
| Payments | `PAYMENT_PROVIDER=disabled` | UI: « Paiement bientôt disponible » |
| Cron | cron-job.org free → `POST /api/cron/purge` | After a public URL exists |

## Staging env (names only — values live in gitignored `.env.staging.local`)

Required on the host:

- `MIZANE_ENV=staging`
- `NODE_ENV=production`
- `PAYMENT_PROVIDER=disabled`
- `STORAGE_DRIVER=postgres`
- `AUTH_TRUST_HOST=true`
- `PORT=8000`
- `CV_RETENTION_DAYS=30`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD` (12+ chars, not `change-me-now`)
- `AUTH_SECRET` (32+)
- `CRON_SECRET`
- `DATABASE_URL` (Neon Connect)
- After first URL: `NEXT_PUBLIC_APP_URL` and `AUTH_URL` = same `https://…` then **rebuild**

## Local verification (2026-08-18)

Ran on this machine, not on a public URL:

- `npm test` — 42/42
- `npx tsc --noEmit` — pass
- `SKIP_ENV_ASSERT=1 npm run build` — pass (116 routes)
- `npx tsx scripts/validate-env-refusals.ts` — pass
- `npx tsx scripts/security-live.ts` against `http://localhost:3000` — pass
- `npx tsx scripts/validate-privacy.ts` — pass
- Postgres dump `backups/mizane-beta.dump` (gitignored) restored to throwaway `mizane_restore`: 19 public tables

Homepage locally ~300 ms. `/connexion` sends `X-Robots-Tag: noindex`. robots/sitemap/canonical/hreflang/JSON-LD present (URLs are localhost until `NEXT_PUBLIC_APP_URL` is public HTTPS).

## Owner action that unblocks the public beta

GitHub is connected. Staging secrets (except the database) and port 8000 are saved on Back4App. Remaining:

1. In Neon → Connect, copy the Postgres URI and paste it as `DATABASE_URL` in Back4App → Settings → Environment Variables. Never put it in git or chat.
2. Do **not** click Upgrade / Change Plan / Permanent URL (that is paid).
3. After `DATABASE_URL` is set, Action → Deploy the latest commit (or push to `master`).
4. Treat `https://mizane-fft13q12.b4a.run` as a 60-minute free URL unless Back4App keeps it alive without paying.

Optional after the URL exists:

- cron-job.org → daily `POST https://<host>/api/cron/purge` with `Authorization: Bearer <CRON_SECRET>`
- Google Search Console / Bing URL-prefix verification → `GOOGLE_SITE_VERIFICATION` / `BING_SITE_VERIFICATION`
- Sentry free project → `SENTRY_DSN` (server only)
- IndexNow → `INDEXNOW_KEY` (public key file already served at `/indexnow.txt` when set)

## Rollback

GitHub `master`. Previous app commit: `b542ed1`. Host switch commit: `a9c8d0f`. Redeploy the last known-good image; restore Postgres only onto a **throwaway** database (`CONFIRM_RESTORE=yes`).

## Known limitations (staging)

- Payments disabled on purpose. No mock unlock in staging/production.
- Postgres BYTEA for CVs counts toward Neon 0.5 GB.
- Free PaaS usually scale-to-zero (cold start).
- Production still needs live Payzone, private R2, EU VM (Fly `cdg` or equivalent), and a real domain.
