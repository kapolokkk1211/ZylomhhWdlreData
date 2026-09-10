'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const ITEMS = [
  ['/compounds', 'compounds'],
  ['/materials', 'materials'],
  ['/simulator', 'simulator'],
  ['/quests', 'quests'],
  ['/feedback', 'feedback'],
  ['/about', 'about'],
];

export default function Nav({ lang, labels }) {
  const path = usePathname() || '';
  return (
    <nav className="main">
      {ITEMS.map(([suffix, key]) => {
        const href = `/${lang}${suffix}`;
        const current = path === href || path.startsWith(href + '/') || (suffix === '/compounds' && path === `/${lang}`);
        return (
          <Link key={key} href={href} aria-current={current ? 'page' : undefined}>
            {labels[key]}
          </Link>
        );
      })}
    </nav>
  );
}
