import { DEFAULT_LANG } from '@/lib/ui';

// Root route. vercel.json redirects / at the edge; this is the fallback.
export const metadata = { title: 'Star Drift' };

export default function Root() {
  const to = `/${DEFAULT_LANG}/compounds`;
  return (
    <>
      <meta httpEquiv="refresh" content={`0;url=${to}`} />
      <p style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
        <a href={to}>{to}</a>
      </p>
    </>
  );
}
