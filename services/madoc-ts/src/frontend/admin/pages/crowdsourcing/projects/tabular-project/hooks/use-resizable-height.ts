import { useCallback, useState } from 'react';

interface ResizeBounds {
  min: number;
  max: number;
}

export function useResizableHeight(initialHeight: number, bounds: ResizeBounds) {
  const [height, setHeight] = useState(initialHeight);

  const startResize = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      event.preventDefault();
      const startY = event.clientY;
      const startHeight = height;

      const onMove = (moveEvent: MouseEvent) => {
        const delta = moveEvent.clientY - startY;
        const nextHeight = Math.max(bounds.min, Math.min(bounds.max, startHeight + delta));
        setHeight(nextHeight);
      };

      const onUp = () => {
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
      };

      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
    },
    [bounds.max, bounds.min, height]
  );

  return {
    height,
    setHeight,
    startResize,
  };
}
