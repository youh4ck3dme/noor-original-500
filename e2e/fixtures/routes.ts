export const STATIC_PAGES = [
  { path: '/', heading: /GrowMedica|produkt/i },
  { path: '/about', heading: /GrowMedica|O nás/i },
  { path: '/faq', heading: /otázky|FAQ|Často/i },
  { path: '/contact', heading: /Kontakt/i },
  { path: '/magazine', heading: /Magazín/i },
  { path: '/shipping-returns', heading: /Doprava|vrátenie/i },
  { path: '/privacy-policy', heading: /Ochrana|údajov/i },
  { path: '/terms-of-service', heading: /Obchodné|podmienky/i },
  { path: '/order-tracking', heading: /Sledovanie|objednávky/i },
  { path: '/collections/frontpage', heading: /Domovská|frontpage|Kolekc|produkt/i },
] as const;

export const PRODUCT_HANDLES = [
  'energy-vironal',
  'energy-renol',
  'energy-regalen',
  'energy-korolen',
  'energy-stimaral',
  'energy-drags-imun',
  'energy-protektin',
  'energy-droserin',
  'energy-artrin',
  'energy-cytosan',
  'energy-annona-muricata',
  'energy-tribulus-terestris',
] as const;

export const FOOTER_LINKS = [
  '/collections/frontpage',
  '/faq',
  '/contact',
  '/shipping-returns',
  '/privacy-policy',
  '/terms-of-service',
] as const;

export const HEADER_LINKS = ['/about', '/magazine'] as const;
