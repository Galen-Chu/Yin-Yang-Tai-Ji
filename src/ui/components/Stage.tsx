import type { CSSProperties } from 'react';
import { type CharacterDefinition, getItem, getPlace, getSeason } from '../../core';
import type { Game } from '../hooks/useGame';
import { useGestures } from '../hooks/useGestures';
import { inline, useLang } from '../i18n';
import type { Look } from '../look';
import { TaijiFigure } from './TaijiFigure';

/** Fixed scatter positions (left %, top %) for particle effects. */
const DOTS: [number, number][] = [
  [8, 22], [18, 64], [27, 38], [36, 80], [44, 16], [55, 58], [63, 30], [72, 74],
  [80, 44], [89, 20], [93, 66], [13, 44], [50, 86], [68, 10], [84, 86], [31, 12],
];
const PASTEL = ['#FFC7D9', '#FFE1A8', '#C9EBC0', '#BFDDF7', '#E2CCF5', '#FFD3BD'];

function particles(look: Look): CSSProperties[] {
  if (look.effects.includes('fireflies')) {
    return DOTS.map(([x, y], i) => ({
      left: `${x}%`,
      top: `${y}%`,
      width: 6 + (i % 3) * 2,
      height: 6 + (i % 3) * 2,
      background: '#FFF59A',
      boxShadow: '0 0 10px 3px rgba(255,240,120,.8)',
      animation: `tj-twinkle ${1.4 + (i % 5) * 0.35}s ease-in-out ${(i * 0.27) % 2}s infinite`,
    }));
  }
  if (look.effects.includes('confetti')) {
    return DOTS.map(([x, y], i) => ({
      left: `${x}%`,
      top: `${y}%`,
      width: 10 + (i % 4) * 5,
      height: 10 + (i % 4) * 5,
      background: PASTEL[i % PASTEL.length],
      opacity: 0.85,
      animation: `tj-float ${3 + (i % 4) * 0.6}s ease-in-out ${(i * 0.3) % 2}s infinite`,
    }));
  }
  return [];
}

const BADGE_POS: CSSProperties[] = [
  { top: -8, right: -8 },
  { bottom: -8, left: -8 },
];

export function Stage({ def, game, look }: { def: CharacterDefinition; game: Game; look: Look }) {
  const lang = useLang();
  const { play } = game.state;
  const place = getPlace(def, play.place);
  const season = getSeason(def, play.season);
  const { handlers, pressing } = useGestures(
    (gesture) => game.dispatch({ type: 'touch', gesture }),
    game.touchActivity,
  );
  const { palette } = look;
  const pressTransform = `${play.friend ? 'scale(.72) ' : ''}${pressing ? 'scale(1.05,.93)' : ''}` || 'none';

  return (
    <div
      className="stage"
      style={{ background: palette.sky, filter: look.seasonal ? season.filter : 'none' }}
    >
      <div className="stage-ground" style={{ background: palette.ground }} />
      <div className="stage-tint" style={{ background: season.tint }} />

      <div className="stage-badges">
        <span className="pill">{inline(place.name, lang)}</span>
        <span className="pill">{inline(season.name, lang)}</span>
      </div>

      {game.toast && (
        <div className="toast" role="status">
          {inline(game.toast, lang, ' · ')}
        </div>
      )}

      {particles(look).map((style, i) => (
        <span key={i} className="particle" style={style} />
      ))}

      {look.effects.includes('storm-ring') && (
        <>
          <span className="storm-ring storm-ring-outer" />
          <span className="storm-ring storm-ring-inner" />
        </>
      )}

      <div className="stage-centre" style={{ gap: play.friend && play.touch !== 'nestle' ? 24 : 0 }}>
        <div
          className="touch-target"
          {...handlers}
          style={{ transform: pressTransform, paddingInline: play.friend ? 6 : 30 }}
          role="img"
          aria-label={inline(def.name, lang)}
        >
          <div className="figure-wrap">
            <TaijiFigure
              shape={look.shape}
              top={palette.top}
              bottom={palette.bottom}
              accent={palette.accent}
              backgroundSize={look.backgroundSize}
              halfAnimation={look.halfAnimation}
            />
            {play.carried.map((id, i) => (
              <span key={id} className="item-badge" style={BADGE_POS[i]}>
                {getItem(def, id).glyph}
              </span>
            ))}
          </div>
        </div>

        {play.friend && (
          <div className="friend">
            <span className="friend-top" style={{ background: look.friendTop }} />
            <span className="friend-bottom" style={{ background: look.friendBottom }} />
          </div>
        )}
      </div>

      <div className="stage-hint">Tap · hold · drag up/down · rapid-tap · draw a circle</div>
    </div>
  );
}
