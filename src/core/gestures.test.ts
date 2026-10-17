import { beforeEach, describe, expect, it } from 'vitest';
import { type GestureClock, GestureRecognizer, type Point } from './gestures';
import type { GestureId } from './types';

/** Deterministic clock: time only moves when the test says so. */
function fakeClock() {
  let t = 0;
  let nextId = 1;
  let timers: { at: number; fn: () => void; id: number }[] = [];
  const clock: GestureClock = {
    now: () => t,
    setTimeout: (fn, ms) => {
      const id = nextId++;
      timers.push({ at: t + ms, fn, id });
      return id;
    },
    clearTimeout: (id) => {
      timers = timers.filter((x) => x.id !== id);
    },
  };
  const advance = (ms: number) => {
    t += ms;
    const due = timers.filter((x) => x.at <= t);
    timers = timers.filter((x) => x.at > t);
    due.forEach((x) => x.fn());
  };
  return { clock, advance };
}

const centre: Point = { x: 0, y: 0 };

describe('GestureRecognizer', () => {
  let seen: GestureId[];
  let time: ReturnType<typeof fakeClock>;
  let g: GestureRecognizer;

  beforeEach(() => {
    seen = [];
    time = fakeClock();
    g = new GestureRecognizer((x) => seen.push(x), {}, time.clock);
  });

  const tap = (p: Point = { x: 5, y: 5 }) => {
    g.down(p, centre);
    time.advance(80);
    g.up(p);
  };

  it('single tap → hop, after the confirm delay', () => {
    tap();
    expect(seen).toEqual([]);
    time.advance(400);
    expect(seen).toEqual(['hop']);
  });

  it('long press → nestle', () => {
    g.down({ x: 5, y: 5 }, centre);
    time.advance(700);
    g.up({ x: 6, y: 5 });
    expect(seen).toEqual(['nestle']);
  });

  it('four quick taps → tremble, with no hop', () => {
    for (let i = 0; i < 4; i++) {
      tap();
      time.advance(100);
    }
    time.advance(1000);
    expect(seen).toEqual(['tremble']);
  });

  it('vertical drag → drift; horizontal drag → nothing', () => {
    g.down({ x: 0, y: 0 }, centre);
    g.move({ x: 5, y: 50 });
    g.up({ x: 5, y: 90 });
    g.down({ x: 0, y: 0 }, centre);
    g.move({ x: 90, y: 10 });
    g.up({ x: 90, y: 10 });
    time.advance(1000);
    expect(seen).toEqual(['drift']);
  });

  it('drawing a circle around the centre → whirl, emitted mid-stroke', () => {
    const r = 80;
    g.down({ x: r, y: 0 }, centre);
    for (let a = 0; a <= Math.PI * 1.8; a += 0.2) g.move({ x: r * Math.cos(a), y: r * Math.sin(a) });
    expect(seen).toEqual(['whirl']);
    g.up({ x: r, y: 0 });
    time.advance(1000);
    expect(seen).toEqual(['whirl']);
  });
});
