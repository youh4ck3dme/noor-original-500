# NOOR Original 500 — lokálny setup

Next.js 16 headless Shopify storefront (NOOR theme).

## Požiadavky

- Node.js 20+
- npm
- Vercel CLI (`npm i -g vercel`) — na stiahnutie env premenných
- Prístup k tímu `h4ck3d` na Vercel

## Rýchly štart

```bash
git clone https://github.com/youh4ck3dme/noor-original-500.git
cd noor-original-500
npm install
```

## Environment premenné

### Možnosť A — Vercel CLI (odporúčané)

```bash
vercel login
vercel link --yes --scope h4ck3d --project growmedicanextjs
vercel env pull .env.local --environment=development --yes
```

Potom doplni lokálne (ak chýbajú):

```bash
# Shopify endpoint — zostav z domény a verzie v .env.local
# SHOPIFY_API_ENDPOINT_URL=https://{SHOPIFY_STORE_DOMAIN}/api/{SHOPIFY_API_VERSION}/graphql.json

# NOOR theme
NEXT_PUBLIC_DEFAULT_THEME=noor
NEXT_PUBLIC_HIDE_THEME_SWITCHER=1
NEXT_PUBLIC_SITE_URL=http://localhost:3001

# Firebase — z Firebase Console → Project settings → Your apps
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

Šablóna bez secretov: [.env.example](../.env.example)

### Možnosť B — manuálne

Skopíruj `.env.example` → `.env.local` a vyplň hodnoty.

## Spustenie

```bash
npm run dev
```

Otvor http://localhost:3001

## Testy

Projekt používa **Vitest** (Next.js nemá vstavaný unit test runner). Default `npm test` beží len na testoch v `app/` — reálny kód storefrontu a AI chat.

```bash
npm test        # app/ unit testy (AI providers, API route, chat widget)
npm run test:ai # len AI modul
npm run test:legacy  # stará šablóna v tests/ (nie je súčasť default CI)
```

## Časté problémy

| Problém | Riešenie |
|---------|----------|
| `ERESOLVE` eslint konflikt | V `package.json` musí byť `"eslint": "^9"` |
| `Cannot find module 'autoprefixer'` | `npm install` (je v devDependencies) |
| Turbopack cache error | `rm -rf .next && npm run dev` |
| Shopify env not set | Skontroluj `.env.local` a `SHOPIFY_API_ENDPOINT_URL` |
| TS: `node_modules/.pnpm/@types/...` not found | `rm -rf node_modules && npm ci`, potom **TypeScript: Restart TS Server** |

## Shopify Custom App (Admin API)

Potrebné pre zápis produktov (AI optimalizácia), prepojenie zákazníkov a objednávky.

1. Shopify Admin → **Settings → Apps → Develop apps** → Create an app (napr. `GrowMedica Headless Admin`)
2. **Configure Admin API scopes:**
   - `read_products`, `write_products`
   - `read_customers`, `read_orders`
3. **Install app** → skopíruj **Admin API access token** (zobrazí sa len raz)
4. Do `.env.local`:

```env
SHOPIFY_ADMIN_ACCESS_TOKEN=shpat_...
# Voliteľné — inak sa zostaví z SHOPIFY_STORE_DOMAIN + SHOPIFY_API_VERSION
SHOPIFY_ADMIN_API_URL=https://{store}.myshopify.com/admin/api/2025-01/graphql.json
ADMIN_EMAILS=tvoj@email.com
```

5. Overenie:

```bash
npm run verify:shopify-admin
npm run verify:shopify-metafields
```

## Shopify Customer Account API (OAuth)

Headless kanál — prihlásenie zákazníkov a objednávky cez Customer Account API (nie Admin API).

### Kde kliknúť v Shopify Admin (GrowMedica)

1. Otvor: **https://admin.shopify.com/store/tn43yx-0k/headless**
   - ak link nefunguje: Admin → **Sales channels** → **Headless**
2. Klikni na headless storefront (app s Client ID `899f4e68-4753-4e7f-b205-694b5a226545`)
3. Sekcia **Customer Account API** → **Application setup** (alebo **Settings**)
4. Pole **Allowed redirection URL(s)** / **Callback URL(s)** — pridaj **obe** URL (presne, bez `/` na konci):

| Prostredie | Callback URL |
|------------|--------------|
| Produkcia | `https://grow.nexify-studio.tech/api/auth/shopify/callback` |

Shopify **neakceptuje** `http://localhost` — lokálny vývoj cez ngrok alebo test na Vercel.

**Callback URI = len** `.../api/auth/shopify/callback` (nie `/login`, bez `?next=`).

5. **Save** → počkaj ~1 min → otestuj `http://localhost:3001/api/auth/shopify/login?next=/ucet`

Chyba *„Parameter redirect_uri sa nezhoduje“* = callback v Shopify **nie je** identický s URL, ktorú posiela app. Kód je v poriadku; chýba registrácia v Headless UI.

**Pozor:** callback patrí do **Headless → Customer Account API**, nie do Custom App (Admin API v Settings → Apps → Develop apps).

### Env a overenie

1. Skopíruj **Client ID** a **Client secret** z Application setup
2. Do `.env.local`:

```env
SHOPIFY_CUSTOMER_ACCOUNT_SHOP_ID=104292483406
SHOPIFY_CUSTOMER_ACCOUNT_AUTHORIZE_URL=https://shopify.com/authentication/104292483406/oauth/authorize
SHOPIFY_CUSTOMER_ACCOUNT_TOKEN_URL=https://shopify.com/authentication/104292483406/oauth/token
SHOPIFY_CUSTOMER_ACCOUNT_LOGOUT_URL=https://shopify.com/authentication/104292483406/logout
SHOPIFY_CUSTOMER_ACCOUNT_GRAPHQL_URL=https://shopify.com/104292483406/account/customer/api/2026-04/graphql
SHOPIFY_CUSTOMER_ACCOUNT_REDIRECT_URI=http://localhost:3001/api/auth/shopify/callback
SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID=
SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_SECRET=
```

