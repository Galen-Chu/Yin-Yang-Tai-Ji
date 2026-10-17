import { describe, expect, it } from 'vitest';
import { taiji } from '../characters/taiji';
import { type Action, initialState, step } from './engine';
import { dexCounts, formKey, hiddenKey, resolveForm } from './rules';
import type { GameState } from './types';
import { validateCharacter } from './validate';

const run = (actions: Action[], from: GameState = initialState(taiji)) =>
  actions.reduce((s, a) => step(taiji, s, a).state, from);

/** Collect every item so carry rules don't get in the way. */
const withAllItems = (): GameState => ({
  ...initialState(taiji),
  progress: { discovered: [], collected: taiji.items.map((i) => i.id) },
});

const current = (s: GameState) => resolveForm(taiji, s.play, s.progress);

const typhoonSteps: Action[] = [
  { type: 'touch', gesture: 'tremble' },
  { type: 'touch', gesture: 'drift' },
  { type: 'touch', gesture: 'whirl' },
];

describe('TaiJi content', () => {
  it('has no broken references', () => {
    expect(validateCharacter(taiji)).toEqual([]);
  });

  it('matches the framework counts: 9 places × 5 touches, 27 items, 6 hidden', () => {
    const c = dexCounts(taiji, { discovered: [], collected: [] });
    expect(c.forms.total).toBe(45);
    expect(c.items.total).toBe(27);
    expect(c.hidden.total).toBe(6);
    for (const p of taiji.places) expect(taiji.items.filter((i) => i.placeId === p.id)).toHaveLength(3);
  });
});

describe('forms', () => {
  it('starts in base form and discovers Place × Touch forms', () => {
    const s0 = initialState(taiji);
    expect(current(s0).kind).toBe('base');
    const { state, events } = step(taiji, s0, { type: 'touch', gesture: 'hop' });
    expect(current(state)).toMatchObject({ kind: 'form', key: formKey('ridges', 'hop') });
    expect(events).toContainEqual({ type: 'discovered', key: 'ridges/hop' });
  });

  it('only reports a discovery once', () => {
    const s = run([{ type: 'touch', gesture: 'hop' }]);
    expect(step(taiji, s, { type: 'touch', gesture: 'hop' }).events).toEqual([]);
  });

  it('keeps the touch when changing place, discovering the new combination', () => {
    const s = run([{ type: 'touch', gesture: 'nestle' }, { type: 'setPlace', placeId: 'reef' }]);
    expect(s.progress.discovered).toEqual(['ridges/nestle', 'reef/nestle']);
  });

  it('rest returns to base form', () => {
    const s = run([{ type: 'touch', gesture: 'drift' }, { type: 'rest' }]);
    expect(current(s).kind).toBe('base');
  });

  it('names forms as place prefix + touch suffix', () => {
    const f = current(run([{ type: 'setPlace', placeId: 'beach' }, { type: 'touch', gesture: 'whirl' }]));
    if (f.kind !== 'form') throw new Error('expected form');
    expect(taiji.describe.formName(f.place, f.touch)).toEqual({ en: 'Shore Whirl', zh: '白沙繞繞' });
  });
});

describe('items', () => {
  it('check-in collects the next item at the current place', () => {
    const r1 = step(taiji, initialState(taiji), { type: 'checkIn' });
    expect(r1.events).toEqual([{ type: 'itemFound', itemId: 'tea' }]);
    const s = run([{ type: 'checkIn' }, { type: 'checkIn' }], r1.state);
    expect(s.progress.collected).toEqual(['tea', 'pheasant', 'sakura']);
    expect(step(taiji, s, { type: 'checkIn' }).events).toEqual([{ type: 'allFoundHere', placeId: 'ridges' }]);
  });

  it('cannot carry an item that has not been collected', () => {
    const { state, events } = step(taiji, initialState(taiji), { type: 'toggleCarry', itemId: 'tea' });
    expect(events).toEqual([{ type: 'itemLocked', itemId: 'tea' }]);
    expect(state.play.carried).toEqual([]);
  });

  it('carries at most two items and toggles them off again', () => {
    const carry = (itemId: string): Action => ({ type: 'toggleCarry', itemId });
    const s = run([carry('tea'), carry('rice'), carry('crab')], withAllItems());
    expect(s.play.carried).toEqual(['tea', 'rice']);
    expect(step(taiji, s, carry('crab')).events).toEqual([{ type: 'carryLimit', max: 2 }]);
    expect(run([carry('tea')], s).play.carried).toEqual(['rice']);
  });
});

