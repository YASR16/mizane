# Exploitation

Bêta 0 DH : voir `docs/free-staging.md`. En 2026-08-18 aucun hôte Node toujours allumé sans carte n’a accepté le déploiement (Render carte, Koyeb nouveaux comptes payants, Fly pay-as-you-go).

Production visée : **Fly.io `cdg`**, Postgres managé dans la même région, **Cloudflare R2 privé**, Payzone, cron de purge. Pas Vercel Hobby (ToS non commercial, timeout, limite de body).

## Variables

`MIZANE_ENV=production` refuse : SQLite, mock, `PAYZONE_SANDBOX`, `STORAGE_DRIVER=local`, `NEXT_PUBLIC_APP_URL` localhost, secrets faibles.

`AUTH_URL` = `NEXT_PUBLIC_APP_URL` = `https://votre-domaine.ma` (pas d’URL de callback Payzone séparée).

## Fly

```bash
fly launch --copy-config --no-deploy
fly postgres create --region cdg
fly postgres attach <pg-app>
fly secrets set AUTH_SECRET=... PAYZONE_ORIGINATOR_ID=... PAYZONE_PASSWORD=... PAYZONE_WEBHOOK_SECRET=... CRON_SECRET=... ADMIN_PASSWORD=... S3_BUCKET=... S3_ACCESS_KEY_ID=... S3_SECRET_ACCESS_KEY=... S3_ENDPOINT=https://<account>.r2.cloudflarestorage.com NEXT_PUBLIC_APP_URL=https://votre-domaine.ma AUTH_URL=https://votre-domaine.ma SENTRY_DSN=...
fly deploy
```

Cron quotidien :

```bash
fly machine run --region cdg --schedule "0 3 * * *" --restart no --rm \
  curlimages/curl:8.11.1 \
  curl -fsS -X POST https://votre-domaine.ma/api/cron/purge \
    -H "Authorization: Bearer $CRON_SECRET"
```

## Sauvegardes

```bash
DATABASE_URL=... ./scripts/backup-postgres.sh
# Restore uniquement sur une instance jetable :
CONFIRM_RESTORE=yes DATABASE_URL=postgresql://... ./scripts/restore-postgres.sh backup.dump
```

Faites un restore test **une fois** avant d’inviter des clients. Les dumps contiennent des e-mails et métadonnées de paiement.

## Self-host optionnel

`docker compose -f docker-compose.production.yml up -d` (app + Postgres + Caddy + sidecar purge). Toujours R2, jamais le disque du conteneur pour les CV.

## GO / NO-GO

Le code ne déclare pas Mizane prêt à encaisser. Il faut : domaine HTTPS, Postgres+R2 UE, **paiement sandbox Payzone 49 MAD réel**, restore testé, dépôt CNDP commencé.
