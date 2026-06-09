Samozrejme. Na základe analýzy kódu a bežných požiadaviek na moderné e-commerce aplikácie som pre vás pripravil detailný blueprint. Tento plán vás prevedie krokmi potrebnými na transformáciu vašej súčasnej statickej aplikácie na plne funkčný, dynamický a na produkciu pripravený e-shop.

Tento plán je rozdelený do štyroch hlavných fáz:
1. Prepojenie na dáta (Backend a Shopify)
2. Implementácia kľúčovej e-commerce funkcionality
3. Rozšírenie obsahu a používateľských funkcií
4. Optimalizácia a príprava na produkciu

Cieľ: Nahradiť všetky statické (hardcoded) dáta v aplikácii reálnymi dátami z e-commerce platformy. Váš súbor IMPLEMENTATION_NOTES.md naznačuje použitie Shopify, takže sa budeme držať toho.
* Krok 1.1: Nastavenie Shopify Storefront API
    * Vo vašom Shopify admin rozhraní vytvorte "private app" alebo "custom app".
    * Povoľte prístup k Storefront API.
    * Získajte Storefront API access token a API endpoint URL. Tieto hodnoty si bezpečne uložte ako premenné prostredia (environment variables) vo vašom projekte (napr. v súbore .env).
* Krok 1.2: Vytvorenie dátovej vrstvy
    * Vytvorte v src priečinok, napríklad lib alebo services.
    * V ňom vytvorte súbor (napr. src/lib/shopify.ts), ktorý bude zodpovedný za všetku komunikáciu so Shopify Storefront API. Bude obsahovať funkcie na:
        * getProductsInCollection(collectionHandle): Získanie všetkých produktov v danej kolekcii.
        * getProductByHandle(handle): Získanie detailov jedného konkrétneho produktu.
        * getCollections(): Získanie všetkých kolekcií pre navigáciu.
        * createCart(), addToCart(), getCart(): Funkcie pre prácu s košíkom (viac v ďalšej fáze).
* Krok 1.3: Dynamizácia kľúčových komponentov
    * Domovská stránka (HomeHeroNoorStyle.tsx a ProductGrid):
        * Namiesto statického textu použite funkciu z vašej dátovej vrstvy na načítanie hlavnej kolekcie a jej produktov.
        * Komponent ProductGrid (spomenutý v poznámkach) by mal mapovať cez zoznam produktov a zobrazovať ich obrázky, názvy a ceny.
    * Detail produktu (ProductDetailPage.tsx):
        * Táto stránka musí prijímať parameter z URL (napr. /products/lipozomalny-vitamin-c).
        * Použite tento parameter (handle) na zavolanie getProductByHandle(handle).
        * Získanými dátami nahraďte všetky statické texty: názov, cenu, popis, obrázky, a tiež dynamicky generujte obsah pre záložky ako "Zloženie" či "Dávkovanie" (ak sú tieto dáta dostupné v Shopify ako metafields).
    * Navigácia (SiteHeader.tsx a MegaMenu.tsx):
        * Použite getCollections() na dynamické vygenerovanie položiek v menu, aby ste nemuseli manuálne pridávať nové kategórie.

Cieľ: Umožniť používateľom reálne nakupovať – pridávať produkty do košíka a dokončiť objednávku.
* Krok 2.1: Plne funkčný nákupný košík (CartDrawer.tsx)
    * Využite Shopify Cart API. Pri prvej akcii s košíkom zavolajte createCart() a uložte si vrátené cartId do lokálneho úložiska (localStorage) v prehliadači.
    * Pridanie do košíka: Na tlačidle "Do košíka" (ProductDetailPage) zavolajte funkciu addToCart(cartId, variantId, quantity).
    * Zobrazenie košíka: Komponent CartDrawer musí pri otvorení načítať aktuálny stav košíka pomocou getCart(cartId) a zobraziť položky, medzisúčet a celkovú cenu.
    * Implementujte funkčnosť na zmenu množstva a odstránenie položiek z košíka (opäť pomocou volaní Shopify API).
