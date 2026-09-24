'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

/* Ten flat tabs had stopped being a menu and become a list. The grouping is KK's: the three
   pages you open every session stay flat, and the rest live under the heading a player would
   look for them under. A group with one child still renders as a group — more are coming, and
   a menu that changes shape as it fills is harder to learn than one that does not. */
const ITEMS = [
  { key: 'compounds', href: '/compounds' },
  { key: 'materials', href: '/materials' },
  { key: 'simulator', href: '/simulator' },
  { key: 'quests', href: '/quests' },
  { group: 'events', children: [{ key: 'recycle', href: '/recycle' }] },
  {
    group: 'play',
    children: [
      { key: 'builds', href: '/builds' },
      { key: 'skills', href: '/skills' },
      { key: 'companions', href: '/companions' },
    ],
  },
  { group: 'techniques', children: [{ key: 'rankclimb', href: '/rank-climbing' }] },
  { key: 'feedback', href: '/feedback' },
  { key: 'about', href: '/about' },
];

export default function Nav({ lang, labels }) {
  const path = usePathname() || '';
  const [open, setOpen] = useState(null);
  const ref = useRef(null);

  /* A menu left hanging open after you have navigated away reads as broken, so it closes on
     any click outside it and on Escape, and on every path change. */
  useEffect(() => setOpen(null), [path]);
  useEffect(() => {
    if (!open) return undefined;
    const away = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(null);
    };
    const esc = (e) => {
      if (e.key === 'Escape') setOpen(null);
    };
    document.addEventListener('pointerdown', away);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('pointerdown', away);
      document.removeEventListener('keydown', esc);
    };
  }, [open]);

  const isCurrent = (suffix) => {
    const href = `/${lang}${suffix}`;
    return path === href || path.startsWith(href + '/') || (suffix === '/compounds' && path === `/${lang}`);
  };

  return (
    <nav className="main" ref={ref}>
      {ITEMS.map((item) => {
        if (item.group) {
          const active = item.children.some((c) => isCurrent(c.href));
          const isOpen = open === item.group;
          return (
            <span key={item.group} className={`nav-group${isOpen ? ' open' : ''}`}>
              <button
                type="button"
                aria-expanded={isOpen}
                aria-current={active ? 'page' : undefined}
                onClick={() => setOpen(isOpen ? null : item.group)}
              >
                {labels.groups[item.group]}
                <i className="nav-caret" aria-hidden="true" />
              </button>
              <span className="nav-menu" role="menu" hidden={!isOpen}>
                {item.children.map((c) => (
                  <Link
                    key={c.key}
                    role="menuitem"
                    href={`/${lang}${c.href}`}
                    aria-current={isCurrent(c.href) ? 'page' : undefined}
                  >
                    {labels[c.key]}
                  </Link>
                ))}
              </span>
            </span>
          );
        }
        return (
          <Link
            key={item.key}
            href={`/${lang}${item.href}`}
            aria-current={isCurrent(item.href) ? 'page' : undefined}
          >
            {labels[item.key]}
          </Link>
        );
      })}
    </nav>
  );
}
