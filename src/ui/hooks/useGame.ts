import { useCallback, useEffect, useRef, useState } from 'react';
import {
  type Action,
  type CharacterDefinition,
  type GameEvent,
  type GameState,
  getItem,
  getPlace,
  initialState,
  step,
  type Text,
} from '../../core';
import type { ProgressStore } from '../../storage/progressStore';

/** Toast copy for engine events. Returns null for events that need no toast. */
function messageFor(def: CharacterDefinition, e: GameEvent): Text | null {
  switch (e.type) {
    case 'itemFound': {
      const i = getItem(def, e.itemId);
      return { en: `Found: ${i.name.en}`, zh: `找到${i.name.zh}！` };
    }
    case 'itemLocked': {
      const p = getPlace(def, getItem(def, e.itemId).placeId);
      return { en: `Check in at ${p.name.en} to find it`, zh: `去${p.name.zh}打卡取得` };
    }
    case 'carryLimit':
      return { en: `Carry up to ${e.max}`, zh: `最多帶 ${e.max} 個` };
    case 'allFoundHere': {
      const p = getPlace(def, e.placeId);
      return { en: `All found at ${p.name.en}`, zh: `${p.name.zh}都找到了` };
    }
    case 'settled':
      return { en: 'Settled back to base', zh: '回到原形' };
    case 'discovered':
      return null;
  }
}

const TOAST_MS = 2200;

/**
 * Owns game state on the UI side: runs the pure engine, persists progress,
 * shows toasts, and settles the character back to base after idling.
 */
export function useGame(def: CharacterDefinition, store: ProgressStore) {
  const [state, setState] = useState<GameState>(() => initialState(def, store.load()));
  const [isNew, setIsNew] = useState(false);
  const [toast, setToast] = useState<Text | null>(null);
  const stateRef = useRef(state);
  const lastActivity = useRef(Date.now());
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const flash = useCallback((text: Text) => {
    setToast(text);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), TOAST_MS);
  }, []);

  const dispatch = useCallback(
    (action: Action) => {
      const prev = stateRef.current;
      const { state: next, events } = step(def, prev, action);
      stateRef.current = next;
      setState(next);

      if (action.type === 'resetProgress') store.clear();
      else if (next.progress !== prev.progress) store.save(next.progress);

      if (!(action.type === 'rest' && action.reason === 'idle')) lastActivity.current = Date.now();
      if (next.play !== prev.play) setIsNew(events.some((e) => e.type === 'discovered'));

      const message = events.map((e) => messageFor(def, e)).find((m) => m !== null);
      if (message) flash(message);
    },
    [def, store, flash],
  );

  /** Call on any interaction that should postpone the idle reset. */
  const touchActivity = useCallback(() => {
    lastActivity.current = Date.now();
  }, []);

  useEffect(() => {
    const idleMs = def.rules.idleSeconds * 1000;
    if (idleMs <= 0) return;
    const iv = setInterval(() => {
      if (stateRef.current.play.touch && Date.now() - lastActivity.current > idleMs) {
        dispatch({ type: 'rest', reason: 'idle' });
      }
    }, 1000);
    return () => clearInterval(iv);
  }, [def, dispatch]);

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  return { state, dispatch, isNew, toast, flash, touchActivity };
}

export type Game = ReturnType<typeof useGame>;
