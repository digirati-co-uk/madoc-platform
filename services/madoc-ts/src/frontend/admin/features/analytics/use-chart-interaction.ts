import { KeyboardEvent, PointerEvent, useState } from 'react';

/** One keyboard stop per chart; pointer and keyboard selection share the same detail. */
export function useChartInteraction(count: number, points = false) {
  const [pointerIndex, setPointerIndex] = useState<number | null>(null);
  const [keyboardIndex, setKeyboardIndex] = useState<number | null>(null);
  const selected = pointerIndex ?? keyboardIndex;
  const activeIndex = selected === null || count === 0 ? null : Math.min(selected, count - 1);

  function selectPointer(event: PointerEvent<SVGSVGElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    if (!count || !rect.width) return;
    const fraction = (event.clientX - rect.left) / rect.width;
    const index = points ? Math.round(fraction * (count - 1)) : Math.floor(fraction * count);
    setPointerIndex(Math.max(0, Math.min(index, count - 1)));
  }

  function onKeyDown(event: KeyboardEvent<SVGSVGElement>) {
    if (!count) return;
    const current = activeIndex ?? 0;
    let next: number | null;
    switch (event.key) {
      case 'ArrowRight':
        next = Math.min(current + 1, count - 1);
        break;
      case 'ArrowLeft':
        next = Math.max(current - 1, 0);
        break;
      case 'Home':
        next = 0;
        break;
      case 'End':
        next = count - 1;
        break;
      case 'Escape':
        next = null;
        break;
      default:
        return;
    }
    event.preventDefault();
    setPointerIndex(null);
    setKeyboardIndex(next);
  }

  return {
    activeIndex,
    handlers: {
      onPointerMove: selectPointer,
      onPointerDown: selectPointer,
      onPointerLeave: (event: PointerEvent<SVGSVGElement>) => {
        if (event.pointerType !== 'touch') setPointerIndex(null);
      },
      onFocus: () => setKeyboardIndex(0),
      onBlur: () => {
        setPointerIndex(null);
        setKeyboardIndex(null);
      },
      onKeyDown,
    },
  };
}
