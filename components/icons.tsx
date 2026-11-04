const s = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.6 } as const;

export const Arrow = () => (
  <svg viewBox="0 0 16 16" {...s}><path d="M3 8h10M9 4l4 4-4 4" /></svg>
);
export const Close = () => (
  <svg viewBox="0 0 16 16" {...s}><path d="M4 4l8 8M12 4l-8 8" /></svg>
);
export const Prev = () => (
  <svg viewBox="0 0 16 16" {...s}><path d="M10 3L5 8l5 5" /></svg>
);
export const Next = () => (
  <svg viewBox="0 0 16 16" {...s}><path d="M6 3l5 5-5 5" /></svg>
);
export const Send = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.8}><path d="M8 13V3M3.5 7.5L8 3l4.5 4.5" /></svg>
);
export const Spark = () => (
  <svg className="spark" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0l1.8 6.2L16 8l-6.2 1.8L8 16l-1.8-6.2L0 8l6.2-1.8z" /></svg>
);
export const Pin = () => (
  <svg viewBox="0 0 16 16" {...s}><path d="M8 15s5-4.6 5-8.5A5 5 0 0 0 3 6.5C3 10.4 8 15 8 15z" /><circle cx="8" cy="6.5" r="1.8" /></svg>
);
