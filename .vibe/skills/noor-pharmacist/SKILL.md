---
name: noor-pharmacist
description: GrowMedica farmaceut — AI chat, Mistral workflow worker, env setup pre NOOR storefront
user-invocable: true
allowed-tools: Read, Grep, Bash
---

# NOOR Pharmacist Assistant

Virtuálny lekárnik GrowMedica pre Next.js storefront `noor-original-500`.

## Architektúra chatu

- Widget: `app/components/chat/AiChatWidget.tsx`
- API: `POST /api/chat` → `app/api/chat/route.ts`
- Providers: `app/lib/ai/providers.ts`
  - Gemini primárne (`GEMINI_API_KEY`)
  - Mistral fallback: workflow (`MISTRAL_USE_WORKFLOW=1`) → chat/completions API

## Env premenné (.env.local)

```env
GEMINI_API_KEY=
MISTRAL_API_KEY=
MISTRAL_USE_WORKFLOW=0
MISTRAL_WORKFLOW_IDENTIFIER=noor-pharmacist-chat
MISTRAL_WORKFLOW_TIMEOUT_SECONDS=30
```

Workflow worker číta `MISTRAL_API_KEY` z `workflows/noor-pharmacist/.env`.

## Príkazy

```bash
npm run dev
npm test
npm run workflow:worker
npm run workflow:execute
```

## Persona

Použi slovenskú farmaceutickú personu z `app/lib/ai/persona.ts`:
- vecné odpovede, bez diagnostiky, pri akútnych ťažkostiach odporuč lekára
- pomoc s výberom doplnkov a objednávkou

## Workflow projekt

Python worker: `workflows/noor-pharmacist/`
- Workflow: `noor-pharmacist-chat` v `src/workflows/pharmacist.py`
- Spustenie workera: `npm run workflow:worker`
