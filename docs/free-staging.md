# Free public beta (0 DH)

Cloudflare Pages / Workers cannot host Mizane: Node PDF/upload APIs, Prisma, Auth.js and cron need a Node server.

Fly.io is **not free** for new accounts (pay-as-you-go). Do not create a Fly app unless you accept billing.

Render asked for a **credit card** ($1 Stripe verification). Do **not** add a card. Host is **Koyeb Free** (Frankfurt): same class of product (Docker, HTTPS, 512 MB), usually **no card** for a GitHub signup.

## Target stack (all $0)

| Layer | Provider | Public hostname | Limits |
| --- | --- | --- | --- |
| App | Koyeb Free (Frankfurt) | `https://<app>-<org>.koyeb.app` | 512 MB RAM, scale-to-zero after 1 hour idle |
| Postgres | Neon Free (already created) | connection string | 0.5 GB storage, scale-to-zero after 5 min |
| CV files | `STORAGE_DRIVER=postgres` (private BYTEA) | no public URL | counts toward Neon 0.5 GB |
| Payments | `PAYMENT_PROVIDER=disabled` | — | UI: « Paiement bientôt disponible » |
| Cron | [cron-job.org](https://cron-job.org) free | hits `/api/cron/purge` | daily |

One-click (sign in with GitHub **YASR16**, instance **free**, region **fra**, port **8000**):

https://app.koyeb.com/deploy?type=git&builder=dockerfile&repository=github.com/YASR16/mizane&branch=master&name=mizane&instance_type=free&regions=fra&ports=8000;http;/

If Koyeb asks for a card, cancel. Do not fill Stripe. Message the session so we can pick another $0 host.

## Owner steps (cannot be automated here)

Koyeb and Neon need **your** GitHub login in a browser. This machine cannot create those accounts for you.

### 1. Neon Postgres (already created — reuse it)

Project `floral-sky-97693789`. In Neon → **Connect**, copy `DATABASE_URL`. Paste it only in Koyeb env, never in chat, never in git.

### 2. Koyeb web service (free, no card)

1. Open the one-click URL above.
2. Sign in with **GitHub** (YASR16). Allow the Koyeb GitHub App on repo `mizane`.
3. Confirm: **Free** instance, region **Frankfurt (`fra`)**, Dockerfile builder, port **8000**.
4. Before deploy, add environment variables (dashboard → Environment). Use the values already generated for staging (see the end of the chat / `.env.staging.local` on this PC). Required:

   - `MIZANE_ENV=staging`
   - `NODE_ENV=production`
   - `PAYMENT_PROVIDER=disabled`
   - `STORAGE_DRIVER=postgres`
   - `AUTH_TRUST_HOST=true`
   - `DATABASE_URL` = Neon Connect URI
   - `AUTH_SECRET` = the generated 64-hex value
   - `CRON_SECRET` = the generated value
   - `ADMIN_EMAIL=admin@mizane.ma`
   - `ADMIN_PASSWORD` = the generated password
   - `CV_RETENTION_DAYS=30`
   - `NEXT_PUBLIC_BRAND_NAME=Mizane`
   - `PORT=8000`

5. Deploy. When Koyeb shows `https://….koyeb.app`, set:

   - `NEXT_PUBLIC_APP_URL` = that URL (no trailing slash)
   - `AUTH_URL` = the same URL

   Then **redeploy** so `NEXT_PUBLIC_*` is baked into the Docker image.

### 3. Daily purge (free)

1. Open https://cron-job.org/en/signup/
2. Job: daily `POST https://<app>-<org>.koyeb.app/api/cron/purge`
3. Header: `Authorization: Bearer <CRON_SECRET>`

## Backup / restore (tested locally)

- **Location:** `backups/mizane-local.dump` (gitignored). Size on 2026-08-18: 45 412 bytes.
- **How:** `docker compose exec postgres pg_dump -U mizane -d mizane -F c -f /tmp/mizane.dump`
- **Restore (throwaway DB only):** `createdb mizane_restore` then `pg_restore -d mizane_restore --no-owner --no-acl`.
- **Result:** PASS. Restored 19 relations including `PrivateObject`. Counts: 3 users, 6 CV documents, 6 payments.
- **Neon Free:** 6-hour instant restore window; no extra paid backup product.
- **Frequency on free stack:** manual dump after meaningful data, plus Neon history. Daily cron-job.org for CV purge is separate.

- Cloudflare R2: https://dash.cloudflare.com → R2 → create **private** bucket → `STORAGE_DRIVER=s3`
- Sentry: https://sentry.io/signup/ → project DSN → `SENTRY_DSN` (server only)
- Google Search Console: https://search.google.com/search-console → URL prefix = Koyeb URL → paste `GOOGLE_SITE_VERIFICATION`
- Bing Webmaster: https://www.bing.com/webmasters → same URL → `BING_SITE_VERIFICATION` / IndexNow key
