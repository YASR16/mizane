# Free public beta (0 DH)

Cloudflare Pages / Workers cannot host Mizane: Node PDF/upload APIs, Prisma, Auth.js and cron need a Node server.

## Hosting reality (2026-08-18)

The app is **staging-ready**. There is **no public HTTPS URL yet**.

Tried, in order, without adding a card:

| Host | Result |
| --- | --- |
| Render Free | Blocked: Stripe “Add Card” / $1 verification |
| Fly.io | Not free for new accounts (pay-as-you-go) |
| Koyeb Free (Frankfurt) | GitHub login succeeded (org `mizane`). Control panel is the Mistral splash only (Settings / Log out). New users must take a **paid** plan. Do not add a card. |
| Hugging Face Docker Spaces | Compute/Docker creation requires a paid plan |
| Northflank sandbox | Credit card required to activate |
| Railway | Login required; not completed (owner GitHub / likely billing) |
| Vercel Hobby | Not used: Hobby is non-commercial, ~10s function timeout, ~4.5 MB body vs 5 MB CV limit |

Do **not** add a credit card to bypass any of the above.

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

1. Obtain a **genuinely free** always-on Node/Docker host **without a card**, **or** later allow a paid EU host (out of scope for 0 DH).
2. Sign in to that host with GitHub **YASR16**.
3. Deploy `https://github.com/YASR16/mizane` (`master`, Dockerfile).
4. Paste Neon `DATABASE_URL` and the staging secrets from `.env.staging.local`.
5. Set `NEXT_PUBLIC_APP_URL` / `AUTH_URL` to the real HTTPS URL and redeploy.
6. Send the URL so public security/SEO checks can run.

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
