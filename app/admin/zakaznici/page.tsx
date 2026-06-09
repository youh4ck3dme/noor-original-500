import { GlassPanel } from '@/app/components/ds/GlassPanel';
import { SectionHeading } from '@/app/components/ds/SectionHeading';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Zákazníci | GrowMedica Admin',
};

export default function AdminCustomersPage() {
  return (
    <div className="space-y-8">
      <GlassPanel intensity="light" className="p-8">
        <SectionHeading
          title="Zákazníci"
          subtitle="Správa zákazníkov a ich dát"
          alignment="left"
        />
        <div className="bg-white rounded-gm-lg border border-gm-border p-8 text-center text-gm-text-muted">
          <p>Zoznam zákazníkov bude dostupný čoskoro.</p>
          <p className="text-sm mt-2 text-gm-text-muted/70">
            Synchronizácia so Shopify zákazníkmi.
          </p>
        </div>
      </GlassPanel>
    </div>
  );
}
