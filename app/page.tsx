import { SiteHeader } from './components/layout/SiteHeader';

export default function Home() {
  return (
    <main>
      <SiteHeader collections={[]} />
      <div>
        <h1>Vitajte na stránke!</h1>
      </div>
    </main>
  );
}
