import { ContactForm } from '@/app/components/commerce/ContactForm';
import { SectionHeading } from '@/app/components/ds/SectionHeading';
import { StorePageShell } from '@/app/components/layout/StorePageShell';

export default function ContactPage() {
  return (
    <StorePageShell>
      <SectionHeading
        title="Kontakt"
        subtitle="Máte otázku? Napíšte nám a náš tím sa vám ozve."
      />
      <ContactForm />
    </StorePageShell>
  );
}
