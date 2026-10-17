import type { Touch } from '../../core';

/** Layer 2 · 觸碰＋情緒 — five gestures, five gentle ways of coping. */
export const touches: Touch[] = [
  {
    id: 'hop',
    name: { en: 'Hop', zh: '跳跳' },
    gesture: { en: 'Tap', zh: '輕點' },
    trait: { en: 'bounces back from every push and keeps a kind distance', zh: '被推就彈回來，保持溫柔的距離' },
  },
  {
    id: 'nestle',
    name: { en: 'Nestle', zh: '窩窩' },
    gesture: { en: 'Long press', zh: '長按' },
    trait: { en: 'softens to hold other people’s feelings first', zh: '先抱住別人的情緒，再照顧自己' },
  },
  {
    id: 'drift',
    name: { en: 'Drift', zh: '飄飄' },
    gesture: { en: 'Drag up/down', zh: '上下拉' },
    trait: { en: 'lets its halves float apart to look around, light and curious', zh: '上下分開飄一會兒，輕輕地好奇張望' },
  },
  {
    id: 'tremble',
    name: { en: 'Tremble', zh: '抖抖' },
    gesture: { en: 'Rapid taps', zh: '連續點' },
    trait: { en: 'looks calm outside while thoughts quiver inside', zh: '外表平靜，心裡想很多' },
  },
  {
    id: 'whirl',
    name: { en: 'Whirl', zh: '繞繞' },
    gesture: { en: 'Draw a circle', zh: '畫圈' },
    trait: { en: 'spins worries into a slow, steady rhythm', zh: '把煩惱轉成慢慢的、穩穩的節奏' },
  },
];
