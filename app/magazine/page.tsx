import { ReviewCard } from '@/app/components/ds/ReviewCard';
import { SectionHeading } from '@/app/components/ds/SectionHeading';
import { StorePageShell } from '@/app/components/layout/StorePageShell';

const articles = [
  {
    author: 'GrowMedica Tím',
    rating: 5,
    title: 'Ako podporiť imunitu na jar',
    body: 'Praktické tipy na výživu, spánok a doplnky pre každodennú pohodu.',
    date: '10. 6. 2026',
  },
  {
    author: 'PharmDr. Nováková',
    rating: 5,
    title: 'Lipozomálne vitamíny: prečo na nich záleží',
    body: 'Vysvetlenie biodostupnosti a výhod lipozomálnej formy vitamínu C.',
    date: '3. 6. 2026',
  },
];

export default function MagazinePage() {
  return (
    <StorePageShell>
      <SectionHeading
        title="Magazín"
        subtitle="Články, tipy a odborné rady zo sveta prírodnej výživy."
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {articles.map((article) => (
          <ReviewCard
            key={article.title}
            author={article.author}
            rating={article.rating}
            body={article.body}
            date={article.date}
            title={article.title}
          />
        ))}
      </div>
    </StorePageShell>
  );
}
