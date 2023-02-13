import React, { useCallback, KeyboardEvent, useRef } from 'react';

export function useKeyboardListNavigation<E extends HTMLElement>(indexProperty: string) {
  const ref = useRef<E>(null);
  const next = (current: number) => {
    const d = ref?.current || document;
    const nextFound = d.querySelector(`[${indexProperty}="${current + 1}"]`) as HTMLElement;
    if (nextFound) {
      nextFound.focus();
    }
  };
  const previous = (current: number) => {
    if (current) {
      const d = ref?.current || document;
      const prevFound = d.querySelector(`[${indexProperty}="${current - 1}"]`) as HTMLElement;
      if (prevFound) {
        prevFound.focus();
      }
    }
  };

  const onKeyUp = useCallback(
    (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
        case 'ArrowRight': {
          const current = parseInt((e.target as HTMLElement).getAttribute(indexProperty) || '', 10);
          if (!Number.isNaN(current)) {
            next(current);
          }
          break;
        }
        case 'ArrowUp':
        case 'ArrowLeft': {
          const current = parseInt((e.target as HTMLElement).getAttribute(indexProperty) || '', 10);
          if (!Number.isNaN(current)) {
            previous(current);
          }
          break;
        }
      }
    },
    [indexProperty]
  );

  return { ref, onKeyUp };
}
