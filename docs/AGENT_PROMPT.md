# Agent prompt — NOOR Original 500 setup & údržba

Skopíruj celý blok nižšie do Cursor Agenta alebo Firebase Studio Code view agenta.

---

```
Si senior Next.js developer. Pracuješ na projekte NOOR Original 500 — headless Shopify storefront (Next.js 16, Turbopack, Tailwind, Firebase).

## Repozitár
- GitHub: https://github.com/youh4ck3dme/noor-original-500
- Lokálna cesta: /Users/erikbabcan/noor-original-500
- Vercel projekt (env): h4ck3d/growmedicanextjs (development)
- NOOR demo Vercel: h4ck3d/growmedica-noor-demo

## Úloha
Nastav a udržuj projekt tak, aby lokálne fungoval `npm run dev` bez chýb.

## Kroky pri fresh clone

1. `npm install` — musí prejsť BEZ `--legacy-peer-deps`
   - package.json vyžaduje: eslint ^9, eslint-config-next ^16, autoprefixer, postcss, tailwindcss, firebase

2. Env premenné (.env.local — NIKDY necommituj):
   ```bash
   vercel link --yes --scope h4ck3d --project growmedicanextjs
   vercel env pull .env.local --environment=development --yes
   ```
   Doplň ak chýbajú:
   - SHOPIFY_API_ENDPOINT_URL = https://{SHOPIFY_STORE_DOMAIN}/api/{SHOPIFY_API_VERSION}/graphql.json
   - NEXT_PUBLIC_DEFAULT_THEME=noor
   - NEXT_PUBLIC_HIDE_THEME_SWITCHER=1
   - NEXT_PUBLIC_SITE_URL=http://localhost:3001
   - NEXT_PUBLIC_FIREBASE_* (6 premenných z Firebase Console)
   - GEMINI_API_KEY, MISTRAL_API_KEY
   - MISTRAL_USE_WORKFLOW=0 (1 ak beží workflow worker)
   - MISTRAL_WORKFLOW_IDENTIFIER=noor-pharmacist-chat

3. Mistral Workflows (voliteľné, pre chat fallback cez worker):
   ```bash
   cp workflows/noor-pharmacist/.env.example workflows/noor-pharmacist/.env
   # doplň MISTRAL_API_KEY do workflows/noor-pharmacist/.env
   npm run workflow:worker
   ```
   V druhom termináli: `MISTRAL_USE_WORKFLOW=1 npm run dev`

4. Vibe CLI skill: `.vibe/skills/noor-pharmacist/SKILL.md` → `vibe` + `/noor-pharmacist`

5. Spusti a over:
   ```bash
   rm -rf .next
   npm run dev
   curl -s -o /dev/null -w "%{http_code}" http://localhost:3001
   ```
   Očakávaný výsledok: 200

## Povinné env premenné (app/lib/)

| Premenná | Súbor |
|----------|-------|
| SHOPIFY_STOREFRONT_ACCESS_TOKEN | app/lib/shopify.ts |
| SHOPIFY_API_ENDPOINT_URL | app/lib/shopify.ts |
| SHOPIFY_REVALIDATION_SECRET | app/lib/env.ts |
| NEXT_PUBLIC_FIREBASE_* | app/lib/firebase.ts |

## Známe problémy a fixy

- eslint ERESOLVE: zmeň eslint z ^8 na ^9 v package.json
- autoprefixer missing: `npm install -D autoprefixer` (postcss.config.js ho vyžaduje)
- Turbopack corrupted cache: `rm -rf .next` — .next NESMIE byť v gite
- git push rejected: `git pull --rebase origin main` pred pushom
- Vercel env pull prázdne pre production na growmedica-noor-demo → použi growmedicanextjs development

## Pravidlá

- .env.local, .vercel/, .next/ — gitignore, necommituj
- .env.example — commituj ako šablónu bez secretov
- Minimálny diff, žiadne unrelated zmeny
- Po oprave dependencies commitni package.json + package-lock.json

## Aktuálny stav projektu

Over pred zmenami:
- `git status`
- `grep eslint package.json` → "^9"
- `grep autoprefixer package.json`
- existuje `app/lib/firebase.ts`
- existuje `docs/SETUP.md`

Ak niečo chýba, oprav a reportuj čo si zmenil.
```

---

## Skrátený prompt (rýchla oprava)

```
Fix NOOR Original 500 local dev at /Users/erikbabcan/noor-original-500.

1. npm install (eslint ^9, autoprefixer present)
2. vercel env pull .env.local from h4ck3d/growmedicanextjs development
3. Ensure SHOPIFY_API_ENDPOINT_URL and Firebase NEXT_PUBLIC_* in .env.local
4. npm test && npm run build
5. rm -rf .next && npm run dev — homepage must return 200

Do not commit secrets. Update docs/SETUP.md if steps change.
Mistral: workflow worker `npm run workflow:worker`, env `MISTRAL_USE_WORKFLOW=1`.
```
