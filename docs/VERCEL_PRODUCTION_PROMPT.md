# Vercel produkcia — agent prompt (fallback)

Produkčná URL: **https://grow.nexify-studio.tech**  
Vercel projekt: **h4ck3d/noor-original-500**  
GitHub: **youh4ck3dme/noor-original-500**  
Lokálna cesta: `/Users/erikbabcan/noor-original-500`

Tento dokument je **fallback**, keď primárna cesta Firebase App Hosting je blokovaná (Blaze plan, IAM, backend). Primárna dokumentácia: [FIREBASE_APPHOSTING.md](./FIREBASE_APPHOSTING.md).

---

## Kedy použiť ktorú cestu

| | Firebase App Hosting (primárna) | Vercel (fallback A) |
|---|--------------------------------|---------------------|
| **Kedy** | Blaze aktivovaný, backend `noor-original-500` existuje, GitHub rollout | Blaze/IAM blokujú Firebase, potrebuješ rýchlo live na `grow.nexify-studio.tech` |
| **Deploy** | `npm run deploy:production` | `vercel --prod` (+ env sync) |
| **Env sync** | `npm run sync:firebase-env` | `npm run push:vercel-env` |
| **Firebase Admin** | ADC (bez service account file) | `FIREBASE_SERVICE_ACCOUNT_JSON` v Vercel env (manuálne) |
| **Custom domain** | Firebase Console → App Hosting → Domains | Vercel → Project → Domains |
| **Shopify callback** | Rovnaká URL na oboch platformách | Rovnaká URL na oboch platformách |
| **Migácia späť** | Po Blaze unblock: DNS na Firebase, redeploy | — |

**Dôležité:** Na jednej doméne `grow.nexify-studio.tech` môže smerovať DNS len na **jednu** platformu. Pred prepnutím over, že starý CNAME/A záznam nekonfliktuje.

---

## Skopíruj do agenta (celý blok)