5. Overenie a test v prehliadači:

```bash
npm run verify:shopify-customer-auth
# otvor http://localhost:3001/api/auth/shopify/login?next=/ucet
```

Tlačidlo **Prihlásiť cez Shopify** je na `/ucet/prihlasenie` a v záložke **Moje objednávky**.

## AI chat (Gemini → Mistral fallback)

Portované z `growmedicanextjs` (farmaceut persona + chat UI), s Gemini ako primárnym providerom.

Do `.env.local` doplň:

```env
GEMINI_API_KEY=tvoj_kľúč_z_AI_Studio
GEMINI_MODEL=gemini-2.0-flash
MISTRAL_API_KEY=...          # Mistral Console / Vercel pull
MISTRAL_API_KEY_BACKUP=...   # voliteľné
MISTRAL_USE_WORKFLOW=0       # 1 = skúsi workflow pred chat/completions
MISTRAL_WORKFLOW_IDENTIFIER=noor-pharmacist-chat
MISTRAL_WORKFLOW_TIMEOUT_SECONDS=30
```

Logika: `app/lib/ai/providers.ts` — Gemini primárne, potom Mistral (workflow ak beží worker, inak chat/completions API).

Endpoint: `POST /api/chat` · Widget: plávajúce tlačidlo vpravo dole.

## Mistral Workflows + Vibe

**Požiadavky:** Python 3.12+, [uv](https://docs.astral.sh/uv/) (`uvx`).

```bash
# Jednorazový scaffold (API kľúč len lokálne, nie do gitu)
npm run workflow:setup

# Worker (samostatný terminál, nechaj bežať)
npm run workflow:worker

# Next.js + chat widget
MISTRAL_USE_WORKFLOW=1 npm run dev
```

**Vibe CLI** (terminálový dev asistent, nie web widget):

```bash
curl -LsSf https://mistral.ai/vibe/install.sh | bash
vibe --setup
vibe    # v root projekte, skill /noor-pharmacist
```

Skill: [`.vibe/skills/noor-pharmacist/SKILL.md`](../.vibe/skills/noor-pharmacist/SKILL.md)

## Push notifikácie (Firebase FCM)

**Požiadavky:** Firebase projekt s Firestore + Web Push certifikátom.

Automatická príprava env (po `vercel env pull`):

```bash
npm run setup:push-env
```

Skript doplní Firebase public config, VAPID key, `PUSH_SEND_SECRET`, Shopify endpoint a NOOR theme vars.

Service account (jednorazovo):

1. Firebase Console → Project settings → Service accounts → **Generate new private key**
2. Ulož ako `.firebase-service-account.json` v root projekte (gitignored)
3. Znova spusti `npm run setup:push-env`

Alternatíva: `FIREBASE_SERVICE_ACCOUNT_JSON` celý JSON na jednom riadku v `.env.local`.

1. Firebase Console → Firestore → vytvor databázu (client nepíše priamo, len cez API).
2. Vygeneruj service worker z env:

```bash
npm run generate:firebase-sw
npm run dev
```

4. V prehliadači na http://localhost:3001 klikni **Povoliť** v push banneri.
5. Test odoslania:

```bash
curl -X POST http://localhost:3001/api/push/send \
  -H "Content-Type: application/json" \
  -H "x-push-secret: $PUSH_SEND_SECRET" \
  -d '{"title":"GrowMedica","body":"Test push notifikácie","url":"/"}'
```

6. Voliteľne: Firebase Console → Messaging → Send test message (FCM token z DevTools Network po subscribe).

**Bezpečnosť:** VAPID private key a service account JSON nikdy necommituj. Po úniku rotuj kľúče vo Firebase Console.

## Testovanie

```bash
npm test                 # unit testy (Vitest)
npm run test:e2e         # E2E smoke (bez Firebase loginu)
npm run test:e2e:auth    # plná zákaznícka cesta (@auth, credentials z .env.local)
npm run test:all         # unit + E2E smoke
```

Push E2E (`e2e/push-notifications.spec.ts`) testuje banner, dismiss a API subscribe/send. Pred manuálnym FCM testom:

```bash
npm run verify:push-env
```

E2E premenné v `.env.local` (gitignored):

```env
E2E_AUTH=1
E2E_TEST_EMAIL=...
E2E_TEST_PASSWORD=...
```

Pozri [`app/lib/ai/testovaciucet.md`](../app/lib/ai/testovaciucet.md) a [`docs/FIREBASE_CRM.md`](FIREBASE_CRM.md).

## Štruktúra

- `app/` — Next.js App Router (storefront)
- `app/lib/shopify.ts` — Shopify Storefront API
- `app/lib/firebase.ts` — Firebase client init
- `app/lib/firebase-messaging.ts` — FCM subscribe (browser)
- `app/lib/firebase-admin.ts` — server send + Firestore tokens
- `public/firebase-messaging-sw.js` — background push handler
- `app/lib/ai/` — Gemini + Mistral chat providers
- `src/` — legacy komponenty a štýly

## Deploy

- **Vercel:** `h4ck3d/growmedicanextjs` alebo `h4ck3d/growmedica-noor-demo`
- **Firebase:** pozri `vercel.md` a Firebase Console env
