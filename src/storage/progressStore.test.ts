import { describe, expect, it } from 'vitest';
import { taiji } from '../characters/taiji';
import { createLocalProgressStore, sanitizeProgress } from './progressStore';

function memoryStorage(): Storage {
  const m = new Map<string, string>();
  return {
    get length() {
      return m.size;
    },
    clear: () => m.clear(),
    getItem: (k) => m.get(k) ?? null,
    key: (i) => [...m.keys()][i] ?? null,
    removeItem: (k) => void m.delete(k),
    setItem: (k, v) => void m.set(k, v),
  };
}

describe('progress store', () => {
  it('round-trips progress', () => {
    const store = createLocalProgressStore(taiji, memoryStorage());
    const p = { discovered: ['ridges/hop', 'hidden/sea'], collected: ['tea'] };
    store.save(p);
    expect(store.load()).toEqual(p);
    store.clear();
    expect(store.load()).toEqual({ discovered: [], collected: [] });
  });

  it('survives corrupt data', () => {
    const storage = memoryStorage();
    storage.setItem('taiji:progress:v1', '{not json');
    expect(createLocalProgressStore(taiji, storage).load()).toEqual({ discovered: [], collected: [] });
  });

  it('drops unknown and duplicate ids', () => {
    expect(
      sanitizeProgress(taiji, {
        discovered: ['ridges/hop', 'ridges/hop', 'atlantis/hop', 42, 'hidden/nope'],
        collected: ['tea', 'unobtainium'],
      }),
    ).toEqual({ discovered: ['ridges/hop'], collected: ['tea'] });
  });
});
