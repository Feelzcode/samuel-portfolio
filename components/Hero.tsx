'use client';
import { useEffect, useState, type CSSProperties } from 'react';
import { SITE } from '@/content/site';
import { AskButton } from './AskButton';
import { HeroCanvas } from './HeroCanvas';
import { Arrow } from './icons';

export function Hero() {
  const [fallback, setFallback] = useState(false);

  // Fade the 3D scene out as the hero scrolls away.
  useEffect(() => {
    const on = () => document.documentElement.style.setProperty('--fade', String(Math.max(0, 1 - (scrollY / innerHeight) * 1.1)));
    on();
    addEventListener('scroll', on, { passive: true });
    return () => removeEventListener('scroll', on);
  }, []);

  return (
    <section className={`hero${fallback ? ' fallback' : ''}`} id="top">
      <HeroCanvas onFallback={() => setFallback(true)} />
      <div className="wrap">
        <span className={`avail${SITE.available ? '' : ' off'}`}>
          <i />
          <span>{SITE.available ? 'Available for new projects' : 'Not taking projects'}</span>
        </span>
        <h1 aria-label={SITE.name}>
          {[...SITE.name].map((c, i) => (
            <span key={i} aria-hidden="true" style={{ '--i': i } as CSSProperties}>
              {c === ' ' ? ' ' : c}
            </span>
          ))}
        </h1>
        <p>{SITE.role}</p>
        <div className="ctas">
          <a className="btn btn-primary" href="#work">View work <Arrow /></a>
          <AskButton />
        </div>
      </div>
    </section>
  );
}
