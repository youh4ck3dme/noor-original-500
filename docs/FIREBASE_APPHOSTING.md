# Firebase App Hosting — noor-original-500

Produkčná URL: **https://grow.nexify-studio.tech**  
Firebase projekt: `noorgrowmfinnal-58800798-76fac`  
Backend: `noor-original-500`

## Jednopríkazový deploy

```bash
npm run deploy:production
```

Pipeline: `preflight:firebase` → `sync:firebase-env` → `npm run build` → `firebase deploy` → `verify:shopify-customer-auth` → curl overenie.

## Kroky manuálne

```bash
# 1. Overiť CLI účet a prístup k projektu
npm run preflight:firebase

# 2. Ak FAIL „project not visible“ — prihlás sa správnym Google účtom
firebase login --reauth

# 3. Sync secrets + vygeneruj paste súbor
npm run sync:firebase-env

# 4. Deploy
npm run deploy:firebase
# alebo celý pipeline:
npm run deploy:production
```

## Blaze plan — povinné pre App Hosting

Firebase App Hosting vyžaduje **Blaze (pay-as-you-go)** s pripojeným billing účtom. Pri malom trafficu často zostaneš v no-cost kvótach (10 GiB bandwidth, 2M Cloud Run requestov/mesiac atď.) — nie je to fixný mesačný poplatok.

Bez Blaze zlyhá `apphosting:backends:list`, `firebase deploy --only apphosting` aj vytvorenie backendu v Console.

### Checklist pre vlastníka projektu (copy-paste)

Pošli kontaktnej osobe s Owner prístupom na Firebase projekt:

```
Ahoj, potrebujem dokončiť deploy noor-original-500 na Firebase App Hosting (grow.nexify-studio.tech).
Prosím o tieto kroky v projekte noorgrowmfinnal-58800798-76fac:

1. Upgrade na Blaze (pay-as-you-go, nie fixný mesačný poplatok)
   https://console.firebase.google.com/project/noorgrowmfinnal-58800798-76fac/usage/details
   Pripojiť billing účet (eligible účty dostanú $300 GCP kreditu)

2. IAM pre môj účet u0352652320@gmail.com
   Role: Firebase Admin alebo Editor + Service Usage Consumer
   https://console.developers.google.com/iam-admin/iam?project=noorgrowmfinnal-58800798-76fac

3. Povoliť API (ak máš gcloud):
   gcloud services enable firebaseapphosting.googleapis.com secretmanager.googleapis.com \
     --project=noorgrowmfinnal-58800798-76fac

4. Vytvoriť App Hosting backend (ak ešte neexistuje)
   https://console.firebase.google.com/project/noorgrowmfinnal-58800798-76fac/apphosting
   Backend ID: noor-original-500
   GitHub: youh4ck3dme/noor-original-500, branch main, root ./
   Custom domain: grow.nexify-studio.tech

5. Env premenné — vložiť obsah .firebase-env-paste.txt
   (vygeneruje npm run sync:firebase-env) do Environment → Rollout
```

Po splnení: `npm run preflight:firebase` → `npm run sync:firebase-env` → `npm run deploy:production`

## Blaze plan (povinné pre App Hosting)

App Hosting **vyžaduje Blaze** (pay-as-you-go) s pripojeným billing účtom. Nie je to fixný mesačný poplatok — pri malom trafficu často zostaneš v no-cost kvótach (10 GiB bandwidth, 2M Cloud Run requestov/mesiac).

Bez Blaze: `apphosting:backends:list`, `secrets:set` a `firebase deploy` zlyhajú.

## Checklist pre vlastníka Firebase projektu

Skopíruj a pošli kontaktnej osobe:

```
Projekt: noorgrowmfinnal-58800798-76fac
Produkcia: https://grow.nexify-studio.tech

1. Upgrade na Blaze (pay-as-you-go):
   https://console.firebase.google.com/project/noorgrowmfinnal-58800798-76fac/usage/details

2. IAM pre u0352652320@gmail.com:
   Role: Firebase Admin alebo Editor + Service Usage Consumer
   https://console.developers.google.com/iam-admin/iam?project=noorgrowmfinnal-58800798-76fac

3. Povoliť API:
   gcloud services enable firebaseapphosting.googleapis.com secretmanager.googleapis.com \
     --project=noorgrowmfinnal-58800798-76fac

4. Vytvoriť App Hosting backend "noor-original-500":
   https://console.firebase.google.com/project/noorgrowmfinnal-58800798-76fac/apphosting
   GitHub: youh4ck3dme/noor-original-500, branch main, root ./
   Custom domain: grow.nexify-studio.tech

5. Env: npm run sync:firebase-env → vložiť .firebase-env-paste.txt do Environment → Rollout
```

