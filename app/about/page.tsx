import { GlassPanel } from '@/app/components/ds/GlassPanel';
import { SectionHeading } from '@/app/components/ds/SectionHeading';
import { StorePageShell } from '@/app/components/layout/StorePageShell';

export default function AboutPage() {
  return (
    <StorePageShell>
      <SectionHeading
        title="O GrowMedica"
        subtitle="Prémiová výživa a prírodné doplnky pre vaše zdravie a vitalitu."
      />
      <GlassPanel intensity="light" className="max-w-3xl mx-auto p-8 md:p-12">
        <p className="text-gm-text-muted leading-relaxed mb-4">
          GrowMedica prináša overené produkty Energy s dôrazom na kvalitu, transparentnosť
          a odborné poradenstvo. Náš tím farmaceutov a nutričných špecialistov vám pomôže
          vybrať správne riešenie pre imunitu, energiu a celkovú pohodu.
        </p>
        <p className="text-gm-text-muted leading-relaxed">
          Veríme v prírodné zloženie, overené postupy a dlhodobú starostlivosť o zákazníkov
          na slovenskom trhu.
        </p>
      </GlassPanel>
    </StorePageShell>
  );
}
