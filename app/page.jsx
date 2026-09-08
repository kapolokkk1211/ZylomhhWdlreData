import { DEFAULT_LANG } from '@/lib/ui';

// Root route. The real redirect is in vercel.json (/ -> /th); this page is the
// fallback for any host that doesn't read vercel.json, and for the static export
// which cannot run redirect() at request time.
export const metadata = { title: 'Star Drift' };

export default function Root() {
  const to = `/${DEFAULT_LANG}`;
  return (
    <>
      <meta httpEquiv="refresh" content={`0;url=${to}`} />
      <p style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
        <a href={to}>{to}</a>
      </p>
    </>
  );
}
