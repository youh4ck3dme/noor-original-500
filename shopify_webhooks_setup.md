# Shopify webhooky — copy-paste setup pre GrowMedica

Nastav v **Shopify Admin** po deployi headless storefrontu (Vercel alebo Firebase).

Shop: `tn43yx-0k.myshopify.com`  
Endpoint: `/api/revalidate`  
Formát: **JSON**

> **Prečo `?secret=` v URL?** Shopify webhook UI neumožňuje custom header `x-revalidation-secret`.
> Endpoint preto akceptuje aj query parameter `secret` (rovnaká hodnota ako env `SHOPIFY_REVALIDATION_SECRET`).

---

## Kam ísť v Shopify Admin

```
Shopify Admin
  → Settings (ľavý dolný roh)
  → Notifications
  → Webhooks (dole na stránke)
  → Create webhook
```

Opakuj **6×** (jeden webhook = jeden event).

---

## 6 webhookov — copy-paste tabuľka

Nahraď `<DOMÉNA>` finálnou URL shopu:

| # | Event (Topic) | Webhook URL (celá adresa) |
|---|---------------|---------------------------|
| 1 | **Product creation** | `https://<DOMÉNA>/api/revalidate?secret=<SHOPIFY_REVALIDATION_SECRET>` |
| 2 | **Product update** | `https://<DOMÉNA>/api/revalidate?secret=<SHOPIFY_REVALIDATION_SECRET>` |
| 3 | **Product deletion** | `https://<DOMÉNA>/api/revalidate?secret=<SHOPIFY_REVALIDATION_SECRET>` |
| 4 | **Collection creation** | `https://<DOMÉNA>/api/revalidate?secret=<SHOPIFY_REVALIDATION_SECRET>` |
| 5 | **Collection update** | `https://<DOMÉNA>/api/revalidate?secret=<SHOPIFY_REVALIDATION_SECRET>` |
| 6 | **Collection deletion** | `https://<DOMÉNA>/api/revalidate?secret=<SHOPIFY_REVALIDATION_SECRET>` |

Pre každý riadok v Admin UI:

| Pole | Hodnota |
|------|---------|
| **Event** | topic z tabuľky vyššie |
| **Format** | JSON |
| **URL** | celá URL z tabuľky |
| **Webhook API version** | `2025-01` (alebo latest stable) |

---

## Príklad pre Vercel (aktuálna produkcia)

Doména: `grow.nexify-studio.tech`  
Secret: hodnota z `storefront/docs/FIREBASE_AGENT_BLUEPRINT.secrets.env`

```
https://grow.nexify-studio.tech/api/revalidate?secret=<SHOPIFY_REVALIDATION_SECRET>
```

*(Rovnaká URL pre všetkých 6 webhookov — líši sa len Event.)*

---

## Príklad pre Firebase / custom doména

```
https://grow.nexify-studio.tech/api/revalidate?secret=<SHOPIFY_REVALIDATION_SECRET>
```

Po zmene domény **updatni URL** u všetkých 6 webhookov + `NEXT_PUBLIC_SITE_URL` + redeploy.

---

## Overenie po nastavení

### 1) Manuálny test (curl)

```bash
curl -i -X POST "https://<DOMÉNA>/api/revalidate?secret=<SHOPIFY_REVALIDATION_SECRET>" \
  -H "Content-Type: application/json" \
  -H "x-shopify-topic: products/update" \
  -d '{"handle":"test-produkt"}'
```

Očakávaná odpoveď: **HTTP 200** + `{"revalidated":true,...}`

Bez secretu: **HTTP 401**

### 2) Test cez Shopify

1. Uprav ľubovoľný produkt v Admin (napr. zmeň popis)
2. Shopify Admin → Settings → Notifications → Webhooks → klikni na webhook → **Recent deliveries**
3. Očakávané: **200 OK**

Ak 401 → zlý secret v URL. Ak 500 → chýba `SHOPIFY_REVALIDATION_SECRET` v env deployu.

---

## Alternatíva: header namiesto query param

Pre cron / CI / manuálne volanie (nie Shopify UI):

```bash
curl -i -X POST "https://<DOMÉNA>/api/revalidate" \
  -H "x-revalidation-secret: <SHOPIFY_REVALIDATION_SECRET>" \
  -H "Content-Type: application/json" \
  -H "x-shopify-topic: products/update" \
  -d '{}'
```

---

## Čo sa revaliduje

| Shopify topic | Next.js cache tag |
|---------------|-------------------|
| `products/*` | `products`, `product-{handle}` |
| `collections/*` | `collections`, `collection-{handle}` |

Bez webhookov ISR cache trvá **3600 s (1 hodina)**.

---

## Bezpečnosť

- Secret v URL sa môže objaviť v server logoch — pre vyššiu bezpečnosť používaj header (cron/CI) alebo neskôr Shopify HMAC verifikáciu
- Nikdy necommituj plnú webhook URL s secretom do gitu
- Hotová verzia s vyplneným secretom: `storefront/docs/SHOPIFY_WEBHOOK_SETUP.local.md` (gitignored)

---

## Súvisiace

- Env secret: `SHOPIFY_REVALIDATION_SECRET` v `storefront/.env.example`
- Route: `storefront/src/app/api/revalidate/route.ts`
- Firebase blueprint: `storefront/docs/FIREBASE_AGENT_BLUEPRINT.md`
