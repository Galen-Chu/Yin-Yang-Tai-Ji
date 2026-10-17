import type { CharacterDefinition } from './types';

/**
 * Checks a character definition for broken references. Content is plain data
 * edited by hand, so this catches typos before they become runtime errors.
 * Returns a list of problems; empty means valid.
 */
export function validateCharacter(def: CharacterDefinition): string[] {
  const problems: string[] = [];
  const ids = (list: { id: string }[]) => new Set(list.map((x) => x.id));

  const checkUnique = (kind: string, list: { id: string }[]) => {
    const seen = new Set<string>();
    for (const { id } of list) {
      if (seen.has(id)) problems.push(`Duplicate ${kind} id: ${id}`);
      seen.add(id);
    }
  };
  checkUnique('place', def.places);
  checkUnique('touch', def.touches);
  checkUnique('season', def.seasons);
  checkUnique('item', def.items);
  checkUnique('hidden form', def.hidden);

  const places = ids(def.places);
  const touches = ids(def.touches);
  const seasons = ids(def.seasons);
  const items = ids(def.items);
  const hidden = ids(def.hidden);

  for (const item of def.items) {
    if (!places.has(item.placeId)) problems.push(`Item ${item.id} references unknown place ${item.placeId}`);
    if ([...item.glyph].length !== 1) problems.push(`Item ${item.id} glyph should be one character`);
  }

  if (!def.shapes.base) problems.push('Missing base shape');
  for (const t of def.touches) {
    if (!def.shapes[t.id]) problems.push(`Missing shape for touch ${t.id}`);
  }

  for (const h of def.hidden) {
    const w = h.when;
    const where = `Hidden form ${h.id}`;
    if (!def.shapes[h.shape]) problems.push(`${where} uses unknown shape ${h.shape}`);
    if (w.place && !places.has(w.place)) problems.push(`${where} references unknown place ${w.place}`);
    if (w.season && !seasons.has(w.season)) problems.push(`${where} references unknown season ${w.season}`);
    if (w.touch && !touches.has(w.touch)) problems.push(`${where} references unknown touch ${w.touch}`);
    for (const t of w.sequence ?? []) if (!touches.has(t)) problems.push(`${where} sequence uses unknown touch ${t}`);
    for (const i of w.items ?? []) if (!items.has(i)) problems.push(`${where} references unknown item ${i}`);
    for (const r of w.requires ?? []) {
      if (!hidden.has(r)) problems.push(`${where} requires unknown hidden form ${r}`);
      if (r === h.id) problems.push(`${where} requires itself`);
    }
    if ((w.items?.length ?? 0) > def.rules.maxCarried) {
      problems.push(`${where} needs more items than can be carried (${def.rules.maxCarried})`);
    }
    if ((w.sequence?.length ?? 0) > def.rules.historyLength) {
      problems.push(`${where} sequence is longer than rules.historyLength`);
    }
    if (w.sequence && w.touch && w.touch !== w.sequence.at(-1)) {
      problems.push(`${where} touch must equal the last step of its sequence`);
    }
  }

  if (!places.has(def.defaults.place)) problems.push(`Default place ${def.defaults.place} not found`);
  if (!seasons.has(def.defaults.season)) problems.push(`Default season ${def.defaults.season} not found`);
  return problems;
}
