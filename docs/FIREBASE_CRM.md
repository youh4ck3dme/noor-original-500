# Firebase CRM — GrowMedica Customer Experience

## Prehľad

Zákaznícka časť eshopu používa:

- **Firebase Auth** — email/heslo + Google Sign-In
- **Firestore** — profily (`users`) a recenzie (`reviews`)
- **Shopify Storefront API** — produkty, tagy, metaobjekty pre PDP

## Firestore kolekcie

### `users/{uid}`

| Pole | Typ | Popis |
|------|-----|-------|
| `uid` | string | Firebase UID |
| `email` | string | E-mail |
| `displayName` | string | Zobrazované meno |
| `fitnessGoals` | string[] | Ciele zákazníka |
| `allergies` | string[] | Alergie / intolerancie |
| `shopifyCustomerId` | string \| null | Rezervované pre budúce prepojenie so Shopify |
| `createdAt` | timestamp | Vytvorené |
| `updatedAt` | timestamp | Aktualizované |

Bootstrap: `POST /api/profile/bootstrap` (po prihlásení)

Čítanie/úprava: `GET` / `PATCH /api/profile`

### `reviews/{reviewId}`

| Pole | Typ | Popis |
|------|-----|-------|
| `productHandle` | string | Shopify handle produktu |
| `uid` | string | Autor recenzie |
| `authorName` | string | Meno |
| `rating` | number | 1–5 |
| `title` | string? | Voliteľný nadpis |
| `body` | string | Text recenzie |
| `verified` | boolean | `true` ak má používateľ `shopifyCustomerId` |
| `createdAt` | timestamp | Vytvorené |

API: `GET /api/reviews?handle=...`, `POST /api/reviews`

## Firebase Console setup

1. **Authentication → Sign-in method**
   - Zapnúť **Email/Password**
   - Zapnúť **Google** a nastaviť support email + authorized domain
2. **Firestore**
   - Vytvoriť databázu (production mode)
   - Pridať composite index pre `reviews`: `productHandle ASC`, `createdAt DESC`
3. **Security rules** (odporúčané)

```txt
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid} {
      allow read, write: if false;
    }
    match /reviews/{reviewId} {
      allow read: if true;
      allow write: if false;
    }
    match /fcm_tokens/{tokenId} {
      allow read, write: if false;
    }
  }
}
```

Všetky zápisy idú cez Next.js API routes s Firebase Admin SDK.

## Shopify metafields checklist

V Shopify Admin → Settings → Custom data → Products:

| Namespace | Key | Typ | Storefront API |
|-----------|-----|-----|----------------|
| `custom` | `composition` | Rich text / Multi-line | Áno |
| `custom` | `dosage` | Rich text / Multi-line | Áno |
| `custom` | `lab_tests` | List of metaobject references | Áno |
| `custom` | `product_faq` | JSON | Áno |

Metaobject type `lab_test`:

- `title` (single line)
- `lab_name` (single line)
- `test_date` (single line)
- `pdf_url` (URL)

Formát `product_faq` JSON:

```json
[
  { "question": "Ako užívať?", "answer": "1 kapsula denne." }
]
```

## Goal → tag mapping

| Fitness cieľ | Shopify tagy |
|--------------|--------------|
| `naberanie-svalov` | svaly, protein, kreatin, bcaa, aminokyseliny |
| `regeneracia` | regeneracia, kolagen, magnesium, zinc, vitamin-c |
| `spanok` | spanok, magnesium, ashwagandha, melatonin, relax |
| `lepsie-travenie` | travenie, probiotika, vlaknina, digest, enzymy |
| `imunita` | imunita, vitamin-c, vitamin-d, zinok, echinacea |
| `energia` | energia, b-komplex, kofein, guarana, koenzym |

Logika: [`app/lib/recommendations.ts`](../app/lib/recommendations.ts)

## E2E testovanie

| Príkaz | Čo testuje |
|--------|------------|
| `npm test` | Unit testy (mapper, recommendations, profile API) |
| `npm run test:e2e` | Všetky E2E okrem `@auth` testov |
| `npm run test:e2e:auth` | Plná zákaznícka cesta s Firebase loginom |

Pre `@auth` testy sú credentials v **`.env.local`** (pozri `app/lib/ai/testovaciucet.md`). Playwright ich načíta automaticky cez `e2e/load-env-local.ts`.

```env
E2E_AUTH=1
E2E_TEST_EMAIL=...
E2E_TEST_PASSWORD=...
```

| Príkaz | Popis |
|--------|-------|
| `npm run test:e2e` | Smoke E2E (bez `@auth`) |
| `npm run test:e2e:auth` | Plná cesta (`E2E_RUN_AUTH=1` + credentials z `.env.local`) |

Súbor: `e2e/customer-journey.spec.ts`

Voliteľne `E2E_PDP_HANDLE=energy-renol` v `.env.local` pre PDP smoke s konkrétnym produktom.

## Shopify metafields — overenie a seed

```bash
npm run verify:shopify-metafields
npm run seed:product-metafields -- --dry-run
npm run seed:product-metafields
```

Vyžaduje Storefront token (verify) a Admin token (seed). Pozri [SETUP.md](SETUP.md) → Shopify Custom App.

## Routy

| URL | Popis |
|-----|-------|
| `/ucet` | Profil zákazníka (chránené) |
| `/ucet/prihlasenie` | Login / registrácia |
| `/produkty/[handle]` | PDP s metaobjektmi a recenziami |

## Shopify Customer ID a objednávky

1. **Customer Account OAuth** — `/api/auth/shopify/login` → Shopify authorize → `/api/auth/shopify/callback` (PKCE, httpOnly cookies)
2. `POST /api/profile/link-shopify` — preferuje OAuth session; fallback: Admin API lookup podľa e-mailu → uloží `shopifyCustomerId`
3. `GET /api/orders` — preferuje Customer Account token; fallback: Admin API cez `shopifyCustomerId` vo Firestore
4. Tab **Moje objednávky** na `/ucet` — komponent `OrderHistory`

**Verified recenzie:** `verified: true` znamená, že používateľ má prepojený Shopify účet (`shopifyCustomerId`), nie že kúpil konkrétny produkt.
