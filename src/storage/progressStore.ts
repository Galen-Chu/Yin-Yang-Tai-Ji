import { allFormKeys, type CharacterDefinition, emptyProgress, hiddenKey, type Progress } from '../core';

/**
 * Where player progress lives. The app only talks to this interface, so the
 * localStorage implementation can later be swapped for IndexedDB or a synced
 * backend without touching game logic.
 */
export interface ProgressStore {
  load(): Progress;
  save(progress: Progress): void;
  clear(): void;
}

/** Drops ids that no longer exist, so content edits never break saved games. */
export function sanitizeProgress(def: CharacterDefinition, raw: unknown): Progress {
  if (!raw || typeof raw !== 'object') return emptyProgress();
  const r = raw as Partial<Record<keyof Progress, unknown>>;
  const validForms = new Set([...allFormKeys(def), ...def.hidden.map((h) => hiddenKey(h.id))]);
  const validItems = new Set(def.items.map((i) => i.id));
  const strings = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []);
  return {
    discovered: [...new Set(strings(r.discovered))].filter((k) => validForms.has(k)),
    collected: [...new Set(strings(r.collected))].filter((k) => validItems.has(k)),
  };
}

export function createLocalProgressStore(def: CharacterDefinition, storage: Storage | undefined = globalThis.localStorage): ProgressStore {
  const key = `${def.id}:progress:v1`;
  return {
    load() {
      try {
        const raw = storage?.getItem(key);
        return raw ? sanitizeProgress(def, JSON.parse(raw)) : emptyProgress();
      } catch {
        return emptyProgress();
      }
    },
    save(progress) {
      try {
        storage?.setItem(key, JSON.stringify(progress));
      } catch {
        // Private mode or quota exceeded: keep playing without persistence.
      }
    },
    clear() {
      try {
        storage?.removeItem(key);
      } catch {
        // ignore
      }
    },
  };
}
