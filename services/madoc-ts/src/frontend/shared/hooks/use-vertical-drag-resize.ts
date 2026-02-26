import { useCallback, type MouseEvent as ReactMouseEvent } from 'react';

type UseVerticalDragResizeOptions = {
  onStart?: (event: ReactMouseEvent<HTMLDivElement>) => boolean | void;
  onDrag: (deltaY: number, event: MouseEvent) => void;
  onEnd?: () => void;
};

export function useVerticalDragResize(options: UseVerticalDragResizeOptions) {
  const { onStart, onDrag, onEnd } = options;

  return useCallback(
    (event: ReactMouseEvent<HTMLDivElement>) => {
      event.preventDefault();

      if (onStart?.(event) === false) {
        return;
      }

      const startY = event.clientY;
      const onMove = (moveEvent: MouseEvent) => {
        onDrag(moveEvent.clientY - startY, moveEvent);
      };
      const onUp = () => {
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
        onEnd?.();
      };

      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
    },
    [onDrag, onEnd, onStart]
  );
}