```
Si senior DevOps + Next.js developer. Nasadíš produkciu NOOR Original 500 na Vercel ako fallback, keď Firebase App Hosting nie je dostupný.

## Kontext
- Repozitár: https://github.com/youh4ck3dme/noor-original-500
- Lokálna cesta: /Users/erikbabcan/noor-original-500
- Vercel team: h4ck3d
- Vercel projekt (produkcia): noor-original-500
- Cieľová produkčná URL: https://grow.nexify-studio.tech
- Shopify OAuth callback (HTTPS, presná zhoda): https://grow.nexify-studio.tech/api/auth/shopify/callback
- Primárna cesta (keď bude Blaze): Firebase App Hosting — docs/FIREBASE_APPHOSTING.md

## Obmedzenia
- NIKDY necommituj .env.local, .firebase-service-account.json, .firebase-env-paste.txt, secrets
- NIKDY nevypisuj hodnoty env premenných do logu ani do odpovede
- NIKDY neupravuj plán firebase_deploy_unblock ani iné plánové súbory
- Commituj len ak user explicitne požiada

## Predpoklady
- Node.js 20+, npm
- Vercel CLI: npm i -g vercel (alebo npx vercel)
- Prístup k tímu h4ck3d na Vercel
- Lokálny .env.local s kompletnou konfiguráciou (Shopify, Firebase public, AI keys, Customer Account API)
- Voliteľne: .firebase-service-account.json pre push notifikácie (server)

## Krok 1 — Overenie repa a build
cd /Users/erikbabcan/noor-original-500
npm ci
npm run build
Ak build zlyhá, oprav chyby pred deployom.

## Krok 2 — Link na správny Vercel projekt
vercel login
vercel link --yes --scope h4ck3d --project noor-original-500
Over: cat .vercel/project.json — projectName musí byť noor-original-500

Poznámka: docs/SETUP.md odkazuje na growmedicanextjs len pre lokálny env pull. Pre PRODUKCIU používaj noor-original-500.

## Krok 3 — Sync env premenných na Vercel
Skript scripts/push-vercel-env.mjs:
- Číta .env.local
- Nastaví NEXT_PUBLIC_SITE_URL=https://grow.nexify-studio.tech
- Nastaví SHOPIFY_CUSTOMER_ACCOUNT_REDIRECT_URI=https://grow.nexify-studio.tech/api/auth/shopify/callback
- Pushuje do production, preview, development (--force)
- Preskočí: VERCEL_OIDC_TOKEN, E2E_TEST_EMAIL, E2E_TEST_PASSWORD, FIREBASE_SERVICE_ACCOUNT_JSON

Spusti:
npm run push:vercel-env

## Krok 4 — Firebase service account na Vercel (manuálne)
push-vercel-env NEPUSHuje FIREBASE_SERVICE_ACCOUNT_JSON (zámerne).
Pre push notifikácie a Firestore na Vercel pridaj ručne do Vercel → Settings → Environment Variables → Production:
- FIREBASE_SERVICE_ACCOUNT_JSON = celý JSON service accountu na jednom riadku
(alebo použij vercel env add s hodnotou z .firebase-service-account.json)

Bez tejto premennej: storefront funguje, ale /api/push/send a server Firebase Admin zlyhajú.

## Krok 5 — Deploy na produkciu
vercel --prod

Alternatíva: pripoj GitHub repo v Vercel Dashboard → Production Branch = main → push na main spustí deploy.

Po deployi over preview URL z CLI výstupu, potom custom domain.

## Krok 6 — Custom domain grow.nexify-studio.tech
V Vercel Dashboard:
1. Project noor-original-500 → Settings → Domains
2. Add: grow.nexify-studio.tech
3. Ak doména už smeruje na Firebase, odstráň/starý DNS záznam pred prepnutím

DNS u registrátora domény nexify-studio.tech (subdoména grow):
- Typ: CNAME
- Name/Host: grow
- Value/Target: cname.vercel-dns.com
(alebo presná hodnota, ktorú Vercel Dashboard zobrazí pre tento projekt)

Po propagácii DNS (5–60 min):
curl -sI https://grow.nexify-studio.tech | head -5
Očakávané: HTTP/2 200 alebo 307/308 redirect na kanonickú URL.

## Krok 7 — Shopify Customer Account callback
Callback musí byť registrovaný v Shopify Headless (NIE v Custom App Admin API):

1. https://admin.shopify.com/store/tn43yx-0k/headless
2. Headless storefront (Client ID 899f4e68-4753-4e7f-b205-694b5a226545)
3. Customer Account API → Application setup → Allowed redirection URL(s)
4. Pridaj presne (bez trailing slash):
   https://grow.nexify-studio.tech/api/auth/shopify/callback
5. Save, počkaj ~1 min

Ak callback už existuje z Firebase plánu, over že je stále v zozname — URL je rovnaká na oboch platformách.

## Krok 8 — Overenie OAuth a env
Lokálne (číta .env.local — pred overením dočasne nastav v .env.local produkčné redirect URI alebo spoliehaj na push skript):
npm run verify:shopify-customer-auth

Očakávaný redirect_uri v outpute:
  https://grow.nexify-studio.tech/api/auth/shopify/callback

Produkčný curl — login redirect (307 na shopify.com):
curl -sI "https://grow.nexify-studio.tech/api/auth/shopify/login?next=/ucet" | head -8

Očakávané: status 307 (alebo 302) a Location obsahuje shopify.com a redirect_uri=https://grow.nexify-studio.tech/api/auth/shopify/callback

Manuálny test v prehliadači:
https://grow.nexify-studio.tech/api/auth/shopify/login?next=/ucet
→ redirect na Shopify authorize → po login späť na /ucet

## Krok 9 — Ďalšie smoke testy
npm run verify:shopify-admin        # Admin API token (ak je v env)
npm run verify:push-env             # lokálne; na produkcii test curl push API
curl -sI https://grow.nexify-studio.tech/ucet/prihlasenie | head -5

## Krok 10 — Report pre usera
Vráť stručný report:
- Vercel deployment URL a stav domény grow.nexify-studio.tech
- Počet OK/failed z push:vercel-env
- Výsledok verify:shopify-customer-auth a curl OAuth redirect
- Čo ešte chýba (napr. FIREBASE_SERVICE_ACCOUNT_JSON na Vercel, GEMINI_API_KEY)
- Kedy migrovať späť na Firebase (Blaze + npm run deploy:production) — pozri docs/FIREBASE_APPHOSTING.md

## Referencie v repozitári
- scripts/push-vercel-env.mjs — env push na Vercel
- docs/SETUP.md — lokálny setup, Shopify OAuth detaily
- docs/FIREBASE_APPHOSTING.md — primárna produkčná cesta
- .env.example — šablóna premenných (bez secretov)
- app/lib/shopify-customer-auth.ts — OAuth logika
```

---

## Rýchlý manuálny checklist (bez agenta)

```bash
cd /Users/erikbabcan/noor-original-500
npm ci && npm run build
vercel login
vercel link --yes --scope h4ck3d --project noor-original-500
npm run push:vercel-env
# + manuálne FIREBASE_SERVICE_ACCOUNT_JSON na Vercel production
vercel --prod
npm run verify:shopify-customer-auth
curl -sI "https://grow.nexify-studio.tech/api/auth/shopify/login?next=/ucet" | head -8
```
