# Shopify webhooky — HOTOVÉ URL (copy-paste do Admin panelu)
# ⚠️ GITIGNORED — obsahuje revalidation secret v URL
# Vygenerované: 2026-06-09

Shop: https://admin.shopify.com/store/tn43yx-0k
Cesta: Settings → Notifications → Webhooks → Create webhook

---

## Produkcia (grow.nexify-studio.tech)

**Webhook URL** (rovnaká pre všetkých 6 eventov):

```
https://grow.nexify-studio.tech/api/revalidate?secret=mlRv2LSMK6Fj40ka918tlwDqi65WFzPLrHQghfEuo9h9PLQzGXU24cBcSIImRmRQ
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

## Legacy (nezapínať)

Staré Vercel URL — nahradené produkciou `grow.nexify-studio.tech`.

---

## Rýchly test

```bash
curl -i -X POST "https://grow.nexify-studio.tech/api/revalidate?secret=mlRv2LSMK6Fj40ka918tlwDqi65WFzPLrHQghfEuo9h9PLQzGXU24cBcSIImRmRQ" \
  -H "Content-Type: application/json" \
  -H "x-shopify-topic: products/update" \
  -d '{"handle":"test"}'
```

Očakávané: HTTP 200

---

## Poznámka

Ak presúvaš z Vercel na Firebase, **zmaž staré webhooky** alebo updatni URL —
inak Shopify stále volá starú doménu.
