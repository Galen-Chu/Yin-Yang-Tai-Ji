/**
 * Character-agnostic types for the Changing-Character System (變身角色系統).
 *
 * The framework is a fixed recipe of layers — Place, Touch, Season, Items,
 * Others — and each character fills those slots with its own content.
 * Nothing in `core/` knows about TaiJi specifically.
 */

/** Bilingual text. The UI decides whether to show en, zh or both. */
export interface Text {
  en: string;
  zh: string;
}

/** Colours applied to the two halves of the character and its world. */
export interface Palette {
  /** Top half fill (e.g. Cloudie 綿雲). Any CSS background value. */
  top: string;
  /** Bottom half fill (e.g. Spongie 海綿). Any CSS background value. */
  bottom: string;
  /** Accent used for texture details such as sponge holes. */
  accent: string;
  sky: string;
  ground: string;
}

/** Layer 1 · Environment 環境 — changes material & colour. */
export interface Place {
  id: string;
  name: Text;
  /** Prefix used in form names, e.g. "Ridge" / "山巒". */
  prefix: Text;
  /** Material phrase used in form descriptions, e.g. "olive-ridge" / "山巒般". */
  material: Text;
  palette: Palette;
}

/** Layer 2 · Touch + Mood 觸碰＋情緒 — changes shape, posture, eyes. */
export interface Touch {
  id: GestureId;
  /** Suffix used in form names, e.g. "Hop" / "跳跳". */
  name: Text;
  /** How the user performs it, e.g. "Tap" / "輕點". */
  gesture: Text;
  /** The coping trait this touch expresses. */
  trait: Text;
}

/** Layer 3 · Time 時間 — tints the world and adds one trait line. */
export interface Season {
  id: string;
  name: Text;
  note: Text;
  /** CSS colour laid over the stage. */
  tint: string;
  /** CSS filter applied to the stage. */
  filter: string;
}

/** Layer 4 · Items 收集物 — accessories only, never the body. */
export interface Item {
  id: string;
  placeId: string;
  name: Text;
  /** Single-character glyph shown on the badge. */
  glyph: string;
  trait: Text;
}

/** Visual effects a hidden form may switch on. */
export type Effect = 'storm-ring' | 'fireflies' | 'confetti';

/**
 * Declarative unlock condition for a hidden form. Every specified field must
 * match; unspecified fields are ignored.
 */
export interface HiddenCondition {
  place?: string;
  season?: string;
  touch?: GestureId;
  /** All of these items must be carried. */
  items?: string[];
  friend?: boolean;
  /** The most recent touches must equal this sequence (oldest → newest). */
  sequence?: GestureId[];
  /** These hidden forms must already be discovered (chained unlocks). */
  requires?: string[];
}

/** Layer 5 · Others 互動 — rare cross-layer combos unlock hidden forms. */
export interface HiddenForm {
  id: string;
  name: Text;
  line: Text;
  /** Shown after discovery. */
  hint: Text;
  /** Shown before discovery. */
  riddle: Text;
  /** Key into the character's shape table. */
  shape: string;
  look: Partial<Palette> & {
    friendTop?: string;
    friendBottom?: string;
    /** Extra CSS for animated textures on the halves. */
    backgroundSize?: string;
    halfAnimation?: string;
  };
  effects?: Effect[];
  when: HiddenCondition;
}

/** Body proportions and motion for a form. Units are px at full scale. */
export interface Shape {
  width: number;
  height: number;
  /** Vertical gap between halves (drift / split forms). */
  gap: number;
  /** Horizontal offset between halves. */
  offset?: number;
  animation: string;
  eyeWidth: number;
  eyeHeight: number;
}

export type GestureId = 'hop' | 'nestle' | 'drift' | 'tremble' | 'whirl';

/** Everything that defines one changing character. */
export interface CharacterDefinition {
  id: string;
  name: Text;
  tagline: Text;
  places: Place[];
  touches: Touch[];
  seasons: Season[];
  items: Item[];
  /** Ordered by priority: the first matching hidden form wins. */
  hidden: HiddenForm[];
  /** Keyed by touch id, hidden-form shape key, and `base`. */
  shapes: Record<string, Shape>;
  rules: {
    /** How many items may be carried at once. */
    maxCarried: number;
    /** Seconds of inactivity before the character settles back to base. 0 = never. */
    idleSeconds: number;
    /** Length of touch history kept for sequence unlocks. */
    historyLength: number;
  };
  defaults: {
    place: string;
    season: string;
  };
  /** Sentence builders, so each character can phrase forms in its own voice. */
  describe: {
    formName(place: Place, touch: Touch): Text;
    formLine(place: Place, touch: Touch): Text;
    baseLine(place: Place): Text;
    seasonLine(season: Season): Text;
    itemLine(item: Item): Text;
  };
}

/** What the character is doing right now. Not persisted. */
export interface PlayState {
  place: string;
  season: string;
  touch: GestureId | null;
  carried: string[];
  friend: boolean;
  /** Recent touches since the last place/season change, oldest → newest. */
  history: GestureId[];
}

/** What the player has collected. Persisted. */
export interface Progress {
  /** Discovered form keys (see `formKey` / `hiddenKey`). */
  discovered: string[];
  /** Collected item ids. */
  collected: string[];
}

export interface GameState {
  play: PlayState;
  progress: Progress;
}

/** The form currently shown, resolved from PlayState. */
export type ResolvedForm =
  | { kind: 'base'; key: null }
  | { kind: 'form'; key: string; place: Place; touch: Touch }
  | { kind: 'hidden'; key: string; hidden: HiddenForm };
