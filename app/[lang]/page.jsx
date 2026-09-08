// /th and /en: the database is the front page. vercel.json redirects these at the
// edge; this is the static-export fallback for any host that doesn't read it.
export default async function LangRoot({ params }) {
  const { lang } = await params;
  const to = `/${lang}/compounds`;
  return (
    <>
      <meta httpEquiv="refresh" content={`0;url=${to}`} />
      <p><a href={to}>{to}</a></p>
    </>
  );
}
