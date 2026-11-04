'use client';
import type { CSSProperties } from 'react';
import { SITE } from '@/content/site';
import { useUI } from './UIProvider';
import { Arrow } from './icons';

export function Contact() {
  const { copyEmail, openBrief } = useUI();
  return (
    <section className="contact" id="contact">
      <div className="wrap">
        <button className="mail reveal" onClick={copyEmail}>{SITE.email}</button>
        <div className="socials reveal" style={{ '--d': '.1s' } as CSSProperties}>
          <button className="btn btn-primary" onClick={openBrief}>Start a project brief <Arrow /></button>
          {SITE.socials.map(([n, u]) => (
            <a key={n} className="btn btn-ghost" href={u} target="_blank" rel="noopener">{n}</a>
          ))}
          <a className="btn btn-ghost" href={`tel:${SITE.phone}`}>Call</a>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer>
      <div className="wrap">
        <span>© {new Date().getFullYear()} {SITE.name}</span>
        <a href="#top">Back to top</a>
      </div>
    </footer>
  );
}
