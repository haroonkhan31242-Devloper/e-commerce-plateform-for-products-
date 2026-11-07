import React, { useEffect, useRef } from 'react';

const SWIPE_DISTANCE_PX = 50;
const TRACKPAD_DISTANCE_PX = 60;
// A trackpad keeps sending momentum events after the fingers lift; this gap ends one gesture
const TRACKPAD_GESTURE_GAP_MS = 200;

type Direction = 1 | -1;

// Calls onStep(1) for a swipe left and onStep(-1) for a swipe right, by touch or trackpad.
// Attach `ref` and `pointerHandlers` to the element, and give it touch-action: pan-y so
// vertical page scrolling keeps working.
export const useSwipeNavigation = <T extends HTMLElement>(onStep: (direction: Direction) => void) => {
  const ref = useRef<T>(null);
  const onStepRef = useRef(onStep);
  onStepRef.current = onStep;

  const touchStart = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    let distance = 0;
    let lastEventAt = 0;
    let isGestureDone = false;

    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      // Without this a horizontal trackpad swipe can trigger browser back/forward
      e.preventDefault();

      if (e.timeStamp - lastEventAt > TRACKPAD_GESTURE_GAP_MS) {
        distance = 0;
        isGestureDone = false;
      }
      lastEventAt = e.timeStamp;
      if (isGestureDone) return;

      distance += e.deltaX;
      if (Math.abs(distance) >= TRACKPAD_DISTANCE_PX) {
        isGestureDone = true;
        onStepRef.current(distance > 0 ? 1 : -1);
      }
    };

    element.addEventListener('wheel', handleWheel, { passive: false });
    return () => element.removeEventListener('wheel', handleWheel);
  }, []);

  const pointerHandlers = {
    onPointerDown: (e: React.PointerEvent) => {
      // A mouse drag stays free for selecting text
      touchStart.current = e.pointerType === 'mouse' ? null : { x: e.clientX, y: e.clientY };
    },
    onPointerUp: (e: React.PointerEvent) => {
      const start = touchStart.current;
      touchStart.current = null;
      if (!start) return;

      const dx = e.clientX - start.x;
      const dy = e.clientY - start.y;
      if (Math.abs(dx) >= SWIPE_DISTANCE_PX && Math.abs(dx) > Math.abs(dy)) {
        onStepRef.current(dx < 0 ? 1 : -1);
      }
    },
    // The browser took the gesture over, usually to scroll the page
    onPointerCancel: () => {
      touchStart.current = null;
    },
  };

  return { ref, pointerHandlers };
};
