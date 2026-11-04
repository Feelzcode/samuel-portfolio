'use client';
import { SITE } from '@/content/site';
import { useUI } from './UIProvider';
import { Spark } from './icons';

export function AskButton() {
  const { openAsk } = useUI();
  return (
    <button className="btn btn-beam" onClick={() => openAsk()}>
      <Spark />
      <span>Ask {SITE.short}</span>
    </button>
  );
}
