import { OrderTrackingForm } from '@/app/components/commerce/OrderTrackingForm';
import { SectionHeading } from '@/app/components/ds/SectionHeading';
import { StorePageShell } from '@/app/components/layout/StorePageShell';

export default function OrderTrackingPage() {
  return (
    <StorePageShell>
      <SectionHeading
        title="Sledovanie objednávky"
        subtitle="Zadajte číslo objednávky a e-mail pre kontrolu stavu zásielky."
      />
      <OrderTrackingForm />
    </StorePageShell>
  );
}
