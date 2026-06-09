
# GrowMedica Noor-Style UI Foundation (Phase 1-3)

Tento export obsahuje prísne typované, bezpečné komponenty pre Next.js 15 App Router.

## 1. File Existence Audit
Všetky požadované súbory boli vygenerované:
- `src/lib/theme/storefront-types.ts`
- `src/components/ui/GlassPanel.tsx`
- `src/components/ui/LiquidButton.tsx`
- `src/components/ui/SectionHeading.tsx`
- `src/components/ui/ProductBadge.tsx`
- `src/components/layout/AnnouncementBar.tsx`
- `src/components/layout/SiteHeader.tsx`
- `src/components/layout/SiteHeaderClient.tsx`
- `src/components/layout/MegaMenu.tsx`
- `src/components/commerce/ProductCard.tsx`
- `src/components/commerce/ProductGrid.tsx`
- `src/components/commerce/AddToCartButton.tsx`
- `globals.css-token-block.css`

## 2. Strict No-Go Check
- Žiadne fake produkty, žiadne Unsplash obrázky.
- Žiadne hardcoded marketing copy.
- Žiadny `console.log`, `suppressHydrationWarning`, `force-dynamic`.
- Žiadne nedokončené placeholdery (MobileMenu, CartDrawer, SearchDrawer).

## 3. Dependency Safety
**UPOZORNENIE PRE DEVELOPERA:**
Tieto komponenty vyžadujú existujúce závislosti:
- `clsx` (pre spájanie Tailwind tried)
- `lucide-react` (pre ikony v hlavičke: Search, ShoppingBag, Menu, User)
Ak v `package.json` chýbajú, je potrebné ich doinštalovať (`yarn add clsx lucide-react`).

## 4. TypeScript & Next.js Safety
- Všetky komponenty používajú alias `@/`.
- `ProductCard`, `ProductGrid`, `SiteHeader`, `AnnouncementBar`, `GlassPanel`, `SectionHeading`, `ProductBadge` sú **Server Components**.
- `AddToCartButton`, `SiteHeaderClient`, `MegaMenu` sú **Client Components**.
- Použité `next/image` a `next/link`.

## 5. Add To Cart Safety
`AddToCartButton` nevykonáva žiadnu fake mutáciu. Prijíma prop `onAddToCart`, ktorý musí byť dodaný z rodiča (napr. napojený na Shopify Cart API). Ak prop chýba, tlačidlo je bezpečne disabled.

## 6. Homepage Integration (Next Steps)
Tento export úmyselne neupravuje `src/app/page.tsx`.
V ďalšom PR je potrebné:
1. Fetchovať reálne dáta cez Shopify data layer.
2. Namapovať ich na typy v `storefront-types.ts`.
3. Podať ich do `ProductGrid` a ďalších sekcií.