* Krok 2.2: Proces objednávky (Checkout)
    * Headless e-shopy zvyčajne nevytvárajú vlastný checkout proces od nuly kvôli bezpečnosti a zložitosti.
    * Namiesto toho získajte z getCart() funkcie špeciálnu URL adresu (checkoutUrl).
    * Tlačidlo "Prejsť do pokladne" (CartDrawer) jednoducho presmeruje používateľa na túto checkoutUrl, kde sa otvorí bezpečné a overené prostredie Shopify na dokončenie objednávky (zadanie adresy, platba).
* Krok 2.3: Funkčnosť vyhľadávania (SearchDrawer.tsx)
    * Implementujte logiku pre vyhľadávanie produktov pomocou Shopify Search API.
    * Pri písaní do vyhľadávacieho poľa posielajte požiadavky na API a zobrazujte výsledky v reálnom čase.

Cieľ: Zvýšiť dôveryhodnosť a používateľský komfort pridaním ďalšieho obsahu a funkcií.
* Krok 3.1: Používateľské účty ("Účet")
    * Využite Shopify Customer Account API.
    * Implementujte registráciu, prihlásenie a obnovu hesla.
    * Vytvorte zabezpečenú sekciu "Môj účet", kde si prihlásený používateľ bude môcť pozrieť históriu svojich objednávok a spravovať svoje adresy.
* Krok 3.2: Dynamizácia magazínu/blogu
    * Váš SiteHeader už má odkaz "Magazín".
    * Využite Shopify Blog a Articles API na načítanie a zobrazenie článkov, ktoré vytvoríte v Shopify administrácii. Vytvorte stránku so zoznamom článkov a stránku pre detail článku.
* Krok 3.3: Statické stránky (O nás, Kontakt, FAQ)
    * Vytvorte tieto stránky. Odporúčam ich tiež spravovať cez Shopify (v sekcii Online Store > Pages) a načítať ich obsah cez API. To umožní jednoduchú úpravu textov bez nutnosti zasahovať do kódu.

Cieľ: Zabezpečiť, aby bola aplikácia rýchla, spoľahlivá, bezpečná a merateľná.
* Krok 4.1: Testovanie
    * End-to-End (E2E) testy: Napíšte testy, ktoré simulujú reálneho používateľa. Napríklad: "prísť na stránku, nájsť produkt, pridať ho do košíka a prejsť do checkoutu". Nástroje ako Cypress alebo Playwright sú na to ideálne.
    * Responzivita: Dôkladne otestujte celú aplikáciu na rôznych zariadeniach (mobil, tablet, desktop).
* Krok 4.2: Optimalizácia výkonu
    * Obrázky: Uistite sa, že využívate optimalizované formáty obrázkov a lazy loading. Shopify API často poskytuje obrázky v rôznych veľkostiach – využite to.
    * Caching: Zvážte cachovanie (dočasné ukladanie) API odpovedí, ktoré sa často nemenia (napr. zoznam kolekcií), aby sa aplikácia načítavala rýchlejšie.
* Krok 4.3: Analytika
    * Integrujte analytický nástroj (napr. Google Analytics, Vercel Analytics alebo Plausible) na sledovanie návštevnosti, správania používateľov a konverzií.
* Krok 4.4: SEO (Optimalizácia pre vyhľadávače)
    * Zabezpečte, aby každá stránka (hlavne produkty a články) mala unikátny a popisný <title> a <meta name="description">. Tieto dáta by mali byť načítané dynamicky zo Shopify.

Po dokončení týchto štyroch fáz budete mať robustnú, modernú a "dokonale dokončenú" e-commerce aplikáciu. Tento blueprint vám slúži ako mapa, pokojne sa pýtajte na detaily ku ktorémukoľvek kroku, keď sa k nemu dostanete.
                                                                                                                                                