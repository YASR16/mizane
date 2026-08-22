# Exploitation

Bêta 0 DH : voir `docs/free-staging.md`.

Hôte actuel : **Back4App Containers Free** (≈256 MB, USA).
URL temporaire actuelle : `https://mizane-kntol4ix.b4a.run` (l’ancienne `mizane-fft13q12` a expiré).
Neon Free `floral-sky-97693789` est branché via `DATABASE_URL` **uniquement** dans Back4App (jamais git/chat).
Paiements : `PAYMENT_PROVIDER=disabled`. Ne pas upgrader Back4App ni acheter de domaine pour la bêta.

Production visée plus tard : **Fly.io `cdg`**, Postgres managé UE, **Cloudflare R2 privé**, Payzone, cron de purge. Pas Vercel Hobby (ToS non commercial, timeout, limite de body).

## Variables staging (noms)

`MIZANE_ENV=staging`, `PAYMENT_PROVIDER=disabled`, `STORAGE_DRIVER=postgres`, `AUTH_TRUST_HOST=true`, `PORT=8000`, `NODE_OPTIONS=--max-old-space-size=192`, `CV_RETENTION_DAYS=30`, secrets admin/auth/cron, `DATABASE_URL`, et `NEXT_PUBLIC_APP_URL` = `AUTH_URL` = URL temporaire HTTPS courante (rebuild après changement d’URL).

`MIZANE_ENV=production` refuse : SQLite, mock, `PAYZONE_SANDBOX`, `STORAGE_DRIVER=local`, `NEXT_PUBLIC_APP_URL` localhost, secrets faibles.

## Déploiement Back4App

1. Push `master` ou Action → Deploy the latest commit.
2. `scripts/start-koyeb.sh` : migrate (hôte Neon direct) puis `node server.js`.
3. Si migrate P3009/P3018 : le script tente `migrate resolve --rolled-back` puis retry. Migration init sans BOM UTF-8.
4. Vérifier `/api/health` et `AUDIT_BASE=https://… npx tsx scripts/public-beta-audit.ts`.

## Purge

Endpoint : `POST /api/cron/purge` avec `Authorization: Bearer <CRON_SECRET>`.
Configurer cron-job.org (gratuit) quand l’URL est stable assez longtemps ; non bloquant pour la bêta de base.

## Sauvegardes

```bash
DATABASE_URL=... ./scripts/backup-postgres.sh
# Restore uniquement sur une instance jetable :
CONFIRM_RESTORE=yes DATABASE_URL=postgresql://... ./scripts/restore-postgres.sh backup.dump
```

## Fly (production future)

```bash
fly launch --copy-config --no-deploy
fly postgres create --region cdg
fly postgres attach <pg-app>
fly secrets set AUTH_SECRET=... PAYZONE_ORIGINATOR_ID=... PAYZONE_PASSWORD=... PAYZONE_WEBHOOK_SECRET=... CRON_SECRET=... ADMIN_PASSWORD=... S3_BUCKET=... S3_ACCESS_KEY_ID=... S3_SECRET_ACCESS_KEY=... S3_ENDPOINT=https://<account>.r2.cloudflarestorage.com NEXT_PUBLIC_APP_URL=https://votre-domaine.ma AUTH_URL=https://votre-domaine.ma SENTRY_DSN=...
fly deploy
```

## GO / NO-GO production paiement

Le code ne déclare pas Mizane prêt à encaisser. Il faut : domaine HTTPS, Postgres+R2 UE, **paiement sandbox Payzone 49 MAD réel**, restore testé, dépôt CNDP commencé.
