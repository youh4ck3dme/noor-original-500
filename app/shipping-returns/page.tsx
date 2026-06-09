import { Accordion } from '@/app/components/ds/Accordion';
import { SectionHeading } from '@/app/components/ds/SectionHeading';
import { StorePageShell } from '@/app/components/layout/StorePageShell';

const items = [
  {
    id: 'delivery',
    title: 'Doprava',
    content: 'Štandardné doručenie 2–4 pracovné dni. Doprava zadarmo pri objednávke nad 50 €.',
  },
  {
    id: 'returns',
    title: 'Vrátenie tovaru',
    content:
      'Neotvorené produkty môžete vrátiť do 14 dní. Kontaktujte nás cez formulár na stránke Kontakt.',
  },
  {
    id: 'damaged',
    title: 'Poškodený tovar',
    content: 'Pri poškodení pri preprave nás kontaktujte do 48 hodín s fotodokumentáciou.',
  },
];

export default function ShippingReturnsPage() {
  return (
    <StorePageShell>
      <SectionHeading title="Doprava a vrátenie" />
      <div className="max-w-3xl mx-auto">
        <Accordion items={items} defaultOpen={['delivery']} />
      </div>
    </StorePageShell>
  );
}
