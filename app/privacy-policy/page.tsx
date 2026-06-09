import { SectionHeading } from '@/app/components/ds/SectionHeading';
import { StorePageShell } from '@/app/components/layout/StorePageShell';

export default function PrivacyPolicyPage() {
  return (
    <StorePageShell>
      <SectionHeading title="Ochrana osobných údajov" />
      <div className="max-w-3xl mx-auto prose text-gm-text-muted">
        <p>
          Spracúvame osobné údaje v súlade s GDPR za účelom vybavenia objednávok,
          zákazníckej podpory a marketingovej komunikácie so súhlasom používateľa.
        </p>
        <p>
          Údaje uchovávame po dobu nevyhnutnú na plnenie zmluvy a zákonných povinností.
          Máte právo na prístup, opravu a vymazanie údajov.
        </p>
      </div>
    </StorePageShell>
  );
}
