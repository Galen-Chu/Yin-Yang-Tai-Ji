import type { GestureId } from './types';

/**
 * Turns raw pointer input on the character into one of five touches:
 *
 * | Touch   | Gesture        | Rule                                           |
 * | ------- | -------------- | ---------------------------------------------- |
 * | hop     | tap            | short press, no movement, no follow-up taps    |
 * | nestle  | long press     | held still longer than `longPressMs`           |
 * | drift   | drag up/down   | mostly-vertical drag beyond `dragPx`           |
 * | tremble | rapid taps     | `rapidTapCount` taps within `rapidTapWindowMs` |
 * | whirl   | draw a circle  | cumulative angle around centre > `whirlRadians` |
 *
 * Framework-free: feed it points, it calls `onGesture`. Time and timers are
 * injectable so the recogniser can be unit-tested deterministically.
 */

export interface GestureConfig {
  longPressMs: number;
  /** Max pointer travel for a press to still count as a tap. */
  tapSlopPx: number;
  dragPx: number;
  /** |dy| must exceed |dx| × this ratio for a vertical drag. */
  dragVerticalRatio: number;
  /** Delay before a single tap is confirmed as hop (waits for more taps). */
  tapConfirmMs: number;
  rapidTapCount: number;
  rapidTapWindowMs: number;
  whirlRadians: number;
  /** Ignore angle changes this close to the centre (too noisy). */
  whirlMinRadiusPx: number;
}

export const DEFAULT_GESTURE_CONFIG: GestureConfig = {
  longPressMs: 550,
  tapSlopPx: 16,
  dragPx: 60,
  dragVerticalRatio: 1.3,
  tapConfirmMs: 380,
  rapidTapCount: 4,
  rapidTapWindowMs: 1200,
  whirlRadians: 5,
  whirlMinRadiusPx: 25,
};

export interface Point {
  x: number;
  y: number;
}

export interface GestureClock {
  now(): number;
  setTimeout(fn: () => void, ms: number): unknown;
  clearTimeout(handle: unknown): void;
}

const systemClock: GestureClock = {
  now: () => Date.now(),
  setTimeout: (fn, ms) => globalThis.setTimeout(fn, ms),
  clearTimeout: (h) => globalThis.clearTimeout(h as ReturnType<typeof setTimeout>),
};

interface Stroke {
  start: Point;
  startTime: number;
  centre: Point;
  last: Point;
  lastAngle: number;
  angle: number;
  travel: number;
  done: boolean;
}

export class GestureRecognizer {
  private stroke: Stroke | null = null;
  private taps: number[] = [];
  private tapTimer: unknown = null;
  private readonly config: GestureConfig;

  constructor(
    private readonly onGesture: (g: GestureId) => void,
    config: Partial<GestureConfig> = {},
    private readonly clock: GestureClock = systemClock,
  ) {
    this.config = { ...DEFAULT_GESTURE_CONFIG, ...config };
  }

  /** `centre` is the centre of the character's bounding box. */
  down(p: Point, centre: Point) {
    this.stroke = {
      start: p,
      startTime: this.clock.now(),
      centre,
      last: p,
      lastAngle: Math.atan2(p.y - centre.y, p.x - centre.x),
      angle: 0,
      travel: 0,
      done: false,
    };
  }

  move(p: Point) {
    const s = this.stroke;
    if (!s || s.done) return;
    s.travel += Math.hypot(p.x - s.last.x, p.y - s.last.y);
    s.last = p;

    const a = Math.atan2(p.y - s.centre.y, p.x - s.centre.x);
    let d = a - s.lastAngle;
    if (d > Math.PI) d -= 2 * Math.PI;
    if (d < -Math.PI) d += 2 * Math.PI;
    if (Math.hypot(p.x - s.centre.x, p.y - s.centre.y) > this.config.whirlMinRadiusPx) s.angle += d;
    s.lastAngle = a;

    if (Math.abs(s.angle) > this.config.whirlRadians) {
      s.done = true;
      this.emit('whirl');
    }
  }

  up(p: Point) {
    const s = this.stroke;
    this.stroke = null;
    if (!s || s.done) return;
    const c = this.config;
    const dx = p.x - s.start.x;
    const dy = p.y - s.start.y;
    const duration = this.clock.now() - s.startTime;

    if (Math.abs(dy) > c.dragPx && Math.abs(dy) > Math.abs(dx) * c.dragVerticalRatio) {
      this.emit('drift');
      return;
    }
    if (s.travel >= c.tapSlopPx) return;
    if (duration > c.longPressMs) {
      this.emit('nestle');
      return;
    }

    const now = this.clock.now();
    this.taps = this.taps.filter((t) => now - t < c.rapidTapWindowMs);
    this.taps.push(now);
    this.clearTapTimer();
    if (this.taps.length >= c.rapidTapCount) {
      this.taps = [];
      this.emit('tremble');
      return;
    }
    this.tapTimer = this.clock.setTimeout(() => {
      this.tapTimer = null;
      if (this.taps.length) {
        this.taps = [];
        this.emit('hop');
      }
    }, c.tapConfirmMs);
  }

  cancel() {
    this.stroke = null;
  }

  dispose() {
    this.clearTapTimer();
    this.stroke = null;
    this.taps = [];
  }

  private clearTapTimer() {
    if (this.tapTimer !== null) this.clock.clearTimeout(this.tapTimer);
    this.tapTimer = null;
  }

  private emit(g: GestureId) {
    this.onGesture(g);
  }
}
