import { GlassPanel } from '@/app/components/ds/GlassPanel';
import { SectionHeading } from '@/app/components/ds/SectionHeading';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Objednávky | GrowMedica Admin',
};

export default function AdminOrdersPage() {
  return (
    <div className="space-y-8">
      <GlassPanel intensity="light" className="p-8">
        <SectionHeading
          title="Objednávky"
          subtitle="Správa a prehľad všetkých objednávok"
          alignment="left"
        />
        <div className="bg-white rounded-gm-lg border border-gm-border p-8 text-center text-gm-text-muted">
          <p>Prehľad objednávok bude dostupný čoskoro.</p>
          <p className="text-sm mt-2 text-gm-text-muted/70">
            Tutaj sa budú zobrazať objednávky zo Shopify.
          </p>
        </div>
      </GlassPanel>
    </div>
  );
}
