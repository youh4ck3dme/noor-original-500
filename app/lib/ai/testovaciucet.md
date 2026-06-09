# Testovací účet (E2E)

Credentials sú uložené v **`.env.local`** (gitignored):

```env
E2E_AUTH=1
E2E_TEST_EMAIL=...
E2E_TEST_PASSWORD=...
```

Spustenie plnej zákazníckej cesty:

```bash
npm run test:e2e:auth
```

Poznámka: Účet musí existovať vo Firebase Auth (Email/Password). Registráciu vykonaj raz manuálne cez `/ucet/prihlasenie` ak ešte neexistuje.
