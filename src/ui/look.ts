import type { CharacterDefinition, Effect, Palette, PlayState, ResolvedForm, Shape } from '../core';
import { getPlace } from '../core';

/** Everything needed to draw the character in its current world. */
export interface Look {
  palette: Palette;
  shape: Shape;
  effects: Effect[];
  friendTop: string;
  friendBottom: string;
  backgroundSize?: string;
  halfAnimation?: string;
  /** Hidden forms ignore the season filter so their colours stay exact. */
  seasonal: boolean;
}

export function lookFor(def: CharacterDefinition, play: PlayState, form: ResolvedForm): Look {
  const place = getPlace(def, play.place);
  const base: Look = {
    palette: place.palette,
    shape: def.shapes[play.touch ?? 'base'] ?? def.shapes.base!,
    effects: [],
    friendTop: '#FFFFFF',
    friendBottom: '#F3D46B',
    seasonal: true,
  };
  if (form.kind !== 'hidden') return base;

  const { look, shape, effects } = form.hidden;
  return {
    palette: { ...place.palette, ...stripUndefined(look) },
    shape: def.shapes[shape] ?? base.shape,
    effects: effects ?? [],
    friendTop: look.friendTop ?? base.friendTop,
    friendBottom: look.friendBottom ?? base.friendBottom,
    backgroundSize: look.backgroundSize,
    halfAnimation: look.halfAnimation,
    seasonal: false,
  };
}

function stripUndefined(look: Partial<Palette>): Partial<Palette> {
  const out: Partial<Palette> = {};
  for (const k of ['top', 'bottom', 'accent', 'sky', 'ground'] as const) {
    if (look[k] !== undefined) out[k] = look[k];
  }
  return out;
}
