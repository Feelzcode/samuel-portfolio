'use client';
import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { SITE } from '@/content/site';
import { TOOLS, briefStep, greeting, route, startBrief, type BriefState, type Do, type Reply } from '@/lib/assistant';
import { prefersReduced } from '@/lib/hooks';
import { useUI } from './UIProvider';
import { Close, Send } from './icons';

type Msg = { id: number; role: 'user'; text: string } | { id: number; role: 'bot'; reply: Reply };

/** One assistant turn: tool calls run one by one, then the answer appears. */
function BotMessage({ reply, onAct, onChip, onProgress }: {
  reply: Reply;
  onAct: (d: Do) => void;
  onChip: (q: string) => void;
  onProgress: () => void;
}) {
  const tools = reply.tools ?? [];
  const [done, setDone] = useState(0); // tools finished
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const step = prefersReduced() ? 0 : 520;
    const timers = tools.map((_, i) => setTimeout(() => setDone(i + 1), step * (i + 1)));
    timers.push(setTimeout(() => setReady(true), tools.length ? step * tools.length : prefersReduced() ? 0 : 450));
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => onProgress(), [done, ready, onProgress]);

  return (
    <div className="msg bot">
      {tools.slice(0, Math.min(done + 1, tools.length)).map(([name, arg], i) => (
        <div key={i} className={`tool${i >= done ? ' run' : ''}`}>
          {name}({arg === undefined ? '' : JSON.stringify(arg)})
        </div>
      ))}
      {!tools.length && !ready && <div className="typing"><i /><i /><i /></div>}
      {ready && (
        <>
          {reply.html && <div dangerouslySetInnerHTML={{ __html: reply.html }} />}
          {!!reply.acts?.length && (
            <div className="acts">
              {reply.acts.map((a) => (
                <button key={a.label} className={`btn ${a.primary ? 'btn-primary' : 'btn-ghost'}`} onClick={() => onAct(a.do)}>
                  {a.label}
                </button>
              ))}
            </div>
          )}
          {!!reply.chips?.length && (
            <div className="chips">
              {reply.chips.map((q) => <button key={q} className="chip" onClick={() => onChip(q)}>{q}</button>)}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export function Ask() {
  const ui = useUI();
  const { askOpen, askRequest, closeAsk } = ui;
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [value, setValue] = useState('');
  const brief = useRef<BriefState | null>(null);
  const nextId = useRef(0);
  const log = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const handled = useRef(0);

  const bot = useCallback((reply: Reply) => setMsgs((a) => [...a, { id: ++nextId.current, role: 'bot', reply }]), []);
  const user = useCallback((text: string) => setMsgs((a) => [...a, { id: ++nextId.current, role: 'user', text }]), []);
  const scroll = useCallback(() => {
    if (log.current) log.current.scrollTop = log.current.scrollHeight;
  }, []);

  const beginBrief = useCallback((seed?: string) => {
    const r = startBrief(seed);
    brief.current = r.state;
    bot(r.reply);
  }, [bot]);

  const send = useCallback((text: string) => {
    user(text);
    if (brief.current) {
      const r = briefStep(brief.current, text);
      brief.current = r.state;
      bot(r.reply);
    } else bot(route(text));
  }, [user, bot]);

  const act = useCallback((d: Do) => {
    switch (d.type) {
      case 'openProject': return ui.openProject(d.id);
      case 'url': return void open(d.href, '_blank', 'noopener');
      case 'goto':
        if (innerWidth < 900) closeAsk();
        return document.querySelector(d.hash)?.scrollIntoView({ behavior: prefersReduced() ? 'auto' : 'smooth' });
      case 'copyEmail': return ui.copyEmail();
      case 'call': return void (location.href = 'tel:' + SITE.phone);
      case 'startBrief': return beginBrief(d.seed);
      case 'submitBrief':
        bot({ tools: [['submit_contact_request']], html: '<p>Your email app is opening with the brief. Nothing is sent until you press send there.</p>' });
        setTimeout(() => (location.href = TOOLS.submit_contact_request(d.brief)), prefersReduced() ? 0 : 600);
        return;
    }
  }, [ui, closeAsk, beginBrief, bot]);

  // Requests from elsewhere on the page (buttons, skill chips, "Start a project brief").
  useEffect(() => {
    if (!askRequest || askRequest.n === handled.current) return;
    handled.current = askRequest.n;
    if (!msgs.length) bot(greeting());
    if (askRequest.brief) beginBrief();
    else if (askRequest.q) send(askRequest.q);
    else if (matchMedia('(pointer: fine)').matches) setTimeout(() => input.current?.focus(), 250);
  }, [askRequest, msgs.length, bot, beginBrief, send]);

  // ⌘K / Ctrl+K toggles, Escape closes.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        askOpen ? closeAsk() : ui.openAsk();
      }
      if (e.key === 'Escape' && askOpen && !ui.projectId) closeAsk();
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, [askOpen, closeAsk, ui]);

  useEffect(() => scroll(), [msgs, scroll]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const v = value.trim();
    if (!v) return;
    setValue('');
    send(v);
  };

  return (
    <aside className={`ask${askOpen ? ' open' : ''}`} aria-label="Assistant" aria-hidden={!askOpen} inert={!askOpen}>
      <div className="ask-h">
        <b><i />Ask {SITE.short}</b>
        <button className="icon-btn" aria-label="Close assistant" onClick={closeAsk}><Close /></button>
      </div>
      <div className="log" ref={log} aria-live="polite">
        {msgs.map((m) =>
          m.role === 'user' ? (
            <div key={m.id} className="msg user">{m.text}</div>
          ) : (
            <BotMessage key={m.id} reply={m.reply} onAct={act} onChip={send} onProgress={scroll} />
          ),
        )}
      </div>
      <form className="ask-f" onSubmit={submit}>
        <input ref={input} value={value} onChange={(e) => setValue(e.target.value)} autoComplete="off" placeholder="Ask anything" aria-label="Message" />
        <button className="icon-btn" aria-label="Send"><Send /></button>
      </form>
    </aside>
  );
}
