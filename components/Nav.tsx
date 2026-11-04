'use client';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { SITE } from '@/content/site';
import { AskButton } from './AskButton';

const LINKS = [
  ['#work', 'Work'],
  ['#lab', 'AI Lab'],
  ['#services', 'Services'],
  ['#about', 'About'],
  ['#contact', 'Contact'],
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [pill, setPill] = useState<CSSProperties>({ opacity: 0 });
  const raf = useRef(0);

  useEffect(() => {
    const on = () => {
      cancelAnimationFrame(raf.current);
      raf.current = requestAnimationFrame(() => setScrolled(scrollY > 10));
    };
    on();
    addEventListener('scroll', on, { passive: true });
    return () => removeEventListener('scroll', on);
  }, []);

  return (
    <header className={`nav${scrolled ? ' scrolled' : ''}`}>
      <div className="wrap">
        <a className="logo" href="#top">{SITE.name}</a>
        <nav className="links" onMouseLeave={() => setPill((p) => ({ ...p, opacity: 0 }))}>
          <span className="pill" style={pill} />
          {LINKS.map(([href, label]) => (
            <a
              key={href}
              href={href}
              onMouseEnter={(e) => setPill({ left: e.currentTarget.offsetLeft, width: e.currentTarget.offsetWidth, opacity: 1 })}
            >
              {label}
            </a>
          ))}
        </nav>
        <AskButton />
      </div>
    </header>
  );
}
