import './globals.css';

// Fonts are loaded with a plain stylesheet link rather than next/font so the build
// never needs network access to Google Fonts. Every stack has a real fallback.
const FONTS =
  'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Public+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans+Thai:wght@400;500;600&display=swap';

export const metadata = {
  metadataBase: new URL('https://zylomhh-wdlre-data.vercel.app'),
  title: {
    default: 'Star Drift — Wonderland Re: Star Ark data',
    template: '%s · Star Drift',
  },
  description:
    'Compounding recipes, material sources and a Chinese/English/Thai glossary for Wonderland Online Re: Star Ark, translated from Taiwan-server research.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="th" data-theme="light">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href={FONTS} />
      </head>
      <body>{children}</body>
    </html>
  );
}
