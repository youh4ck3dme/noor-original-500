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

## Časté problémy

| Problém | Riešenie |
|---------|----------|
| `ERESOLVE` eslint konflikt | V `package.json` musí byť `"eslint": "^9"` |
| `Cannot find module 'autoprefixer'` | `npm install` (je v devDependencies) |
| Turbopack cache error | `rm -rf .next && npm run dev` |
| Shopify env not set | Skontroluj `.env.local` a `SHOPIFY_API_ENDPOINT_URL` |

## Štruktúra

- `app/` — Next.js App Router (storefront)
- `app/lib/shopify.ts` — Shopify Storefront API
- `app/lib/firebase.ts` — Firebase init
- `src/` — legacy komponenty a štýly

## Deploy

- **Vercel:** `h4ck3d/growmedicanextjs` alebo `h4ck3d/growmedica-noor-demo`
- **Firebase:** pozri `vercel.md` a Firebase Console env
