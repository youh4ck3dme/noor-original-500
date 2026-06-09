import type { ShopifyProductNode } from './shopify';

export interface OptimizationSuggestion {
  field: string;
  currentValue: string | null;
  suggestedValue: string;
  reason: string;
  type: 'seo' | 'metafield' | 'content';
}

export interface OptimizationApplyPayload {
  seo: {
    title: string;
    description: string;
  };
  metafields: Array<{
    namespace: string;
    key: string;
    type: string;
    value: string;
  }>;
}

export interface MetadataOptimizationResult {
  productId: string;
  productHandle: string;
  productTitle: string;
  suggestions: OptimizationSuggestion[];
  seo: {
    metaTitle: string;
    metaDescription: string;
    suggestedMetaTitle: string;
    suggestedMetaDescription: string;
  };
  missingMetafields: string[];
  benefitsSection?: {
    current: string | null;
    suggested: string;
  };
  applyPayload: OptimizationApplyPayload;
}

const PRODUCT_BENEFITS: Record<string, string[]> = {
  'zeen-collagen': [
    'Podpora kolagénovej syntézy',
    'Zlepšenie elasticity pleti',
    'Posilnenie kĺbov a šliach',
    '100% hydrolysovaný kolagén typ I a III',
    'Rýchla absorpcia',
  ],
  polyporus: [
    'Podpora imunitného systému',
    'Antioxidačné účinky',
    'Detoxikácia organizmu',
    'Podpora pečene',
    '100% prírodný hubový extrakt',
  ],
  reishi: [
    'Adaptogén pre stres',
    'Podpora imunity',
    'Zlepšenie spánku',
    'Antioxidačná ochrana',
    'Tradícia čínskej medicíny',
  ],
  mycomedia: [
    'Komplex hubových extraktov',
    'Podpora imunitného systému',
    'Detoxikácia',
    'Energia a vitalita',
    'Vyrobené v EÚ',
  ],
};

function getMetafieldValue(product: ShopifyProductNode, key: string): string | null {
  const field = product.metafields?.filter(Boolean).find((item) => item?.key === key);
  return field?.value?.trim() || null;
}

function parseMetafieldText(value: string | null): string | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as {
      children?: Array<{ children?: Array<{ value?: string }> }>;
    };
    const text = parsed.children
      ?.flatMap((child) => child.children?.map((node) => node.value ?? '') ?? [])
      .join('')
      .trim();
    return text || value;
  } catch {
    return value;
  }
}

export function getProductBenefits(handle: string): string[] {
  const lowerHandle = handle.toLowerCase();
  for (const [key, benefits] of Object.entries(PRODUCT_BENEFITS)) {
    if (lowerHandle.includes(key)) {
      return benefits;
    }
  }
  return [
    'Podpora celkového zdravia',
    '100% prírodné zložky',
    'Vysoká kvalita',
    'Vyrobené v EÚ',
  ];
}

export function generateSEOTitle(productTitle: string): string {
  const keywords = ['Premium', '100% Prírodné', 'Vysoce Kvalitné', 'EÚ Vyroba'];
  const randomKeyword = keywords[Math.floor(Math.random() * keywords.length)];
  return `${randomKeyword} ${productTitle} | GrowMedica`;
}

export function generateSEODescription(productTitle: string, benefits: string[]): string {
  const benefitText = benefits.slice(0, 2).join(', ');
  return `Objavte ${productTitle} od GrowMedica. ${benefitText} a ďalšie výhody. 100% prírodné zložky, rýchla doprava.`;
}

