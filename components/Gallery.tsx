'use client';
import { useEffect, useRef } from 'react';
import { PROJECTS } from '@/content/site';
import { useUI } from './UIProvider';
import { Visual } from './Visual';

/** Scroll-pinned horizontal gallery with per-slide parallax. */
export function Gallery() {
  const { openProject } = useUI();
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sec = section.current!, tr = track.current!;
    const slides = [...tr.children] as HTMLElement[];
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let dist = 0, ticking = false;

    const size = () => {
      dist = Math.max(0, tr.scrollWidth - innerWidth);
      sec.style.height = innerHeight + dist + 'px';
    };
    const update = () => {
      const p = dist ? Math.min(Math.max(-sec.getBoundingClientRect().top / dist, 0), 1) : 0;
      tr.style.transform = `translate3d(${-p * dist}px,0,0)`;
      if (!reduce)
        slides.forEach((s) => {
          const b = s.getBoundingClientRect();
          s.style.setProperty('--px', ((b.left + b.width / 2 - innerWidth / 2) / innerWidth) * -8 + '%');
        });
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        update();
        ticking = false;
      });
    };
    const onResize = () => {
      size();
      update();
    };
    onResize();
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', onResize);
    return () => {
      removeEventListener('scroll', onScroll);
      removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <section id="gallery" ref={section}>
      <div className="pin">
        <div className="wrap"><h2>Gallery</h2></div>
        <div className="track" ref={track}>
          {PROJECTS.map((p, i) => (
            <figure
              key={p.id}
              className="slide"
              role="button"
              tabIndex={0}
              aria-label={p.title}
              onClick={() => openProject(p.id)}
              onKeyDown={(e) => e.key === 'Enter' && openProject(p.id)}
            >
              <Visual p={p} v={1} />
              <figcaption><span>{String(i + 1).padStart(2, '0')}</span>{p.title}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
