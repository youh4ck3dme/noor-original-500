# Integrácia design systému (kompenenntdizajn.zip)

Magic Patterns GrowMedica DS — 36 komponentov v `app/components/ds/`.

## Štruktúra

| Vrstva | Cesta | Úloha |
|--------|-------|-------|
| Design System | `app/components/ds/` | Prevzaté komponenty z zip (adaptované pre Next.js) |
| Commerce wrappers | `app/components/commerce/` | ProductGrid, PDP client, kolekcie, formuláre |
| Providers | `app/components/providers/` | Toast + Shopify Cart |
| Layout | `app/components/layout/` | Header, Footer, StorePageShell, Cart/Search wrappers |

## Mapa komponent → stránka

| Komponent | Použitie |
|-----------|----------|
| SectionHeading | `/`, `/about`, `/faq`, `/contact`, `/magazine`, kolekcie |
| ProductCard + ProductGrid | `/`, `/collections/[handle]` |
| Breadcrumb | PDP, kolekcie |
| ProductGallery | PDP |
| ProductDetailClient | PDP (VariantSelector, QuantityStepper, PriceTag, Tabs) |
| FilterSidebar + Pagination | `/collections/[handle]` |
| Accordion | `/faq`, `/shipping-returns` |
| ContactForm (Input, Textarea, Button) | `/contact` |
| ReviewCard | `/magazine` |
| Steps | `/order-tracking` |
| CartDrawer + CartLineItem + OrderSummary | globálny košík |
| SearchDrawer | header search |
| Toast | add-to-cart, formuláre |
| Skeleton | `app/loading.tsx` |
| EmptyState | `app/not-found.tsx`, prázdna kolekcia |

## API endpointy (nové)

- `GET/POST /api/cart` — Shopify Storefront Cart
- `GET /api/search?q=` — vyhľadávanie produktov

## Fázy implementácie

1. **Foundation** — `app/components/ds/`, `framer-motion`, adaptácia `'use client'` + `clsx`
2. **Providers** — `StorefrontProviders` v `app/layout.tsx`
3. **Commerce** — PDP, kolekcie, homepage
4. **Static pages** — about, faq, contact, shipping, privacy, terms, magazine, order-tracking
5. **Cart + Search** — CartProvider, SearchDrawerWrapper

## Referenčná kópia

Pôvodný zip je v `design-system/` (Vite preview app — nepoužíva sa v produkcii).
