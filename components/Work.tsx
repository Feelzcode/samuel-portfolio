'use client';
import type { CSSProperties, PointerEvent } from 'react';
import { PROJECTS } from '@/content/site';
import { useFinePointer, useReducedMotion } from '@/lib/hooks';
import { useUI } from './UIProvider';
import { Visual } from './Visual';

export function Work() {
  const { openProject } = useUI();
  const fine = useFinePointer();
  const reduce = useReducedMotion();
  const tiltOn = fine && !reduce;

  const move = (e: PointerEvent<HTMLButtonElement>) => {
    if (!tiltOn) return;
    const c = e.currentTarget, r = c.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    c.style.setProperty('--mx', x * 100 + '%');
    c.style.setProperty('--my', y * 100 + '%');
    c.style.transform = `perspective(1000px) rotateX(${(0.5 - y) * 5}deg) rotateY(${(x - 0.5) * 7}deg)`;
  };

  return (
    <section id="work">
      <div className="wrap">
        <h2 className="reveal">Work</h2>
        <div className="grid">
          {PROJECTS.map((p, i) => {
            const wide = i === 0 || (i === PROJECTS.length - 1 && i % 2 === 1);
            return (
              <button
                key={p.id}
                className={`card reveal${wide ? ' wide' : ''}`}
                style={{ '--d': `${(i % 2) * 0.08}s` } as CSSProperties}
                onClick={() => openProject(p.id)}
                onPointerMove={move}
                onPointerLeave={(e) => (e.currentTarget.style.transform = '')}
              >
                <div className="thumb"><Visual p={p} v={0} /></div>
                <div className="meta">{p.title}<span>{p.tag}</span></div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
