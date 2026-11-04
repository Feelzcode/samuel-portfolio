'use client';
import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { projectById } from '@/content/site';
import { prefersReduced } from '@/lib/hooks';
import { useUI } from './UIProvider';
import { Visual } from './Visual';
import { Arrow, Close, Next, Prev } from './icons';

export function ProjectModal() {
  const { projectId, closeProject, openAsk } = useUI();
  const dlg = useRef<HTMLDialogElement>(null);
  const [shown, setShown] = useState<string | null>(null); // keeps content during the close animation
  const [visible, setVisible] = useState(false);
  const [idx, setIdx] = useState(0);
  const [drag, setDrag] = useState<number | null>(null);
  const start = useRef<number | null>(null);

  const p = shown ? projectById(shown) : undefined;
  const count = p?.images?.length || 3;
  const go = (i: number) => setIdx(((i % count) + count) % count);

  // Open / close with enter and exit transitions.
  useEffect(() => {
    const d = dlg.current!;
    if (projectId) {
      setShown(projectId);
      setIdx(0);
      if (!d.open) d.showModal();
      d.scrollTop = 0;
      document.documentElement.classList.add('lock');
      requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
    } else if (d.open) {
      setVisible(false);
      const t = setTimeout(() => {
        d.close();
        document.documentElement.classList.remove('lock');
      }, prefersReduced() ? 0 : 380);
      return () => clearTimeout(t);
    }
  }, [projectId]);

  const down = (e: PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button')) return;
    start.current = e.clientX;
    setDrag(0);
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const move = (e: PointerEvent) => start.current !== null && setDrag(e.clientX - start.current);
  const up = () => {
    if (start.current === null) return;
    const dx = drag ?? 0;
    start.current = null;
    setDrag(null);
    go(Math.abs(dx) > 60 ? idx - Math.sign(dx) : idx);
  };

  const askTech = (t: string) => {
    closeProject();
    openAsk(`Where have you used ${t}?`);
  };

  // Desktop, framed desktop, then phone — or the project's own images in order.
  const order: (0 | 1 | 2)[] = p?.images?.length ? (Array.from({ length: count }, (_, k) => (k % 3) as 0 | 1 | 2) as (0 | 1 | 2)[]) : [1, 0, 2];

  return (
    <dialog
      ref={dlg}
      className={`modal${visible ? ' show' : ''}`}
      aria-labelledby="m-title"
      onCancel={(e) => {
        e.preventDefault();
        closeProject();
      }}
      onClick={(e) => e.target === dlg.current && closeProject()}
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft') go(idx - 1);
        if (e.key === 'ArrowRight') go(idx + 1);
      }}
    >
      <button className="icon-btn close" aria-label="Close" onClick={closeProject}><Close /></button>
      {p && (
        <>
          <div
            className={`slider${drag !== null ? ' drag' : ''}`}
            onPointerDown={down}
            onPointerMove={move}
            onPointerUp={up}
            onPointerCancel={up}
          >
            <div
              className="slides"
              style={{
                transform: `translateX(calc(${-idx * 100}% + ${drag ?? 0}px))`,
                transition: drag !== null ? 'none' : undefined,
              }}
            >
              {order.map((v, k) => (
                <div key={k}>
                  {p.images?.length ? <Visual p={{ ...p, images: [p.images[k]] }} v={0} /> : <Visual p={p} v={v} />}
                </div>
              ))}
            </div>
            <button className="icon-btn prev" aria-label="Previous image" onClick={() => go(idx - 1)}><Prev /></button>
            <button className="icon-btn next" aria-label="Next image" onClick={() => go(idx + 1)}><Next /></button>
            <div className="dots">
              {order.map((_, k) => (
                <button key={k} aria-label={`Image ${k + 1}`} aria-current={k === idx} onClick={() => go(k)} />
              ))}
            </div>
          </div>
          <div className="info">
            <div>
              <h3 id="m-title">{p.title}</h3>
              <div className="sub">{[p.tag, p.url && new URL(p.url).hostname.replace(/^www\./, '')].filter(Boolean).join(' · ')}</div>
            </div>
            {p.url ? (
              <a className="btn btn-primary" href={p.url} target="_blank" rel="noopener">Visit <Arrow /></a>
            ) : p.demo ? (
              <a className="btn btn-primary" href={p.demo} onClick={closeProject}>Watch it work <Arrow /></a>
            ) : null}
            <p>{p.text}</p>
            {!!(p.built?.length || p.planned?.length || p.stack?.length) && (
              <div className="extra">
                {!!p.built?.length && (
                  <div><h4>Built</h4><ul>{p.built.map((x) => <li key={x}>{x}</li>)}</ul></div>
                )}
                {!!p.planned?.length && (
                  <div className="planned"><h4>Planned</h4><ul>{p.planned.map((x) => <li key={x}>{x}</li>)}</ul></div>
                )}
                {!!p.stack?.length && (
                  <div>
                    <h4>Stack</h4>
                    <div className="chips">
                      {p.stack.map((t) => <button key={t} className="chip" onClick={() => askTech(t)}>{t}</button>)}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </dialog>
  );
}
