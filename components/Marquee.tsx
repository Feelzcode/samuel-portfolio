'use client';
import { STACK } from '@/content/site';
import { useUI } from './UIProvider';

/** Endless strip of skills; each one asks the assistant where it was used. */
export function Marquee() {
  const { openAsk } = useUI();
  return (
    <div className="marquee">
      <div className="marquee-track">
        {[0, 1].map((copy) =>
          STACK.map((t) => (
            <button
              key={copy + t}
              onClick={() => openAsk(`Where have you used ${t}?`)}
              aria-hidden={copy ? true : undefined}
              tabIndex={copy ? -1 : undefined}
            >
              {t}
            </button>
          )),
        )}
      </div>
    </div>
  );
}
