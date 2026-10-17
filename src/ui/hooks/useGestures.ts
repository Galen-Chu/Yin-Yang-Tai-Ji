import { type PointerEvent, useEffect, useMemo, useRef, useState } from 'react';
import { type GestureId, GestureRecognizer } from '../../core';

/** Binds a GestureRecognizer to an element's pointer events. */
export function useGestures(onGesture: (g: GestureId) => void, onActivity?: () => void) {
  const callback = useRef(onGesture);
  useEffect(() => {
    callback.current = onGesture;
  }, [onGesture]);

  const recognizer = useMemo(() => new GestureRecognizer((g) => callback.current(g)), []);
  useEffect(() => () => recognizer.dispose(), [recognizer]);

  const [pressing, setPressing] = useState(false);

  const handlers = {
    onPointerDown(e: PointerEvent<HTMLElement>) {
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        // Some browsers refuse capture for synthetic events.
      }
      const r = e.currentTarget.getBoundingClientRect();
      recognizer.down({ x: e.clientX, y: e.clientY }, { x: r.left + r.width / 2, y: r.top + r.height / 2 });
      onActivity?.();
      setPressing(true);
    },
    onPointerMove(e: PointerEvent<HTMLElement>) {
      recognizer.move({ x: e.clientX, y: e.clientY });
    },
    onPointerUp(e: PointerEvent<HTMLElement>) {
      recognizer.up({ x: e.clientX, y: e.clientY });
      setPressing(false);
    },
    onPointerCancel() {
      recognizer.cancel();
      setPressing(false);
    },
  };

  return { handlers, pressing };
}
