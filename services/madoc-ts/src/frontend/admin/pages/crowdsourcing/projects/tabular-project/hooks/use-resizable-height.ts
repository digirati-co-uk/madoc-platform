import { useRef, useState } from 'react';
import { useVerticalDragResize } from '../../../../../../shared/hooks/use-vertical-drag-resize';

interface ResizeBounds {
  min: number;
  max: number;
}

export function useResizableHeight(initialHeight: number, bounds: ResizeBounds) {
  const [height, setHeight] = useState(initialHeight);
  const startHeightRef = useRef(initialHeight);
  const startResize = useVerticalDragResize({
    onStart: () => {
      startHeightRef.current = height;
    },
    onDrag: deltaY => {
      const nextHeight = Math.max(bounds.min, Math.min(bounds.max, startHeightRef.current + deltaY));
      setHeight(nextHeight);
    },
  });

  return {
    height,
    setHeight,
    startResize,
  };
}
