# Customer Account API — prihlasovacie údaje

Hodnoty sú v **`.env.local`** (gitignored):

```env
SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID=899f4e68-4753-4e7f-b205-694b5a226545
SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_SECRET=...
```

Overenie: `npm run verify:shopify-customer-auth`

Produkcia: `https://grow.nexify-studio.tech`

## Shopify (hotové)
- Callback: `https://grow.nexify-studio.tech/api/auth/shopify/callback` ✓

## Firebase deploy

```bash
npm run deploy:production
```

Alebo manuálne:
1. `npm run preflight:firebase` — ak FAIL → `firebase login --reauth`
2. `npm run sync:firebase-env` — secrets + `.firebase-env-paste.txt`
3. Ak secrets zlyhajú → vlož paste do Console:
   https://console.firebase.google.com/project/noorgrowmfinnal-58800798-76fac/apphosting
   → backend `noor-original-500` → Environment → Rollout

## Test po deployi
`https://grow.nexify-studio.tech/api/auth/shopify/login?next=/ucet`
