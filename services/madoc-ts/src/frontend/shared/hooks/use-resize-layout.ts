import { useRef, useState } from 'react';
import { useEventHandler } from './use-event-handler';
import { useLocalStorage } from './use-local-storage';

function distance(x1: number, y1: number, x2: number, y2: number) {
  return Math.sqrt(Math.pow(Math.abs(x2 - x1), 2) + Math.pow(Math.abs(y2 - y1), 2));
}

function getMaxWidthPct(container: number, defaultMaxWidthPct: number, maxWidthPct?: number, maxWidthPixel?: number) {
  if (maxWidthPct) {
    return maxWidthPct;
  }

  if (maxWidthPixel) {
    return maxWidthPixel / container;
  }

  return defaultMaxWidthPct;
}

export function useResizeLayout(
  name: string,
  options: {
    left?: boolean;
    widthA?: any;
    widthB?: any;
    maxWidthPx?: number;
    maxWidthPct?: number;
    minWidthPx?: number;
    minWidthPct?: number;
    onDragEnd?: () => void;
  } = {}
) {
  const container = useRef<HTMLDivElement | undefined>(undefined);
  const resizableDiv = useRef<HTMLDivElement | undefined>(undefined);
  const otherDiv = useRef<HTMLDivElement | undefined>(undefined);
  const resizer = useRef<HTMLDivElement | undefined>(undefined);
  const newPct = useRef(0.5);
  const [isDragging, setIsDragging] = useState(false);
  const isEventDragging = useRef(false);
  const isEventTimeout = useRef(0);
  const startPos = useRef({ x: 0, y: 0 });
  const [{ widthA, widthB }, setWidths] = useLocalStorage(`resize-layout/${name}`, {
    widthA: options.widthA || '50%',
    widthB: options.widthB || '50%',
  });

  useEventHandler(resizer, 'mousedown', e => {
    startPos.current.x = e.pageX;
    startPos.current.y = e.pageY;
    if (isEventTimeout.current) {
      clearTimeout(isEventTimeout.current);
      isEventTimeout.current = 0;
    }
    isEventTimeout.current = setTimeout(() => {
      setIsDragging(true);
      isEventDragging.current = true;
    }, 350) as any;
  });

  useEventHandler({ current: typeof window !== 'undefined' ? window : undefined }, 'mouseup', () => {
    const current = container.current;
    if (current && isEventDragging.current) {
      const { x, width } = current.getBoundingClientRect();

      const maxWidthPct = getMaxWidthPct(width, 0.8, options.maxWidthPct, options.maxWidthPx) * width;
      const minWidthPct = getMaxWidthPct(width, 0.2, options.minWidthPct, options.minWidthPx) * width;

      if (options.left) {
        const newWidthB = newPct.current * width;

        setWidths({
          widthA: `${(1 - newPct.current) * width}px`,
          widthB: `${newWidthB > maxWidthPct ? maxWidthPct : newWidthB < minWidthPct ? minWidthPct : newWidthB}px`,
        });
      } else {
        const newWidthA = 1 - newPct.current * width;

        setWidths({
          widthA: `${newWidthA > maxWidthPct ? maxWidthPct : newWidthA < minWidthPct ? minWidthPct : newWidthA}px`,
          widthB: `${newPct.current * width}px`,
        });
      }

      setIsDragging(false);
      isEventDragging.current = false;
      if (options.onDragEnd) {
        options.onDragEnd();
      }
    }

    clearTimeout(isEventTimeout.current);
    isEventTimeout.current = 0;
  });

  useEventHandler(
    container,
    'mousemove',
    e => {
      if (!isEventDragging.current && isEventTimeout.current) {
        if (distance(startPos.current.x, startPos.current.y, e.pageX, e.pageY) > 20) {
          setIsDragging(true);
          isEventDragging.current = true;
          clearTimeout(isEventTimeout.current);
          isEventTimeout.current = 0;
        }
      }

      if (isEventDragging.current && resizableDiv.current) {
        const current = container.current;
        if (current) {
          const { x, width } = current.getBoundingClientRect();

          const isLeft = options.left || false;

          const maxWidthPct = getMaxWidthPct(width, 0.8, options.maxWidthPct, options.maxWidthPx);
          const minWidthPct = getMaxWidthPct(width, 0.2, options.minWidthPct, options.minWidthPx);

          newPct.current = (width + x - e.pageX - 5) / width;
          if (isLeft) {
            newPct.current = 1 - newPct.current;
          }
          newPct.current = newPct.current < minWidthPct ? minWidthPct : newPct.current;
          newPct.current = newPct.current > maxWidthPct ? maxWidthPct : newPct.current;

          resizableDiv.current.style.width = `${newPct.current * width}px`;
        }
      }
    },
    [isDragging]
  );

  return {
    refs: {
      container,
      resizer,
      resizableDiv,
      otherDiv,
    },
    setWidths,
    isDragging,
    widthA,
    widthB,
  };
}
