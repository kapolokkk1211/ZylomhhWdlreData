'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const ITEMS = [
  ['', 'home'],
  ['/compounds', 'compounds'],
  ['/materials', 'materials'],
  ['/star', 'star'],
  ['/glossary', 'glossary'],
];

export default function Nav({ lang, labels }) {
  const path = usePathname();
  return (
    <nav className="main">
      {ITEMS.map(([suffix, key]) => {
        const href = `/${lang}${suffix}`;
        const current = path === href || (suffix === '' && path === `/${lang}`);
        return (
          <Link key={key} href={href} aria-current={current ? 'page' : undefined}>
            {labels[key]}
          </Link>
        );
      })}
    </nav>
  );
}
