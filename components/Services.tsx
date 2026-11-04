import type { CSSProperties } from 'react';
import { SITE } from '@/content/site';

export function Services() {
  return (
    <section id="services">
      <div className="wrap">
        <h2 className="reveal">Services</h2>
        <div className="services">
          {SITE.services.map((s, i) => (
            <div key={s.title} className="svc reveal" style={{ '--d': `${i * 0.08}s` } as CSSProperties}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinejoin="round"><path d={s.icon} /></svg>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </div>
          ))}
        </div>
        <ol className="process reveal">
          {SITE.process.map((s, i) => (
            <li key={s} style={{ '--i': i } as CSSProperties}>
              <span>{String(i + 1).padStart(2, '0')}</span>{s}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
