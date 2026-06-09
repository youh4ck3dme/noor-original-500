import { GlassPanel } from '@/app/components/ds/GlassPanel';
import { SectionHeading } from '@/app/components/ds/SectionHeading';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Analytika | GrowMedica Admin',
};

export default function AdminAnalyticsPage() {
  return (
    <div className="space-y-8">
      <GlassPanel intensity="light" className="p-8">
        <SectionHeading
          title="Analytika"
          subtitle="Prehľad predajov, návštevnosti a výkonnosti"
          alignment="left"
        />
        <div className="bg-white rounded-gm-lg border border-gm-border p-8 text-center text-gm-text-muted">
          <p>Analytické dashboardy budú dostupné čoskoro.</p>
          <p className="text-sm mt-2 text-gm-text-muted/70">
            Integrovane s Google Analytics a Shopify.
          </p>
        </div>
      </GlassPanel>
    </div>
  );
}
