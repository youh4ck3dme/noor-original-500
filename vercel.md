Hotovo. Stiahol som env z Vercel (`h4ck3d/growmedicanextjs`, development target) a pripravil kompletný Firebase blueprint.

## Čo máš pripravené

| Súbor | Účel |
|-------|------|
| **`storefront/docs/FIREBASE_AGENT_BLUEPRINT.local.md`** | Celý agent prompt **s reálnymi hodnotami** — skopíruj do Firebase Studio agenta |
| **`storefront/docs/FIREBASE_AGENT_BLUEPRINT.secrets.env`** | Paste-ready `.env` pre Firebase Console → Environment |
| **`storefront/docs/FIREBASE_AGENT_BLUEPRINT.md`** | Bezpečná dokumentácia (commitovateľná, bez secretov) |
| **`storefront/apphosting.yaml`** | Firebase App Hosting config so secret referenciami |

## Ako to použiť vo Firebase Studio

1. Otvor **`storefront/docs/FIREBASE_AGENT_BLUEPRINT.local.md`**
2. Skopíruj celý obsah do agenta vo Firebase Studio
3. Pri setup App Hosting:
   - **Root directory:** `storefront`
   - **Branch:** `main` (NOOR variant: `feat/noor-production-demo`)
4. Env vlož z **`FIREBASE_AGENT_BLUEPRINT.secrets.env`** do Console → Backend → Settings → Environment

## Druhý shop (NOOR)

V `.local.md` je sekcia **Shop 2** — rovnaké Shopify + Mistral, plus:

```env
NEXT_PUBLIC_DEFAULT_THEME=noor
NEXT_PUBLIC_HIDE_THEME_SWITCHER=1
NEXT_PUBLIC_SITE_URL=https://growmedica-noor-demo.vercel.app
```

## Bezpečnosť

- Súbory so secretmi sú **gitignored** — necommitnú sa
- Do git ide len `FIREBASE_AGENT_BLUEPRINT.md` + `apphosting.yaml` (bez hodnôt tokenov)
- Po deployi nezabudni zmeniť `NEXT_PUBLIC_SITE_URL` na finálnu Firebase/custom doménu a redeploy

Ak chceš, môžem ešte pripraviť aj `firebase.json` alebo commitnúť bezpečné súbory do repa.