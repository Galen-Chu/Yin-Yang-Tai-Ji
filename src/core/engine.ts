import { getHidden, hiddenKey, itemsAt, resolveForm } from './rules';
import type { CharacterDefinition, GameState, GestureId, PlayState, Progress } from './types';

export type Action =
  | { type: 'setPlace'; placeId: string }
  | { type: 'setSeason'; seasonId: string }
  | { type: 'touch'; gesture: GestureId }
  | { type: 'rest'; reason?: 'user' | 'idle' }
  | { type: 'toggleFriend' }
  | { type: 'toggleCarry'; itemId: string }
  /** Check in at the current place and collect the next item found there. */
  | { type: 'checkIn' }
  /** Jump to a place in base form (used by the dex "Go to …" button). */
  | { type: 'goTo'; placeId: string }
  /** Replay a discovered Place × Touch form. */
  | { type: 'becomeForm'; placeId: string; touchId: GestureId }
  /** Replay a discovered hidden form by applying its unlock condition. */
  | { type: 'becomeHidden'; hiddenId: string }
  | { type: 'resetProgress' };

export type GameEvent =
  | { type: 'discovered'; key: string }
  | { type: 'itemFound'; itemId: string }
  | { type: 'itemLocked'; itemId: string }
  | { type: 'carryLimit'; max: number }
  | { type: 'allFoundHere'; placeId: string }
  | { type: 'settled' };

export interface StepResult {
  state: GameState;
  events: GameEvent[];
}

export const emptyProgress = (): Progress => ({ discovered: [], collected: [] });

export function initialPlay(def: CharacterDefinition): PlayState {
  return {
    place: def.defaults.place,
    season: def.defaults.season,
    touch: null,
    carried: [],
    friend: false,
    history: [],
  };
}

export function initialState(def: CharacterDefinition, progress: Progress = emptyProgress()): GameState {
  return { play: initialPlay(def), progress };
}

/** Records the resolved form in the dex if it is new. */
function record(def: CharacterDefinition, state: GameState, events: GameEvent[]): GameState {
  const form = resolveForm(def, state.play, state.progress);
  if (!form.key || state.progress.discovered.includes(form.key)) return state;
  events.push({ type: 'discovered', key: form.key });
  return { ...state, progress: { ...state.progress, discovered: [...state.progress.discovered, form.key] } };
}

/**
 * Pure state transition: (definition, state, action) → (state, events).
 * The UI layer owns side effects (persistence, toasts, timers).
 */
export function step(def: CharacterDefinition, state: GameState, action: Action): StepResult {
  const events: GameEvent[] = [];
  const { play, progress } = state;
  let next: GameState = state;
  const withPlay = (patch: Partial<PlayState>) => ({ ...state, play: { ...play, ...patch } });

  switch (action.type) {
    case 'setPlace':
      next = withPlay({ place: action.placeId, history: [] });
      break;
    case 'setSeason':
      next = withPlay({ season: action.seasonId, history: [] });
      break;
    case 'touch':
      next = withPlay({
        touch: action.gesture,
        history: [...play.history, action.gesture].slice(-def.rules.historyLength),
      });
      break;
    case 'rest':
      if (action.reason === 'idle') events.push({ type: 'settled' });
      next = withPlay({ touch: null });
      break;
    case 'toggleFriend':
      next = withPlay({ friend: !play.friend });
      break;
    case 'toggleCarry': {
      const { itemId } = action;
      if (!progress.collected.includes(itemId)) {
        events.push({ type: 'itemLocked', itemId });
        return { state, events };
      }
      if (play.carried.includes(itemId)) {
        next = withPlay({ carried: play.carried.filter((x) => x !== itemId) });
      } else if (play.carried.length >= def.rules.maxCarried) {
        events.push({ type: 'carryLimit', max: def.rules.maxCarried });
        return { state, events };
      } else {
        next = withPlay({ carried: [...play.carried, itemId] });
      }
      break;
    }
    case 'checkIn': {
      const item = itemsAt(def, play.place).find((i) => !progress.collected.includes(i.id));
      if (!item) {
        events.push({ type: 'allFoundHere', placeId: play.place });
        return { state, events };
      }
      events.push({ type: 'itemFound', itemId: item.id });
      // Collecting doesn't change the form, so there is nothing new to record.
      return { state: { ...state, progress: { ...progress, collected: [...progress.collected, item.id] } }, events };
    }
    case 'goTo':
      next = withPlay({ place: action.placeId, touch: null, history: [] });
      break;
    case 'becomeForm':
      next = withPlay({ place: action.placeId, touch: action.touchId, history: [] });
      break;
    case 'becomeHidden': {
      if (!progress.discovered.includes(hiddenKey(action.hiddenId))) return { state, events };
      const { when } = getHidden(def, action.hiddenId);
      const touch = when.sequence?.at(-1) ?? when.touch ?? null;
      next = withPlay({
        place: when.place ?? play.place,
        season: when.season ?? play.season,
        touch,
        carried: when.items ? [...when.items] : play.carried,
        friend: when.friend ?? false,
        history: when.sequence ? [...when.sequence] : [],
      });
      break;
    }
    case 'resetProgress':
      return { state: { play: { ...play, carried: [] }, progress: emptyProgress() }, events };
  }

  return { state: record(def, next, events), events };
}
