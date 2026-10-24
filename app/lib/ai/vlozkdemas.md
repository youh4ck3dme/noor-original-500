# Admin prístup a Shopify API

Hodnoty sú v **`.env.local`** (gitignored).

## Admin panel

```env
ADMIN_EMAILS=u0352652320@gmail.com,Kajo.Szaffko@gmail.com,linda.szaffkova@gmail.com
```

http://localhost:3001/admin — Firebase login s e-mailom z `ADMIN_EMAILS`.

## Shopify Admin API (Custom App)

```env
SHOPIFY_ADMIN_ACCESS_TOKEN=...
SHOPIFY_ADMIN_API_URL=https://tn43yx-0k.myshopify.com/admin/api/2025-01/graphql.json
```

Povinné scopes: `read_products`, **`write_products`**, `read_customers`, `read_orders`. Po zmene scope **reinstall app** a aktualizuj token.

## Shopify Customer Account API (Headless OAuth)

Koncové body z Shopify Headless → Customer Account API → Application setup (shop `104292483406`):

| Účel | URL |
|------|-----|
| Autorizácia | `https://shopify.com/authentication/104292483406/oauth/authorize` |
| Token | `https://shopify.com/authentication/104292483406/oauth/token` |
| Odhlásenie | `https://shopify.com/authentication/104292483406/logout` |
| GraphQL | `https://shopify.com/104292483406/account/customer/api/2026-04/graphql` |

Do `.env.local`:

```env
SHOPIFY_CUSTOMER_ACCOUNT_SHOP_ID=104292483406
SHOPIFY_CUSTOMER_ACCOUNT_AUTHORIZE_URL=https://shopify.com/authentication/104292483406/oauth/authorize
SHOPIFY_CUSTOMER_ACCOUNT_TOKEN_URL=https://shopify.com/authentication/104292483406/oauth/token
SHOPIFY_CUSTOMER_ACCOUNT_LOGOUT_URL=https://shopify.com/authentication/104292483406/logout
SHOPIFY_CUSTOMER_ACCOUNT_GRAPHQL_URL=https://shopify.com/104292483406/account/customer/api/2026-04/graphql
SHOPIFY_CUSTOMER_ACCOUNT_REDIRECT_URI=https://grow.nexify-studio.tech/api/auth/shopify/callback
SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID=...
SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_SECRET=...
```

### Callback URL — zaregistruj v Shopify Headless UI

Admin: **https://admin.shopify.com/store/tn43yx-0k/headless** → tvoja app → **Customer Account API** → **Application setup** → **Allowed redirection URL(s)**

| Prostredie | Callback URI (iba `/callback`, nie `/login`) |
|------------|-----------------------------------------------|
| Produkcia | `https://grow.nexify-studio.tech/api/auth/shopify/callback` |
| Lokálne | **nefunguje** s `http://localhost` — Shopify vyžaduje HTTPS (ngrok alebo test na Vercel) |

**Nepridávajte** do Callback URI: `/api/auth/shopify/login` ani query parametre (`?next=...`).

Produkčná URL: **https://grow.nexify-studio.tech**

Firebase deploy:
```bash
npm run deploy:production
```
Ak CLI nemá IAM → `firebase login --reauth` → znova deploy, alebo paste `.firebase-env-paste.txt` do Console (`noorgrowmfinnal-58800798-76fac` → Environment → Rollout).

Routy v aplikácii: `/api/auth/shopify/login`, `/callback`, `/logout`, `/session`.

## Overenie

```bash
npm run verify:shopify-admin
npm run verify:shopify-admin-scopes
npm run verify:shopify-customer-auth
npm run verify:shopify-metafields
npm run seed:product-metafields -- --dry-run
npm test && npm run build
```
