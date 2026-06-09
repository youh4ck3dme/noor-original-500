# Shopify webhooky — HOTOVÉ URL (copy-paste do Admin panelu)
# ⚠️ GITIGNORED — obsahuje revalidation secret v URL
# Vygenerované: 2026-06-09

Shop: https://admin.shopify.com/store/tn43yx-0k
Cesta: Settings → Notifications → Webhooks → Create webhook

---

## Vercel produkcia (growmedicanextjs)

**Webhook URL** (rovnaká pre všetkých 6 eventov):

```
https://growmedicanextjs.vercel.app/api/revalidate?secret=mlRv2LSMK6Fj40ka918tlwDqi65WFzPLrHQghfEuo9h9PLQzGXU24cBcSIImRmRQ
```

### 6× Create webhook

| # | Event | Format | URL |
|---|-------|--------|-----|
| 1 | Product creation | JSON | ↑ skopíruj URL vyššie |
| 2 | Product update | JSON | ↑ rovnaká |
| 3 | Product deletion | JSON | ↑ rovnaká |
| 4 | Collection creation | JSON | ↑ rovnaká |
| 5 | Collection update | JSON | ↑ rovnaká |
| 6 | Collection deletion | JSON | ↑ rovnaká |

Webhook API version: **2025-01**

---

## Firebase / NOOR (po deployi — zmeň doménu)

NOOR demo Vercel:
```
https://growmedica-noor-demo.vercel.app/api/revalidate?secret=mlRv2LSMK6Fj40ka918tlwDqi65WFzPLrHQghfEuo9h9PLQzGXU24cBcSIImRmRQ
```

Custom NOOR doména (keď DNS bude hotové):
```
https://noor.growmedica.sk/api/revalidate?secret=mlRv2LSMK6Fj40ka918tlwDqi65WFzPLrHQghfEuo9h9PLQzGXU24cBcSIImRmRQ
```

---

## Rýchly test

```bash
curl -i -X POST "https://growmedicanextjs.vercel.app/api/revalidate?secret=mlRv2LSMK6Fj40ka918tlwDqi65WFzPLrHQghfEuo9h9PLQzGXU24cBcSIImRmRQ" \
  -H "Content-Type: application/json" \
  -H "x-shopify-topic: products/update" \
  -d '{"handle":"test"}'
```

Očakávané: HTTP 200

---

## Poznámka

Ak presúvaš z Vercel na Firebase, **zmaž staré webhooky** alebo updatni URL —
inak Shopify stále volá starú doménu.