## IAM / 403 chyby

Ak `secrets:set` alebo `firebase deploy` vráti **403**:

1. Prihlás sa účtom s **Owner** alebo **Editor** na projekte `noorgrowmfinnal-58800798-76fac`
2. Over **Blaze plan** (pozri vyššie)
3. Povoľ API:
   ```bash
   gcloud services enable firebaseapphosting.googleapis.com secretmanager.googleapis.com \
     --project=noorgrowmfinnal-58800798-76fac
   ```
4. IAM: https://console.developers.google.com/iam-admin/iam?project=noorgrowmfinnal-58800798-76fac

## Fallback — Vercel produkcia

Ak App Hosting nie je dostupný (Blaze, backend, IAM), nasaď rovnakú URL na **Vercel** projekte `h4ck3d/noor-original-500`:

→ Skopíruj agent prompt z **[VERCEL_PRODUCTION_PROMPT.md](./VERCEL_PRODUCTION_PROMPT.md)** (`npm run push:vercel-env`, `vercel --prod`, DNS, Shopify callback).

## Fallback — env cez Console

Ak CLI secrets stále zlyhávajú, sync vygeneruje `.firebase-env-paste.txt` (gitignored):

1. https://console.firebase.google.com/project/noorgrowmfinnal-58800798-76fac/apphosting
2. Backend `noor-original-500` → **Environment** → vlož obsah paste súboru
3. **Rollout** / redeploy

Console env má prednosť pred `apphosting.yaml`.

## Firebase Console — prvý backend

1. https://console.firebase.google.com/project/noorgrowmfinnal-58800798-76fac/apphosting
2. **Create backend** → `noor-original-500`
3. **GitHub** repo: `youh4ck3dme/noor-original-500`, branch `main`, root `./`
4. Po commite `firebase.json` + `apphosting.yaml` na `main` → automatický rollout

## Env v apphosting.yaml

| Typ | Premenné |
|-----|----------|
| Plain `value:` | `NEXT_PUBLIC_*`, Shopify endpointy, `ADMIN_EMAILS`, shop URLs |
| `secret:` | tokeny (`SHOPIFY_*_TOKEN`, `MISTRAL_*`, `PUSH_SEND_SECRET`, `GEMINI_API_KEY`, `SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_SECRET`, VAPID) |

`FIREBASE_SERVICE_ACCOUNT_PATH` **nie je** v yaml — App Hosting používa ADC (`applicationDefault()` v `app/lib/firebase-admin.ts`).

## Shopify Customer Account callback

V Headless → Customer Account API → Callback URI:

```
https://grow.nexify-studio.tech/api/auth/shopify/callback
```

Overenie: `npm run verify:shopify-customer-auth`

Test login: `https://grow.nexify-studio.tech/api/auth/shopify/login?next=/ucet` → 307 na shopify.com/authorize

## Súbory v repozitári

| Súbor | Účel |
|-------|------|
| `firebase.json` | App Hosting backend `noor-original-500` |
| `.firebaserc` | Firebase project ID |
| `apphosting.yaml` | Plain env + secret referencie |
| `scripts/preflight-firebase.mjs` | CLI auth + project + backend check |
| `scripts/sync-firebase-apphosting-env.mjs` | Sync z `.env.local` + grantaccess |
| `scripts/deploy-production.mjs` | Orchestrátor produkčného deployu |

## Chýbajúce env

- `GEMINI_API_KEY` v `.env.local` — bez neho AI chat na produkcii nefunguje (sync ho preskočí)

## Stav (2026-06-09)

| Krok | Výsledok |
|------|----------|
| `npm run build` | OK |
| `npm run verify:shopify-customer-auth` | OK (`redirect_uri` = grow.nexify-studio.tech) |
| `firebase login --reauth` | OK — `u0352652320@gmail.com`, projekt viditeľný |
| `npm run preflight:firebase` | FAIL — `apphosting:backends:list` (pravdepodobne Blaze) |
| `npm run sync:firebase-env` | WARN/403 — paste súbor `.firebase-env-paste.txt` ako fallback |
| `firebase deploy` | FAIL — App Hosting API / Blaze |
| `grow.nexify-studio.tech` | DNS/deploy ešte nie je live |

**Ďalší krok:** vlastník projektu → Blaze upgrade + backend v Console (checklist vyššie) → `npm run deploy:production`

**Poznámka:** `firebase.json`, `.firebaserc`, `apphosting.yaml` a deploy skripty sú v repozitári lokálne, ale ešte nie sú commitnuté na `main` (GitHub auto-rollout vyžaduje commit po Blaze unblocknutí).