describe('hidden forms', () => {
  it('Typhoon Eye: summer + tremble → drift → whirl in a row', () => {
    expect(current(run(typhoonSteps))).toMatchObject({ kind: 'hidden', key: hiddenKey('typhoon') });
  });

  it('Typhoon Eye: broken by a season change mid-sequence', () => {
    const s = run([
      { type: 'touch', gesture: 'tremble' },
      { type: 'touch', gesture: 'drift' },
      { type: 'setSeason', seasonId: 'summer' },
      { type: 'touch', gesture: 'whirl' },
    ]);
    expect(current(s).kind).toBe('form');
  });

  it('Typhoon Eye: lost on the next touch', () => {
    const s = run([...typhoonSteps, { type: 'touch', gesture: 'whirl' }]);
    expect(current(s)).toMatchObject({ kind: 'form', key: 'ridges/whirl' });
  });

  it('Kuroshio Drifter: reef + spring + drift + turtle & driftwood', () => {
    const s = run(
      [
        { type: 'setPlace', placeId: 'reef' },
        { type: 'setSeason', seasonId: 'spring' },
        { type: 'toggleCarry', itemId: 'turtle' },
        { type: 'toggleCarry', itemId: 'driftwood' },
        { type: 'touch', gesture: 'drift' },
      ],
      withAllItems(),
    );
    expect(current(s).key).toBe('hidden/kuroshio');
  });

  it('Firefly River: canal + summer + firefly & float, with or without a touch', () => {
    const s = run(
      [
        { type: 'setPlace', placeId: 'canal' },
        { type: 'toggleCarry', itemId: 'firefly' },
        { type: 'toggleCarry', itemId: 'float' },
      ],
      withAllItems(),
    );
    expect(current(s).key).toBe('hidden/firefly');
    expect(current(run([{ type: 'touch', gesture: 'hop' }], s)).key).toBe('hidden/firefly');
  });

  it('Sea of Clouds: ridges + winter + whirl', () => {
    const s = run([{ type: 'setSeason', seasonId: 'winter' }, { type: 'touch', gesture: 'whirl' }]);
    expect(current(s).key).toBe('hidden/sea');
  });

  it('Rainbow TaiJi: requires Typhoon Eye to have been discovered first', () => {
    const rainbow: Action[] = [
      { type: 'setPlace', placeId: 'beach' },
      { type: 'setSeason', seasonId: 'spring' },
      { type: 'touch', gesture: 'hop' },
    ];
    expect(current(run(rainbow)).key).toBe('beach/hop');
    expect(current(run([...typhoonSteps, ...rainbow])).key).toBe('hidden/rainbow');
  });

  it('MianMian: autumn + nestle + a friend', () => {
    const s = run([
      { type: 'setSeason', seasonId: 'autumn' },
      { type: 'toggleFriend' },
      { type: 'touch', gesture: 'nestle' },
    ]);
    expect(current(s).key).toBe('hidden/twin');
  });

  it('becomeHidden is ignored until the form is discovered', () => {
    const fresh = initialState(taiji);
    expect(step(taiji, fresh, { type: 'becomeHidden', hiddenId: 'typhoon' }).state).toBe(fresh);
  });

  it.each(taiji.hidden.map((h) => h.id))('becomeHidden replays %s', (id) => {
    const s: GameState = {
      ...initialState(taiji),
      progress: { collected: taiji.items.map((i) => i.id), discovered: taiji.hidden.map((x) => hiddenKey(x.id)) },
    };
    expect(current(step(taiji, s, { type: 'becomeHidden', hiddenId: id }).state).key).toBe(hiddenKey(id));
  });
});

describe('progress', () => {
  it('reset clears discoveries, collected and carried items', () => {
    const s = run([{ type: 'toggleCarry', itemId: 'tea' }, { type: 'touch', gesture: 'hop' }], withAllItems());
    const r = run([{ type: 'resetProgress' }], s);
    expect(r.progress).toEqual({ discovered: [], collected: [] });
    expect(r.play.carried).toEqual([]);
  });
});
