import type { CharacterDefinition, Shape } from '../../core';
import { hidden } from './hidden';
import { items } from './items';
import { places } from './places';
import { seasons } from './seasons';
import { touches } from './touches';

/** Body proportions per form. Keys: `base`, each touch id, and hidden-form shapes. */
const shapes: Record<string, Shape> = {
  base: { width: 220, height: 220, gap: 0, animation: 'tj-breathe 4s ease-in-out infinite', eyeWidth: 14, eyeHeight: 14 },
  hop: { width: 214, height: 200, gap: 0, animation: 'tj-hop 1s cubic-bezier(.3,0,.3,1) infinite', eyeWidth: 14, eyeHeight: 16 },
  nestle: { width: 272, height: 188, gap: 0, animation: 'tj-breathe 2.6s ease-in-out infinite', eyeWidth: 18, eyeHeight: 4 },
  drift: { width: 200, height: 216, gap: 44, animation: 'tj-float 3s ease-in-out infinite', eyeWidth: 14, eyeHeight: 14 },
  tremble: { width: 196, height: 196, gap: 0, animation: 'tj-jitter .18s linear infinite', eyeWidth: 9, eyeHeight: 9 },
  whirl: { width: 220, height: 220, gap: 0, animation: 'tj-spin 5s linear infinite', eyeWidth: 14, eyeHeight: 14 },
  spin: { width: 250, height: 250, gap: 0, animation: 'tj-spin 9s linear infinite', eyeWidth: 16, eyeHeight: 4 },
  flow: { width: 230, height: 210, gap: 26, offset: 14, animation: 'tj-sway 3.2s ease-in-out infinite', eyeWidth: 15, eyeHeight: 12 },
  split: { width: 210, height: 210, gap: 40, offset: 26, animation: 'tj-float 4s ease-in-out infinite', eyeWidth: 16, eyeHeight: 4 },
};

/**
 * TaiJi 台吉 — Cloudie 綿雲 above the mountain and Spongie 海綿 below the coast,
 * holding each other in one circle. What never changes: the seam and two
 * eyes, one in each half.
 */
export const taiji: CharacterDefinition = {
  id: 'taiji',
  name: { en: 'TaiJi', zh: '台吉' },
  tagline: {
    en: 'Cloudie above the mountain, Spongie below the coast — one circle.',
    zh: '山上的綿雲、海岸下的海綿，合成一個圓。',
  },
  places,
  touches,
  seasons,
  items,
  hidden,
  shapes,
  rules: { maxCarried: 2, idleSeconds: 12, historyLength: 3 },
  defaults: { place: 'ridges', season: 'summer' },
  describe: {
    formName: (p, t) => ({ en: `${p.prefix.en} ${t.name.en}`, zh: `${p.prefix.zh}${t.name.zh}` }),
    formLine: (p, t) => ({ en: `A ${p.material.en} TaiJi that ${t.trait.en}.`, zh: `${p.material.zh}的台吉，${t.trait.zh}。` }),
    baseLine: (p) => ({
      en: `Cloudie, a cloud above the mountain, and Spongie, a sponge below the coast, holding each other in one circle. Now tinted by ${p.name.en}.`,
      zh: `山上的綿雲、海岸下的海綿，抱成一個圓。現在染上了${p.name.zh}的顏色。`,
    }),
    seasonLine: (s) => ({ en: `In ${s.name.en.toLowerCase()}, it ${s.note.en}.`, zh: `${s.name.zh}天，它${s.note.zh}。` }),
    itemLine: (i) => ({
      en: `Carrying a ${i.name.en.toLowerCase()}: ${i.trait.en}.`,
      zh: `帶著${i.name.zh}：${i.trait.zh}。`,
    }),
  },
};