function defaultMetafieldValue(key: string, benefits: string[]): string {
  switch (key) {
    case 'composition':
      return '100% prírodné zložky — presné zloženie je uvedené na obale.';
    case 'dosage':
      return 'Odporúčané dávkovanie: 1 porcia denne. Neprekračujte odporúčanú dennú dávku.';
    case 'product_faq':
      return JSON.stringify([
        {
          question: 'Ako užívať tento produkt?',
          answer: 'Užívajte podľa odporúčania na obale alebo konzultujte s odborníkom.',
        },
        {
          question: 'Aké sú hlavné výhody?',
          answer: benefits.slice(0, 3).join(', '),
        },
      ]);
    default:
      return '';
  }
}

export function buildOptimizationResult(product: ShopifyProductNode): MetadataOptimizationResult {
  const benefits = getProductBenefits(product.handle);
  const suggestions: OptimizationSuggestion[] = [];

  const currentComposition = parseMetafieldText(getMetafieldValue(product, 'composition'));
  const currentDosage = parseMetafieldText(getMetafieldValue(product, 'dosage'));
  const currentFaq = getMetafieldValue(product, 'product_faq');

  const suggestedComposition =
    currentComposition || defaultMetafieldValue('composition', benefits);
  const suggestedDosage = currentDosage || defaultMetafieldValue('dosage', benefits);
  const suggestedFaq = currentFaq || defaultMetafieldValue('product_faq', benefits);

  const suggestedMetaTitle = generateSEOTitle(product.title);
  const suggestedMetaDescription = generateSEODescription(product.title, benefits);

  suggestions.push({
    field: 'SEO Meta Title',
    currentValue: product.title,
    suggestedValue: suggestedMetaTitle,
    reason: 'Optimalizovaný pre lepšie umiestnenie vo vyhľadávačoch',
    type: 'seo',
  });

  suggestions.push({
    field: 'SEO Meta Description',
    currentValue: null,
    suggestedValue: suggestedMetaDescription,
    reason: 'Zvyšuje klikaciu ratu (CTR) vo vyhľadávačoch',
    type: 'seo',
  });

  const metafieldSuggestions: Array<{
    key: 'composition' | 'dosage' | 'product_faq';
    label: string;
    current: string | null;
    suggested: string;
  }> = [
    {
      key: 'composition',
      label: 'Zloženie (custom.composition)',
      current: currentComposition,
      suggested: suggestedComposition,
    },
    {
      key: 'dosage',
      label: 'Dávkovanie (custom.dosage)',
      current: currentDosage,
      suggested: suggestedDosage,
    },
    {
      key: 'product_faq',
      label: 'FAQ (custom.product_faq)',
      current: currentFaq,
      suggested: suggestedFaq,
    },
  ];

  for (const item of metafieldSuggestions) {
    if (!item.current) {
      suggestions.push({
        field: item.label,
        currentValue: item.current,
        suggestedValue: item.suggested,
        reason: 'Metafield chýba na PDP — doplní sa do Shopify',
        type: 'metafield',
      });
    }
  }

  suggestions.push({
    field: 'Benefits Section',
    currentValue: null,
    suggestedValue: benefits.join('\n• '),
    reason: 'Zlepšuje konverziu a informovanosť zákazníkov',
    type: 'content',
  });

  const missingMetafields = metafieldSuggestions
    .filter((item) => !item.current)
    .map((item) => item.key);

  const applyPayload: OptimizationApplyPayload = {
    seo: {
      title: suggestedMetaTitle,
      description: suggestedMetaDescription,
    },
    metafields: metafieldSuggestions
      .filter((item) => !item.current)
      .map((item) => ({
        namespace: 'custom',
        key: item.key,
        type: item.key === 'product_faq' ? 'json' : 'multi_line_text_field',
        value: item.suggested,
      })),
  };

  return {
    productId: product.id,
    productHandle: product.handle,
    productTitle: product.title,
    suggestions,
    seo: {
      metaTitle: product.title,
      metaDescription: '',
      suggestedMetaTitle,
      suggestedMetaDescription,
    },
    missingMetafields,
    benefitsSection: {
      current: null,
      suggested: benefits.join('\n'),
    },
    applyPayload,
  };
}
