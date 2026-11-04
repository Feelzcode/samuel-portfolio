'use client';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { SITE } from '@/content/site';
import { prefersReduced } from '@/lib/hooks';

export type AskRequest = { n: number; q?: string; brief?: boolean };

type UI = {
  projectId: string | null;
  openProject: (id: string) => void;
  closeProject: () => void;
  askOpen: boolean;
  askRequest: AskRequest | null;
  openAsk: (q?: string) => void;
  openBrief: () => void;
  closeAsk: () => void;
  toast: (msg: string) => void;
  copyEmail: () => void;
};

const Ctx = createContext<UI | null>(null);
export const useUI = () => {
  const ui = useContext(Ctx);
  if (!ui) throw new Error('useUI must be used inside <UIProvider>');
  return ui;
};

export function UIProvider({ children }: { children: ReactNode }) {
  const [projectId, setProjectId] = useState<string | null>(null);
  const [askOpen, setAskOpen] = useState(false);
  const [askRequest, setAskRequest] = useState<AskRequest | null>(null);
  const [toastMsg, setToastMsg] = useState('');
  const [toastOn, setToastOn] = useState(false);
  const counter = useRef(0);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const toast = useCallback((msg: string) => {
    setToastMsg(msg);
    setToastOn(true);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastOn(false), 1800);
  }, []);

  const copyEmail = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(SITE.email);
      toast('Email copied');
    } catch {
      location.href = 'mailto:' + SITE.email;
    }
  }, [toast]);

  const openAsk = useCallback((q?: string) => {
    setAskOpen(true);
    setAskRequest({ n: ++counter.current, q });
  }, []);
  const openBrief = useCallback(() => {
    setAskOpen(true);
    setAskRequest({ n: ++counter.current, brief: true });
  }, []);

  const value = useMemo<UI>(
    () => ({
      projectId,
      openProject: setProjectId,
      closeProject: () => setProjectId(null),
      askOpen,
      askRequest,
      openAsk,
      openBrief,
      closeAsk: () => setAskOpen(false),
      toast,
      copyEmail,
    }),
    [projectId, askOpen, askRequest, openAsk, openBrief, toast, copyEmail],
  );

  /* Intro + scroll reveal */
  useEffect(() => {
    const ready = () => document.body.classList.add('ready');
    const t = setTimeout(ready, prefersReduced() ? 0 : 700);
    const io = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' },
    );
    document.querySelectorAll('.reveal').forEach((el) => io.observe(el));
    return () => {
      clearTimeout(t);
      io.disconnect();
    };
  }, []);

  return (
    <Ctx.Provider value={value}>
      {children}
      <div className={`toast${toastOn ? ' on' : ''}`} role="status">
        {toastMsg}
      </div>
    </Ctx.Provider>
  );
}
