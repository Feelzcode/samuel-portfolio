'use client';
import { useRef, useState, type CSSProperties } from 'react';
import { LAB } from '@/content/site';
import { wait } from '@/lib/hooks';
import { Arrow } from './icons';

type Status = '' | 'active' | 'done' | 'skip';

/** Creator Concierge workflow demo: understand → inspect → prepare → approve → execute → verify. */
export function Lab() {
  const [status, setStatus] = useState<Status[]>(LAB.steps.map(() => ''));
  const [codes, setCodes] = useState(LAB.steps.map((s) => s.code));
  const [lit, setLit] = useState<number[]>([]);
  const [gate, setGate] = useState(false);
  const [running, setRunning] = useState(false);
  const [ran, setRan] = useState(false);
  const answer = useRef<((ok: boolean) => void) | null>(null);

  const set = (i: number, s: Status) => setStatus((a) => a.map((x, k) => (k === i ? s : x)));

  async function run() {
    setRunning(true);
    setCodes(LAB.steps.map((s) => s.code));
    setStatus(LAB.steps.map(() => ''));
    for (let i = 0; i < LAB.steps.length; i++) {
      const s = LAB.steps[i];
      set(i, 'active');
      setLit(s.on);
      if (s.gate) {
        setGate(true);
        const ok = await new Promise<boolean>((r) => (answer.current = r));
        answer.current = null;
        setGate(false);
        setCodes((c) => c.map((x, k) => (k === i ? (ok ? 'approved by creator' : 'cancelled · no changes made') : x)));
        set(i, 'done');
        if (!ok) {
          setStatus((a) => a.map((x, k) => (k > i ? 'skip' : x)));
          break;
        }
        continue;
      }
      await wait(1100);
      set(i, 'done');
    }
    setLit([]);
    setRunning(false);
    setRan(true);
  }

  return (
    <section id="lab">
      <div className="wrap">
        <h2 className="reveal">AI Lab</h2>
        <div className="lab">
          <div className="panel reveal">
            <div className="panel-h"><h3>Creator Concierge</h3><span className="tag">Simulated</span></div>
            <div className="req">{LAB.request}</div>
            <ol className="steps">
              {LAB.steps.map((s, i) => (
                <li key={s.t} className={status[i]}>
                  <div>
                    {s.t}
                    <code>{codes[i]}</code>
                    {s.gate && (
                      <div className={`approve${gate ? ' on' : ''}`}>
                        <button className="btn btn-primary" onClick={() => answer.current?.(true)}>Approve</button>
                        <button className="btn btn-ghost" onClick={() => answer.current?.(false)}>Cancel</button>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ol>
            <div className="lab-foot">
              <button className="btn btn-primary" onClick={run} disabled={running}>{ran ? 'Run again' : 'Run'} <Arrow /></button>
            </div>
          </div>
          <div className="panel reveal" style={{ '--d': '.08s' } as CSSProperties}>
            <div className="panel-h"><h3>Architecture</h3></div>
            <ul className="arch">
              {LAB.arch.map(([k, n], i) => (
                <li key={k} className={lit.includes(i) ? 'on' : ''}><b>{k}</b>{n}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
