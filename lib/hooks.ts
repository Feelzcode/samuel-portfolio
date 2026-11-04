'use client';
import { useEffect, useState } from 'react';

function useMedia(query: string) {
  const [match, setMatch] = useState(false);
  useEffect(() => {
    const m = matchMedia(query);
    setMatch(m.matches);
    const on = () => setMatch(m.matches);
    m.addEventListener('change', on);
    return () => m.removeEventListener('change', on);
  }, [query]);
  return match;
}

export const useReducedMotion = () => useMedia('(prefers-reduced-motion: reduce)');
export const useFinePointer = () => useMedia('(pointer: fine)');

export const prefersReduced = () => typeof window !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
export const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, prefersReduced() ? 0 : ms));
