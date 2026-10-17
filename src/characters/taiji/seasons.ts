import type { Season } from '../../core';

/** Layer 3 · 時間 — Summer is full colour; Spring paler, Autumn warmer & muted, Winter greyer. */
export const seasons: Season[] = [
  {
    id: 'spring',
    name: { en: 'Spring', zh: '春' },
    note: { en: 'feels a little lighter', zh: '輕盈一點' },
    tint: 'rgba(255,232,240,.16)',
    filter: 'saturate(.6) brightness(1.1)',
  },
  {
    id: 'summer',
    name: { en: 'Summer', zh: '夏' },
    note: { en: 'soaks up a little more', zh: '多吸飽一點' },
    tint: 'rgba(0,0,0,0)',
    filter: 'none',
  },
  {
    id: 'autumn',
    name: { en: 'Autumn', zh: '秋' },
    note: { en: 'goes a little quieter', zh: '安靜一點' },
    tint: 'rgba(196,120,50,.14)',
    filter: 'sepia(.35) saturate(.8) brightness(.93)',
  },
  {
    id: 'winter',
    name: { en: 'Winter', zh: '冬' },
    note: { en: 'holds on a little tighter', zh: '抱緊一點' },
    tint: 'rgba(205,222,245,.3)',
    filter: 'saturate(.3) brightness(1.02) contrast(.92)',
  },
];
