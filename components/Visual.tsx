/* eslint-disable @next/next/no-img-element -- external screenshot service, sized by CSS */
'use client';
import type { CSSProperties, SyntheticEvent } from 'react';
import type { Project } from '@/content/site';

type V = 0 | 1 | 2; // 0 = framed desktop, 1 = full-bleed desktop, 2 = phone

/** Live screenshots via WordPress mShots (free, no key). */
const shot = (url: string, mobile = false) =>
  'https://s.wordpress.com/mshots/v1/' + encodeURIComponent(url) +
  (mobile ? '?w=390&h=844&vpw=390&vph=844' : '?w=1600&h=1000&vpw=1440&vph=900');

/** mShots may return a "generating" placeholder first — retry until the real size arrives. */
function retryEl(el: HTMLImageElement) {
  const w = Number(el.dataset.w), n = Number(el.dataset.n || 0);
  if (!w || el.naturalWidth === w || n > 6) return;
  el.dataset.n = String(n + 1);
  setTimeout(() => (el.src = el.src.replace(/&r=\d+$/, '') + '&r=' + (n + 1)), 2500);
}
const retry = (e: SyntheticEvent<HTMLImageElement>) => retryEl(e.currentTarget);
// Catches images that finished loading before React hydrated.
const checkLoaded = (el: HTMLImageElement | null) => {
  if (el?.complete && el.naturalWidth && !el.dataset.n) retryEl(el);
};

const Img = ({ src, w = 0, className }: { src: string; w?: number; className?: string }) => (
  <img ref={w ? checkLoaded : undefined} src={src} alt="" decoding="async" data-w={w} onLoad={w ? retry : undefined} className={className} />
);

const hue = (h: number) => ({ '--h': h }) as CSSProperties;

function Art({ h, v }: { h: number; v: V }) {
  return (
    <div className="art" style={hue(h)}>
      {v === 0 && <div className="m-orb" />}
      {v === 1 && (
        <div className="m-win">
          <i className="m-bar" />
          <div className="m-body">
            <div className="m-side">{Array.from({ length: 6 }, (_, i) => <b key={i} />)}</div>
            <div className="m-main">
              <div className="m-chart" />
              <div className="m-row"><b /><b /><b /></div>
            </div>
          </div>
        </div>
      )}
      {v === 2 && (
        <div className="m-phones">
          {['', ' up', ''].map((c, i) => (
            <div key={i} className={'m-phone' + c}><b /><b /><b /></div>
          ))}
        </div>
      )}
    </div>
  );
}

export function Visual({ p, v }: { p: Project; v: V }) {
  if (p.images?.length)
    return (
      <div className="art" style={hue(p.hue)}>
        <Img className="shot" src={p.images[v % p.images.length]} />
      </div>
    );
  if (!p.url) return <Art h={p.hue} v={v} />;
  if (v === 0)
    return (
      <div className="art fr-desk" style={hue(p.hue)}>
        <div className="m-win"><i className="m-bar" /><Img src={shot(p.url)} w={1600} /></div>
      </div>
    );
  if (v === 1)
    return (
      <div className="art" style={hue(p.hue)}>
        <Img className="shot" src={shot(p.url)} w={1600} />
      </div>
    );
  return (
    <div className="art fr-phone" style={hue(p.hue)}>
      <div className="phone"><Img src={shot(p.url, true)} w={390} /></div>
    </div>
  );
}
