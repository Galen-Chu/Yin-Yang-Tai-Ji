import type { CSSProperties } from 'react';
import type { Shape } from '../../core';

export interface FigureProps {
  shape: Shape;
  top: string;
  bottom: string;
  accent: string;
  /** Outline and eye colour. */
  line?: string;
  /** 1 = full stage size. */
  scale?: number;
  /** Cloud highlights, sponge holes and blush. Off for small thumbnails. */
  detailed?: boolean;
  backgroundSize?: string;
  halfAnimation?: string;
}

/** Sponge holes as [left %, top %, width px, height px]. */
const HOLES: [number, number, number, number][] = [
  [14, 26, 14, 14],
  [26, 58, 20, 18],
  [46, 44, 12, 12],
  [58, 70, 16, 14],
  [74, 34, 18, 16],
];

/**
 * The base silhouette: a circle split into Cloudie (top) and Spongie
 * (bottom), one eye in each half. This never changes — layers only recolour,
 * reshape and accessorise it.
 */
export function TaijiFigure({
  shape,
  top,
  bottom,
  accent,
  line = 'var(--ink)',
  scale = 1,
  detailed = true,
  backgroundSize,
  halfAnimation,
}: FigureProps) {
  const offset = Math.round((shape.offset ?? 0) * scale);
  const eyeScale = scale < 1 ? 0.7 : 1;
  const vars = {
    '--w': `${Math.round(shape.width * scale)}px`,
    '--hh': `${Math.round((shape.height * scale) / 2)}px`,
    '--gap': `${Math.round(shape.gap * scale)}px`,
    '--eye-w': `${Math.max(5, Math.round(shape.eyeWidth * eyeScale))}px`,
    '--eye-h': `${Math.max(3, Math.round(shape.eyeHeight * eyeScale))}px`,
    '--eye-inset': `${scale < 1 ? 7 : 12}px`,
    '--line': line,
    '--stroke': `${scale < 1 ? 2.5 : 3}px`,
    animation: shape.animation,
  } as CSSProperties;
  const half = (bg: string, dx: number): CSSProperties => ({
    background: bg,
    backgroundSize,
    animation: halfAnimation,
    transform: `translateX(${dx}px)`,
  });

  return (
    <div className="figure" style={vars}>
      <div className="figure-half figure-top" style={half(top, -offset)}>
        {detailed && (
          <>
            <span className="cloud-puff cloud-puff-a" />
            <span className="cloud-puff cloud-puff-b" />
          </>
        )}
        <span className="eye eye-top" />
      </div>
      <div className="figure-half figure-bottom" style={half(bottom, offset)}>
        <span className="eye eye-bottom" />
        {detailed && (
          <>
            {HOLES.map(([l, t, w, h], i) => (
              <span key={i} className="hole" style={{ left: `${l}%`, top: `${t}%`, width: w, height: h, background: accent }} />
            ))}
            <span className="blush blush-left" />
            <span className="blush blush-right" />
          </>
        )}
      </div>
    </div>
  );
}

/** Tiny two-block swatch used in pickers and dex cells. */
export function Swatch({ top, bottom, size = 26, line = 'var(--ink)' }: { top: string; bottom: string; size?: number; line?: string }) {
  const h = size / 2;
  return (
    <span className="swatch" style={{ width: size }} aria-hidden>
      <span style={{ height: h, background: top, borderColor: line, borderRadius: `${h}px ${h}px 0 0` }} />
      <span style={{ height: h, background: bottom, borderColor: line, borderTop: 'none', borderRadius: `0 0 ${h}px ${h}px` }} />
    </span>
  );
}
