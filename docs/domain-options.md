# Stable domain options (0 DH research)

Goal: branded, stable HTTPS hostname suitable for Mizane SEO and Payzone — **without buying anything in this phase**.

## Verdict

**There is no genuinely good free top-level domain** that is legitimate, stable, brandable (`mizane.ma` / `.com`), and free forever without a card.

- Freenom-style free TLDs (`.tk`, `.ml`, …) are **dead / unreliable** (mass reclamations, ICANN issues). Do **not** use them for a career SaaS.
- Free “subdomain + hosting” offers (random `*.something.in`, website builders) are **not suitable** as the long-term Mizane brand: poor trust for Moroccan users, weak SEO, often incompatible with your existing Back4App Docker app, and risky ToS.

## What works at 0 DH today

| Option | Stable? | Brand? | Notes |
| --- | --- | --- | --- |
| Back4App Free temporary `*.b4a.run` | No (~60 min) | No | Fine for technical beta; **not** for SEO/Payzone |
| Keep using temporary URL + Redeploy | Partial | No | Owner clicks Redeploy when expired |
| Neon + app stay free | Yes (DB) | n/a | Already in use |

## Recommended path (when owner accepts a small paid cost later)

1. Register **mizane.ma** (or closest available) at a normal registrar when budget allows.  
2. Point DNS → production host (Fly `cdg` or paid Back4App permanent URL).  
3. Let’s Encrypt / Cloudflare HTTPS (cert itself is free; domain registration is not).  
4. Then set `NEXT_PUBLIC_APP_URL` / `AUTH_URL` once and leave them.

Until then: treat SEO content as **implementation ready**, but do **not** submit temporary hostnames as the final brand property in Search Console as if they were permanent.

## Explicit non-recommendations

- Freenom / free exotic TLDs  
- “Free domain for life” schemes that require weird DNS or reclaim domains  
- Putting Mizane’s only identity on an unrelated free-subdomain marketing host
