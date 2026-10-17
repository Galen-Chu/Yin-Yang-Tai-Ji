import type { Place } from '../../core';

/** Layer 1 · 環境 — nine Taiwanese landscapes. Each recolours Spongie 海綿 against a contrasting ground. */
export const places: Place[] = [
  {
    id: 'ridges',
    name: { en: 'Ridges', zh: '山巒' },
    prefix: { en: 'Ridge', zh: '山巒' },
    material: { en: 'olive-ridge', zh: '山巒般' },
    palette: { top: '#F1F3E2', bottom: '#A3AD5C', accent: '#77822F', sky: '#E7EBD2', ground: '#4E9466' },
  },
  {
    id: 'forest',
    name: { en: 'Forest', zh: '森林' },
    prefix: { en: 'Forest', zh: '森林' },
    material: { en: 'mossy-forest', zh: '森林青苔般' },
    palette: { top: '#EEF7E4', bottom: '#8CC152', accent: '#5E9132', sky: '#E2F0D6', ground: '#7A5536' },
  },
  {
    id: 'terraces',
    name: { en: 'Terraces', zh: '梯田' },
    prefix: { en: 'Terrace', zh: '梯田' },
    material: { en: 'rice-terrace', zh: '梯田稻穗般' },
    palette: { top: '#FBF8E4', bottom: '#E8C547', accent: '#B8962A', sky: '#EEF2D8', ground: '#6DB33F' },
  },
  {
    id: 'canal',
    name: { en: 'Canal', zh: '水圳' },
    prefix: { en: 'Canal', zh: '水圳' },
    material: { en: 'canal-stream', zh: '水圳流水般' },
    palette: { top: '#EEF5FB', bottom: '#C9784F', accent: '#9C5434', sky: '#DCEAF7', ground: '#3F8FD1' },
  },
  {
    id: 'cliffs',
    name: { en: 'Cliffs', zh: '峭壁' },
    prefix: { en: 'Cliff', zh: '峭壁' },
    material: { en: 'iron-cliff', zh: '峭壁岩石般' },
    palette: { top: '#E6F4F8', bottom: '#75858F', accent: '#4E5C66', sky: '#D6EDF5', ground: '#3A9DC0' },
  },
  {
    id: 'beach',
    name: { en: 'Beach', zh: '海灘' },
    prefix: { en: 'Shore', zh: '白沙' },
    material: { en: 'white-sand', zh: '白沙般' },
    palette: { top: '#FFFFFF', bottom: '#F4ECD8', accent: '#D8C9A4', sky: '#D2F0F5', ground: '#4FC6DA' },
  },
  {
    id: 'pond',
    name: { en: 'Fish Pond', zh: '魚塭' },
    prefix: { en: 'Pond', zh: '魚塭' },
    material: { en: 'fish-pond-dusk', zh: '魚塭黃昏般' },
    palette: { top: '#F8F2FA', bottom: '#B793C9', accent: '#8A68A0', sky: '#F0E6F2', ground: '#6E8F3A' },
  },
  {
    id: 'hotspring',
    name: { en: 'Hot Spring', zh: '溫泉' },
    prefix: { en: 'Steam', zh: '湯煙' },
    material: { en: 'hot-spring-steam', zh: '溫泉湯煙般' },
    palette: { top: '#FFF2EE', bottom: '#EE9480', accent: '#C96A57', sky: '#F5E6DF', ground: '#5FB894' },
  },
  {
    id: 'reef',
    name: { en: 'Coral Reef', zh: '珊瑚礁' },
    prefix: { en: 'Coral', zh: '珊瑚' },
    material: { en: 'coral-reef', zh: '珊瑚礁般' },
    palette: { top: '#F0FAF9', bottom: '#FF8466', accent: '#D95A3E', sky: '#D2EEEC', ground: '#137F8C' },
  },
];
