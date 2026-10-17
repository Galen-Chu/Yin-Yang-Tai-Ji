import type {
  CharacterDefinition,
  GestureId,
  HiddenCondition,
  HiddenForm,
  Item,
  Place,
  PlayState,
  Progress,
  ResolvedForm,
  Season,
  Touch,
} from './types';

/** Dex key for a regular Place × Touch form, e.g. `mtn/hop`. */
export const formKey = (placeId: string, touchId: string) => `${placeId}/${touchId}`;

/** Dex key for a hidden form, e.g. `hidden/typhoon`. */
export const hiddenKey = (hiddenId: string) => `hidden/${hiddenId}`;

function byId<T extends { id: string }>(list: T[], id: string, kind: string): T {
  const found = list.find((x) => x.id === id);
  if (!found) throw new Error(`Unknown ${kind}: ${id}`);
  return found;
}

export const getPlace = (def: CharacterDefinition, id: string): Place => byId(def.places, id, 'place');
export const getTouch = (def: CharacterDefinition, id: GestureId): Touch => byId(def.touches, id, 'touch');
export const getSeason = (def: CharacterDefinition, id: string): Season => byId(def.seasons, id, 'season');
export const getItem = (def: CharacterDefinition, id: string): Item => byId(def.items, id, 'item');
export const getHidden = (def: CharacterDefinition, id: string): HiddenForm => byId(def.hidden, id, 'hidden form');

export const itemsAt = (def: CharacterDefinition, placeId: string) =>
  def.items.filter((i) => i.placeId === placeId);

function endsWith(history: GestureId[], sequence: GestureId[]) {
  if (sequence.length > history.length) return false;
  const tail = history.slice(history.length - sequence.length);
  return tail.every((t, i) => t === sequence[i]);
}

export function matchesCondition(when: HiddenCondition, play: PlayState, progress: Progress): boolean {
  if (when.place !== undefined && play.place !== when.place) return false;
  if (when.season !== undefined && play.season !== when.season) return false;
  if (when.touch !== undefined && play.touch !== when.touch) return false;
  if (when.friend !== undefined && play.friend !== when.friend) return false;
  if (when.items && !when.items.every((id) => play.carried.includes(id))) return false;
  if (when.sequence) {
    // A sequence must also end on the current touch, so any later touch breaks it.
    if (play.touch !== when.sequence[when.sequence.length - 1]) return false;
    if (!endsWith(play.history, when.sequence)) return false;
  }
  if (when.requires && !when.requires.every((id) => progress.discovered.includes(hiddenKey(id)))) {
    return false;
  }
  return true;
}

/** First matching hidden form in priority order, or null. */
export function findHidden(def: CharacterDefinition, play: PlayState, progress: Progress): HiddenForm | null {
  return def.hidden.find((h) => matchesCondition(h.when, play, progress)) ?? null;
}

/** Work out which form the character is in right now. */
export function resolveForm(def: CharacterDefinition, play: PlayState, progress: Progress): ResolvedForm {
  const hidden = findHidden(def, play, progress);
  if (hidden) return { kind: 'hidden', key: hiddenKey(hidden.id), hidden };
  if (play.touch) {
    return {
      kind: 'form',
      key: formKey(play.place, play.touch),
      place: getPlace(def, play.place),
      touch: getTouch(def, play.touch),
    };
  }
  return { kind: 'base', key: null };
}

/** All regular form keys, row-major by place then touch. */
export const allFormKeys = (def: CharacterDefinition) =>
  def.places.flatMap((p) => def.touches.map((t) => formKey(p.id, t.id)));

export interface DexCounts {
  forms: { found: number; total: number };
  items: { found: number; total: number };
  hidden: { found: number; total: number };
}

export function dexCounts(def: CharacterDefinition, progress: Progress): DexCounts {
  const has = new Set(progress.discovered);
  return {
    forms: { found: allFormKeys(def).filter((k) => has.has(k)).length, total: def.places.length * def.touches.length },
    items: { found: progress.collected.length, total: def.items.length },
    hidden: { found: def.hidden.filter((h) => has.has(hiddenKey(h.id))).length, total: def.hidden.length },
  };
}
