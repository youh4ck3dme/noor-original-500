import { SectionHeading } from '@/app/components/ds/SectionHeading';
import { StorePageShell } from '@/app/components/layout/StorePageShell';

export default function TermsPage() {
  return (
    <StorePageShell>
      <SectionHeading title="Obchodné podmienky" />
      <div className="max-w-3xl mx-auto prose text-gm-text-muted">
        <p>
          Objednávkou súhlasíte s týmito obchodnými podmienkami. Ceny sú uvedené vrátane DPH,
          pokiaľ nie je uvedené inak.
        </p>
        <p>
          Predaj doplnkov stravy ne nahrádza pestrú stravu ani lekársku starostlivosť.
          Odporúčame konzultáciu s odborníkom pred užívaním.
        </p>
      </div>
    </StorePageShell>
  );
}
