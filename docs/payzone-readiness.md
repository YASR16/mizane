# Payzone readiness (not activated)

Payments remain `PAYMENT_PROVIDER=disabled` in public beta. This document lists what exists in code and what the owner must supply later — **do not activate** until sandbox 49 MAD is proven.

## Implemented flow

1. `POST /api/payments/initiate` — creates PENDING payment, calls provider  
2. Redirect to Payzone checkout (when enabled)  
3. `POST /api/payments/webhook` — signature verify → `fulfillVerifiedPayment`  
4. `GET /api/payments/verify` + `/paiement/retour` — return URL status  
5. Server unlock: `reportUnlocked` (ANALYSIS 49 MAD) / `optimizerUnlocked` (OPTIMIZED_CV 99 MAD)  
6. PDF / report only after unlock flags

Amount and product code are checked server-side. Browser claims alone never unlock.

## Products

| Code | Price | Unlock |
| --- | --- | --- |
| `ANALYSIS` | 49 MAD | report + PDF |
| `OPTIMIZED_CV` | 99 MAD | optimizer |
| `JOB_MATCH` | 29 MAD | defined; secondary |

## Credentials required later (never commit / never paste in chat)

Set only in Back4App (or Fly) secrets when ready:

- `PAYMENT_PROVIDER=payzone`
- `PAYZONE_ORIGINATOR_ID`
- `PAYZONE_PASSWORD`
- `PAYZONE_WEBHOOK_SECRET` (HMAC)
- Confirm `NEXT_PUBLIC_APP_URL` / `AUTH_URL` = stable HTTPS domain (not temporary `.b4a.run`)
- Payzone merchant return / webhook URLs pointing at that domain

Also required operationally: Payzone sandbox test of **real 49 MAD**, webhook reachability, and production switch only after sandbox OK.

## Staging behaviour today

- Initiate → `PAYMENTS_DISABLED` / 503  
- UI → « Paiement bientôt disponible »  
- Unpaid PDF → 402  
- No fake unlocks
