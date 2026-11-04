'use client';
/* eslint-disable @next/next/no-img-element -- needs a plain img for the parallax transform */
import { useEffect, useRef, type PointerEvent } from 'react';
import { SITE, STACK, PROJECTS } from '@/content/site';
import { useFinePointer, useReducedMotion } from '@/lib/hooks';
import { useUI } from './UIProvider';
import { Pin } from './icons';

const STATS: [number, string, string][] = [
  [SITE.years, '+', 'Years'],
  [PROJECTS.length, '', 'Projects'],
  [STACK.length, '', 'Tools'],
];
const prettyPhone = SITE.phone.replace(/^(\+234)(\d{3})(\d{3})(\d{4})$/, '$1 $2 $3 $4');

export function About() {
  const { openAsk, copyEmail } = useUI();
  const fine = useFinePointer();
  const reduce = useReducedMotion();
  const tilt = useRef<HTMLDivElement>(null);
  const portrait = useRef<HTMLDivElement>(null);
  const stats = useRef<HTMLDivElement>(null);
  const on = fine && !reduce;

  // 3D tilt with inner parallax and a cursor-following glare.
  const move = (e: PointerEvent<HTMLDivElement>) => {
    if (!on) return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
    const t = tilt.current!.style, p = portrait.current!.style;
    t.transition = 'transform .15s linear';
    t.transform = `rotateY(${x * 14}deg) rotateX(${-y * 12}deg)`;
    p.setProperty('--ix', `${-x * 18}px`);
    p.setProperty('--iy', `${-y * 18}px`);
    p.setProperty('--gx', `${(x + 0.5) * 100}%`);
    p.setProperty('--gy', `${(y + 0.5) * 100}%`);
  };
  const leave = () => {
    const t = tilt.current!.style, p = portrait.current!.style;
    t.transition = '';
    t.transform = '';
    p.setProperty('--ix', '0px');
    p.setProperty('--iy', '0px');
  };

  // Count the stats up once they come into view.
  useEffect(() => {
    const el = stats.current!;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        const d = matchMedia('(prefers-reduced-motion: reduce)').matches ? 1 : 1400;
        el.querySelectorAll<HTMLElement>('b[data-n]').forEach((b) => {
          const n = Number(b.dataset.n), s = b.dataset.s ?? '', t0 = performance.now();
          const step = (now: number) => {
            const k = Math.min((now - t0) / d, 1);
            b.textContent = Math.round(n * (1 - Math.pow(1 - k, 3))) + s;
            if (k < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        });
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section id="about">
      <div className="wrap about">
        <div
          className={`reveal${reduce ? ' reduce' : ''}`}
          style={on ? { perspective: '1200px' } : undefined}
          onPointerMove={move}
          onPointerLeave={on ? leave : undefined}
        >
          <div className="tilt" ref={tilt}>
            <div className="portrait" ref={portrait}>
              <img src={SITE.photo} alt={SITE.fullName} />
            </div>
            <div className="badge"><Pin /><span>{SITE.location}</span></div>
          </div>
        </div>
        <div>
          <h2 className="reveal" style={{ marginBottom: 32 }}>About</h2>
          <p className="lead reveal">{SITE.summary}</p>
          <div className="stats reveal" ref={stats}>
            {STATS.map(([n, s, l]) => (
              <div key={l}><b data-n={n} data-s={s}>{n}{s}</b><span>{l}</span></div>
            ))}
          </div>
          <dl className="skills reveal">
            {SITE.skills.map(([g, list]) => (
              <div key={g}>
                <dt>{g}</dt>
                <dd className="chips">
                  {list.map((t) => (
                    <button key={t} className="chip" onClick={() => openAsk(`Where have you used ${t}?`)}>{t}</button>
                  ))}
                </dd>
              </div>
            ))}
          </dl>
          <div className="reach reveal">
            <button className="btn btn-primary" onClick={copyEmail}>{SITE.email}</button>
            <a className="btn btn-ghost" href={`tel:${SITE.phone}`}>{prettyPhone}</a>
          </div>
        </div>
      </div>
    </section>
  );
}
