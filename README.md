# Mizane

Diagnostic CV pour le marché marocain. **Scan → Score → Problèmes réels → Déblocage → Correction → Candidature.**

Mizane n’est pas un générateur de CV décoratif. C’est un outil de carrière : score ATS, structure, mots-clés, expériences, puis un rapport actionnable en dirhams, paiement unique.

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS
- PostgreSQL (Prisma)
- Auth.js (e-mail / mot de passe, Google optionnel)
- Extraction PDF/DOCX réelle (`unpdf` + `mammoth`)
- Moteur d’analyse structuré JSON (heuristique + LLM optionnel)
- Paiements : adaptateur **Payzone** + mode **mock** (développement seulement)
- Stockage CV : disque local en dev, **Cloudflare R2 (S3) privé** en staging/production

## Démarrage local

```bash
copy .env.example .env
npm install
docker compose up -d postgres
npx prisma migrate deploy
npx prisma db seed
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

Compte admin : définir `ADMIN_EMAIL` et un `ADMIN_PASSWORD` fort (≥ 12 caractères). `change-me-now` est refusé.

## Environnements

| `MIZANE_ENV` | Paiement | Stockage | URL |
| --- | --- | --- | --- |
| `development` | mock autorisé | disque local OK | localhost OK |
| `staging` | Payzone **sandbox**, secrets requis | R2 privé | HTTPS public (Payzone doit joindre le webhook) |
| `production` | Payzone **live**, `PAYZONE_SANDBOX` interdit | R2 privé | `https://votre-domaine.ma` uniquement |

Le process **refuse de démarrer** en staging/production si SQLite, mock, disque local, URL localhost, secrets faibles, ou Payzone incomplet.

`AUTH_URL` doit être identique à `NEXT_PUBLIC_APP_URL`. Les URLs de retour et webhook Payzone sont construites à partir de cette origine — pas de `PAYZONE_CALLBACK_URL`.

## Production (UE)

Architecture prévue : Cloudflare DNS/HTTPS → **Fly.io Paris (`cdg`)** → Postgres UE → R2 privé. Détail : [docs/ops.md](docs/ops.md).

```bash
fly deploy
# Cron : POST /api/cron/purge avec Authorization: Bearer $CRON_SECRET
```

Avant d’inviter des utilisateurs payants : paiement **sandbox Payzone 49 MAD réel**, restore `pg_dump` testé, dépôt CNDP commencé. Le code ne remplace pas ces actes. Voir `/lancement` (noindex) et [docs/cndp-owner-checklist.md](docs/cndp-owner-checklist.md).

## Scripts

- `npm run dev` — développement
- `npm run build` — build production
- `npm test` — tests automatisés (paiements, fichiers, analyse, env)
- `npm run db:push` — schéma local
- `npm run db:seed` — admin (mot de passe requis, pas de défaut)
- `npx tsx scripts/indexnow.ts` — soumission IndexNow ponctuelle (si `INDEXNOW_KEY`)

## Prix (recommandation marché Maroc 2026)

| Offre | Prix | Ancre |
| --- | --- | --- |
| Aperçu | 0 DH | — |
| Analyse complète | **49 DH** | 79 DH |
| CV optimisé | **99 DH** | 149 DH |
| Match offre (détail) | inclus après analyse, ou 29 DH isolé | 49 DH |

## Paiements

- **Payzone** : cartes marocaines, page hébergée, 3-D Secure, webhooks.
- Le rapport **n’est jamais** débloqué sur un succès frontend. Vérification serveur obligatoire (webhook + statut).
- Mode développement : `PAYMENT_PROVIDER=mock`.

## IA

Sans `OPENAI_API_KEY`, le moteur heuristique analyse vraiment le fichier. Avec une clé, un LLM enrichit les recommandations (CV isolé comme contenu non fiable). Un transfert hors Maroc peut exiger une autorisation CNDP.

## Confidentialité (Loi 09-08 / CNDP)

Les fichiers n’ont pas d’URL publique, conservation 30 jours, suppression utilisateur + cron. Les sous-traitants (Fly, Postgres, R2, Payzone, OpenAI optionnel) sont listés sur `/confidentialite`. **Le logiciel n’est pas « conforme CNDP » par construction** — voir la checklist propriétaire.

## SEO

Pages d’intention en français (`/analyse-cv`, `/cv-ats`, `/test-cv-ats`, `/optimiser-cv`, `/cv-maroc`, `/cv-ingenieur`, `/cv-developpeur`, `/cv-qa`) + articles de blog. Routes privées en noindex. Vérification GSC/Bing via `GOOGLE_SITE_VERIFICATION` / `BING_SITE_VERIFICATION`. Aucune promesse de classement Google.

## Différenciation

ReKrute/KIARA aide au matching d’offres. Les outils internationaux (Jobscan, ResumeWorded) sont chers, en anglais, et ignorent les codes marocains. Mizane : diagnostic avant envoi, FR/AR/EN, MAD, ATS honnête, recommandations actionnables.
