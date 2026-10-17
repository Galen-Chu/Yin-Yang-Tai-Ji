import type { Item } from '../../core';

/**
 * Layer 4 · 收集物 — three Taiwan-native items per place (27 total): local
 * crops, endemic species, regional materials. Accessories only, never the body.
 *
 * These are virtual collectibles earned by checking in. Several (feathers of
 * protected birds, coral, Hokutolite 北投石, Taroko marble) must never be taken
 * from nature in real life — keep in-app copy consistent with that.
 */
const item = (
  id: string,
  placeId: string,
  glyph: string,
  en: string,
  zh: string,
  traitEn: string,
  traitZh: string,
): Item => ({ id, placeId, glyph, name: { en, zh }, trait: { en: traitEn, zh: traitZh } });

export const items: Item[] = [
  item('tea', 'ridges', '茶', 'High-mountain oolong', '高山烏龍', 'notices small comforts', '留意小小的安慰'),
  item('pheasant', 'ridges', '雉', 'Mikado pheasant feather', '帝雉羽', 'walks proud but gentle', '驕傲又溫柔地走'),
  item('sakura', 'ridges', '櫻', 'Taiwan cherry blossom', '山櫻花', 'blooms after the cold', '熬過寒冷才開花'),

  item('cypress', 'forest', '檜', 'Taiwan cypress chip', '檜木片', 'breathes slowly', '慢慢地呼吸'),
  item('bear', 'forest', '熊', 'Black bear crescent', '黑熊月牙', 'carries a little light on its chest', '胸口帶著一點光'),
  item('magpie', 'forest', '鵲', 'Blue magpie feather', '藍鵲羽', 'looks out for family', '守護家人'),

  item('rice', 'terraces', '稻', 'Rice ear', '稻穗', 'treasures small things', '珍惜小小的事'),
  item('hat', 'terraces', '笠', 'Bamboo hat', '斗笠', 'shades others from the sun', '替別人遮太陽'),
  item('yam', 'terraces', '薯', 'Sweet potato', '番薯', 'puts down roots wherever it lands', '落土生根'),

  item('wheel', 'canal', '車', 'Water wheel', '水車', 'keeps things flowing', '讓事情慢慢流動'),
  item('firefly', 'canal', '螢', 'Firefly', '螢火蟲', 'glows quietly', '安靜地發光'),
  item('caltrop', 'canal', '菱', 'Water caltrop', '菱角', 'soft inside a tough shape', '外硬內軟'),

  item('eagle', 'cliffs', '鷲', 'Serpent eagle feather', '大冠鷲羽', 'sees the bigger picture', '看得比較遠'),
  item('lily', 'cliffs', '合', 'Formosa lily', '台灣百合', 'stands brave in the wind', '在風中勇敢站著'),
  item('marble', 'cliffs', '岩', 'Taroko marble', '太魯閣大理石', 'patient as stone', '像石頭一樣有耐心'),

  item('crab', 'beach', '蟹', 'Hermit crab', '寄居蟹', 'finds home anywhere', '到哪都能找到家'),
  item('driftwood', 'beach', '木', 'Driftwood', '漂流木', 'goes with the flow', '順著水流走'),
  item('float', 'beach', '球', 'Glass fishing float', '玻璃浮球', 'stays afloat', '總能浮起來'),

  item('oyster', 'pond', '蚵', 'Oyster shell', '蚵殼', 'protects the soft part inside', '保護柔軟的內心'),
  item('scale', 'pond', '鱗', 'Milkfish scale', '虱目魚鱗', 'shines in small ways', '用小小的方式閃亮'),
  item('spoonbill', 'pond', '琵', 'Black-faced spoonbill feather', '黑面琵鷺羽', 'comes back every winter', '每年冬天都會回來'),

  item('egg', 'hotspring', '蛋', 'Hot-spring egg', '溫泉蛋', 'warms others from the inside', '由內而外溫暖別人'),
  item('hokuto', 'hotspring', '北', 'Hokutolite', '北投石', 'heals slowly', '慢慢療癒'),
  item('bucket', 'hotspring', '桶', 'Wooden bucket', '小木桶', 'saves warmth for later', '把溫暖留到之後'),

  item('coral', 'reef', '珊', 'Coral sprig', '珊瑚枝', 'makes room for others', '為別人留一點空間'),
  item('coralstone', 'reef', '咾', 'Penghu coral stone', '咾咕石', 'builds a home from small pieces', '用小碎片蓋出家'),
  item('turtle', 'reef', '龜', 'Little green turtle', '小綠蠵龜', 'always finds its way back', '總會找到回來的路'),
];
