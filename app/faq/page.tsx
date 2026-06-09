import { Accordion } from '@/app/components/ds/Accordion';
import { SectionHeading } from '@/app/components/ds/SectionHeading';
import { StorePageShell } from '@/app/components/layout/StorePageShell';

const faqItems = [
  {
    id: 'shipping',
    title: 'Ako dlho trvá doručenie?',
    content:
      'Štandardné doručenie trvá 2–4 pracovné dni. Pri objednávkach nad 50 € je doprava zadarmo.',
  },
  {
    id: 'returns',
    title: 'Môžem vrátiť produkt?',
    content:
      'Áno, neotvorené produkty môžete vrátiť do 14 dní od doručenia. Viac v sekcii Doprava a vrátenie.',
  },
  {
    id: 'dosage',
    title: 'Ako užívať doplnky stravy?',
    content:
      'Vždy sa riaďte pokynmi na obale produktu alebo konzultujte s lekárom či farmaceutom.',
  },
  {
    id: 'payment',
    title: 'Aké platobné metódy akceptujete?',
    content:
      'Platbu zabezpečuje Shopify checkout — karta, Apple Pay, Google Pay a ďalšie metódy podľa dostupnosti.',
  },
];

export default function FaqPage() {
  return (
    <StorePageShell>
      <SectionHeading
        title="Často kladené otázky"
        subtitle="Odpovede na najčastejšie otázky o objednávkach, doprave a produktoch."
      />
      <div className="max-w-3xl mx-auto">
        <Accordion items={faqItems} defaultOpen={['shipping']} />
      </div>
    </StorePageShell>
  );
}
