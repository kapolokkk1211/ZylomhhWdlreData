import Link from 'next/link';
import { LANGS, t } from '@/lib/ui';
import { DATA_DATE } from '@/lib/data';
import Nav from '@/components/Nav';
import ViewToggle from '@/components/ViewToggle';

export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }) {
  const { lang } = await params;
  const s = t(lang);
  return { title: { default: s.site.full, template: `%s · ${s.site.name}` }, description: s.site.tagline };
}

export default async function LangLayout({ children, params }) {
  const { lang } = await params;
  const s = t(lang);
  const other = lang === 'th' ? 'en' : 'th';

  return (
    <div data-lang={lang}>
      <header className="site-head">
        <div className="wrap">
          <Link href={`/${lang}`} className="brand">
            Star<span>Drift</span>
          </Link>
          <Nav lang={lang} labels={s.nav} />
          <ViewToggle labels={s.view} />
          <Link href={`/${other}`} className="lang-toggle" hrefLang={other}>
            {s.nav.switchLang}
          </Link>
        </div>
      </header>

      <main className="wrap page">{children}</main>

      <footer className="site">
        <div className="wrap">
          <p>{s.footer.source}</p>
          <p>{s.footer.match}</p>
          <p>
            {s.footer.updated} {DATA_DATE}
          </p>
        </div>
      </footer>
    </div>
  );
}
