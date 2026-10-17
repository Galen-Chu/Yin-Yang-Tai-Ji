import { type CharacterDefinition, getItem, itemsAt } from '../../core';
import type { Game } from '../hooks/useGame';
import { Bi, inline, t, useLang } from '../i18n';
import { Swatch } from './TaijiFigure';

interface Props {
  def: CharacterDefinition;
  game: Game;
}

function SectionLabel({ n, title, note }: { n: number; title: string; note: string }) {
  return (
    <div className="section-label">
      {n} · {title} <span className="muted">— {note}</span>
    </div>
  );
}

/** Layer 2 — button alternatives to the gestures (also the keyboard path). */
export function TouchPicker({ def, game }: Props) {
  const { touch } = game.state.play;
  return (
    <div className="stack">
      <SectionLabel n={2} title="Touch 觸碰" note="poke the character, or pick below" />
      <div className="touch-row">
        {def.touches.map((x) => (
          <button
            key={x.id}
            className="btn touch-btn"
            aria-pressed={touch === x.id}
            onClick={() => game.dispatch({ type: 'touch', gesture: x.id })}
          >
            <Bi text={x.name} className="touch-name" />
            <Bi text={x.gesture} className="touch-gesture" />
          </button>
        ))}
      </div>
    </div>
  );
}

/** Layer 3 — season tints the whole world. */
export function SeasonPicker({ def, game }: Props) {
  const lang = useLang();
  const { season } = game.state.play;
  return (
    <div className="stack">
      <SectionLabel n={3} title="Season 季節" note="tints the world" />
      <div className="season-row">
        {def.seasons.map((s) => (
          <button
            key={s.id}
            className="btn pill-btn"
            aria-pressed={season === s.id}
            onClick={() => game.dispatch({ type: 'setSeason', seasonId: s.id })}
          >
            {inline(s.name, lang)}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Layer 5 (friends) plus the return-to-base path. */
export function CompanionControls({ game }: Pick<Props, 'game'>) {
  const lang = useLang();
  const { friend } = game.state.play;
  return (
    <div className="row-wrap">
      <button className="btn wide-btn" aria-pressed={friend} onClick={() => game.dispatch({ type: 'toggleFriend' })}>
        {inline(friend ? t('Friend is here ✓', '朋友在 ✓') : t('Invite a friend', '找朋友'), lang)}
      </button>
      <button className="btn wide-btn" onClick={() => game.dispatch({ type: 'rest' })}>
        {inline(t('Rest · back to base', '回原形'), lang)}
      </button>
    </div>
  );
}

/** Layer 1 — place changes material and colour. */
export function PlacePicker({ def, game }: Props) {
  const { place } = game.state.play;
  return (
    <div className="stack">
      <SectionLabel n={1} title="Place 地點" note="changes material" />
      <div className="place-grid">
        {def.places.map((p) => (
          <button
            key={p.id}
            className="btn place-btn"
            aria-pressed={place === p.id}
            onClick={() => game.dispatch({ type: 'setPlace', placeId: p.id })}
          >
            <Swatch top={p.palette.top} bottom={p.palette.bottom} />
            <span className="place-name">
              {p.name.zh}
              <br />
              <span className="muted small">{p.name.en}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

/** Layer 4 — items found at the current place, check-in, and carry slots. */
export function ItemPanel({ def, game }: Props) {
  const lang = useLang();
  const { play, progress } = game.state;
  const here = itemsAt(def, play.place);
  const foundHere = here.filter((i) => progress.collected.includes(i.id)).length;
  const allFound = foundHere >= here.length;
  const placeName = def.places.find((p) => p.id === play.place)!.name;

  return (
    <div className="stack">
      <div className="space-between">
        <SectionLabel n={4} title="Items 收集物" note="found here" />
        <span className="muted small bold">
          {progress.collected.length} / {def.items.length}
        </span>
      </div>

      <div className="item-grid">
        {here.map((i) => {
          const got = progress.collected.includes(i.id);
          return (
            <button
              key={i.id}
              className={`btn item-btn${got ? '' : ' locked'}`}
              aria-pressed={play.carried.includes(i.id)}
              onClick={() => game.dispatch({ type: 'toggleCarry', itemId: i.id })}
            >
              <span className="glyph">{got ? i.glyph : '？'}</span>
              <span className="item-name">{got ? i.name.zh : '？？'}</span>
              <span className="muted tiny">{got ? i.name.en : 'Not found yet'}</span>
            </button>
          );
        })}
      </div>

      <button className={`btn check-in${allFound ? ' done' : ''}`} onClick={() => game.dispatch({ type: 'checkIn' })}>
        {allFound
          ? inline(t(`All found at ${placeName.en} (${foundHere}/${here.length})`, `${placeName.zh}都找到了`), lang, ' · ')
          : inline(t(`Check in at ${placeName.en} (${foundHere}/${here.length})`, `在${placeName.zh}打卡`), lang, ' · ')}
      </button>

      <div className="row-wrap carry-row">
        <span className="muted small bold">Carrying 帶著</span>
        {Array.from({ length: def.rules.maxCarried }, (_, k) => {
          const id = play.carried[k];
          if (!id) {
            return (
              <span key={k} className="carry-slot empty">
                <span className="carry-dot" />
                Empty 空
              </span>
            );
          }
          const item = getItem(def, id);
          return (
            <button key={k} className="carry-slot" onClick={() => game.dispatch({ type: 'toggleCarry', itemId: id })}>
              <span className="carry-dot filled">{item.glyph}</span>
              {item.name.zh} ×
            </button>
          );
        })}
      </div>
    </div>
  );
}
