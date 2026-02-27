import {
  type MouseEvent as ReactMouseEvent,
  type MutableRefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import type { DragMode, NetConfig } from './types';
import { NET_OVERLAY_MIN_SIZE_PCT, clamp, getLineMinGapPct, getEffectivePositions, normalisePositions } from './utils';

type UseCastANetOverlayDragProps = {
  value: NetConfig;
  onChange: (next: NetConfig) => void;
  disabled: boolean;
};

type DragStart = {
  x: number;
  y: number;
  config: NetConfig;
  shiftKey: boolean;
};

type UseCastANetOverlayDragResult = {
  overlayRef: MutableRefObject<HTMLDivElement | null>;
  effectiveRowPositions: number[];
  effectiveColPositions: number[];
  startDrag: (mode: DragMode) => (event: ReactMouseEvent<SVGElement>) => void;
};

const projectPositionsToAbsolute = (positions: number[], start: number, size: number) => {
  return positions.map(position => start + (position / 100) * size);
};

const projectAbsoluteToPositions = (positions: number[], start: number, size: number) => {
  const safeSize = Math.max(0.0001, size);
  return positions.map(position => ((position - start) / safeSize) * 100);
};

export function useCastANetOverlayDrag({
  value,
  onChange,
  disabled,
}: UseCastANetOverlayDragProps): UseCastANetOverlayDragResult {
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const dragModeRef = useRef<DragMode>(null);
  const dragStartRef = useRef<DragStart | null>(null);
  const windowMoveHandlerRef = useRef<((event: MouseEvent) => void) | null>(null);
  const windowUpHandlerRef = useRef<((event: MouseEvent) => void) | null>(null);

  const emitChange = useCallback(
    (next: NetConfig) => {
      const minSize = NET_OVERLAY_MIN_SIZE_PCT;
      const top = clamp(next.top, 0, 100 - minSize);
      const left = clamp(next.left, 0, 100 - minSize);
      const width = clamp(next.width, minSize, 100 - left);
      const height = clamp(next.height, minSize, 100 - top);

      const rows = Math.max(1, Math.floor(next.rows));
      const cols = Math.max(1, Math.floor(next.cols));

      onChange({
        ...next,
        top,
        left,
        width,
        height,
        rows,
        cols,
        rowPositions: normalisePositions(next.rowPositions, rows),
        colPositions: normalisePositions(next.colPositions, cols),
      });
    },
    [onChange]
  );

  const effectiveRowPositions = useMemo(() => {
    return getEffectivePositions(value.rows, value.rowPositions);
  }, [value.rows, value.rowPositions]);

  const effectiveColPositions = useMemo(() => {
    return getEffectivePositions(value.cols, value.colPositions);
  }, [value.cols, value.colPositions]);

  const endDrag = useCallback(() => {
    dragModeRef.current = null;
    dragStartRef.current = null;

    if (windowMoveHandlerRef.current) {
      window.removeEventListener('mousemove', windowMoveHandlerRef.current);
      windowMoveHandlerRef.current = null;
    }
    if (windowUpHandlerRef.current) {
      window.removeEventListener('mouseup', windowUpHandlerRef.current);
      windowUpHandlerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (windowMoveHandlerRef.current) {
        window.removeEventListener('mousemove', windowMoveHandlerRef.current);
      }
      if (windowUpHandlerRef.current) {
        window.removeEventListener('mouseup', windowUpHandlerRef.current);
      }
    };
  }, []);

  const startDrag = useCallback(
    (mode: DragMode) => (event: ReactMouseEvent<SVGElement>) => {
      if (disabled) {
        return;
      }

      // Keep image panning as the default; moving the net requires Shift + drag.
      if (mode === 'move' && !event.shiftKey) {
        return;
      }

      event.preventDefault();

      const overlay = overlayRef.current;
      if (!overlay) {
        return;
      }

      const rect = overlay.getBoundingClientRect();
      const startX = ((event.clientX - rect.left) / rect.width) * 100;
      const startY = ((event.clientY - rect.top) / rect.height) * 100;

      dragModeRef.current = mode;
      dragStartRef.current = {
        x: startX,
        y: startY,
        config: {
          ...value,
          rowPositions: effectiveRowPositions,
          colPositions: effectiveColPositions,
        },
        shiftKey: event.shiftKey,
      };

      const onWindowMove = (moveEvent: MouseEvent) => {
        if (disabled) {
          return;
        }

        const activeOverlay = overlayRef.current;
        if (!activeOverlay || !dragModeRef.current || !dragStartRef.current) {
          return;
        }

        const rectNow = activeOverlay.getBoundingClientRect();
        const currentX = ((moveEvent.clientX - rectNow.left) / rectNow.width) * 100;
        const currentY = ((moveEvent.clientY - rectNow.top) / rectNow.height) * 100;

        const modeNow = dragModeRef.current;
        const start = dragStartRef.current.config;
        const dx = currentX - dragStartRef.current.x;
        const dy = currentY - dragStartRef.current.y;
        const next: NetConfig = { ...start };

        if (modeNow === 'move') {
          next.left = start.left + dx;
          next.top = start.top + dy;
          emitChange(next);
          return;
        }

        if (modeNow === 'resize-nw') {
          next.left = start.left + dx;
          next.top = start.top + dy;
          next.width = start.width - dx;
          next.height = start.height - dy;
          emitChange(next);
          return;
        }

        if (modeNow === 'resize-n') {
          next.top = start.top + dy;
          next.height = start.height - dy;
          next.rowPositions = projectAbsoluteToPositions(
            projectPositionsToAbsolute(start.rowPositions, start.top, start.height),
            next.top,
            next.height
          );
          emitChange(next);
          return;
        }

        if (modeNow === 'resize-s') {
          next.height = start.height + dy;
          next.rowPositions = projectAbsoluteToPositions(
            projectPositionsToAbsolute(start.rowPositions, start.top, start.height),
            next.top,
            next.height
          );
          emitChange(next);
          return;
        }

        if (modeNow === 'resize-w') {
          next.left = start.left + dx;
          next.width = start.width - dx;
          next.colPositions = projectAbsoluteToPositions(
            projectPositionsToAbsolute(start.colPositions, start.left, start.width),
            next.left,
            next.width
          );
          emitChange(next);
          return;
        }

        if (modeNow === 'resize-e') {
          next.width = start.width + dx;
          next.colPositions = projectAbsoluteToPositions(
            projectPositionsToAbsolute(start.colPositions, start.left, start.width),
            next.left,
            next.width
          );
          emitChange(next);
          return;
        }

        if (modeNow === 'resize-ne') {
          next.top = start.top + dy;
          next.width = start.width + dx;
          next.height = start.height - dy;
          emitChange(next);
          return;
        }

        if (modeNow === 'resize-sw') {
          next.left = start.left + dx;
          next.width = start.width - dx;
          next.height = start.height + dy;
          emitChange(next);
          return;
        }

        if (modeNow === 'resize-se') {
          next.width = start.width + dx;
          next.height = start.height + dy;
          emitChange(next);
          return;
        }

        if (typeof modeNow === 'object' && modeNow.type === 'row') {
          const rowIndex = modeNow.index;
          const rowCount = Math.max(1, Math.floor(start.rows));
          const minGap = getLineMinGapPct(rowCount);
          const pointerInNet = clamp(((currentY - start.top) / start.height) * 100, 0, 100);

          if (!dragStartRef.current.shiftKey) {
            const prev = rowIndex === 0 ? 0 : start.rowPositions[rowIndex - 1];
            const nextPos = rowIndex === start.rowPositions.length - 1 ? 100 : start.rowPositions[rowIndex + 1];
            next.rowPositions = [...start.rowPositions];
            next.rowPositions[rowIndex] = clamp(pointerInNet, prev + minGap, nextPos - minGap);
            emitChange(next);
            return;
          }

          if (rowCount <= 1) {
            return;
          }

          const k = rowIndex + 1;
          let step = pointerInNet / k;
          const maxStep = (100 - minGap) / (rowCount - 1);
          step = clamp(step, minGap, maxStep);
          next.rowPositions = Array.from({ length: rowCount - 1 }, (_, index) => step * (index + 1));
          emitChange(next);
          return;
        }

        if (typeof modeNow === 'object' && modeNow.type === 'col') {
          const colIndex = modeNow.index;
          const colCount = Math.max(1, Math.floor(start.cols));
          const minGap = getLineMinGapPct(colCount);
          const pointerInNet = clamp(((currentX - start.left) / start.width) * 100, 0, 100);

          if (!dragStartRef.current.shiftKey) {
            const prev = colIndex === 0 ? 0 : start.colPositions[colIndex - 1];
            const nextPos = colIndex === start.colPositions.length - 1 ? 100 : start.colPositions[colIndex + 1];
            next.colPositions = [...start.colPositions];
            next.colPositions[colIndex] = clamp(pointerInNet, prev + minGap, nextPos - minGap);
            emitChange(next);
            return;
          }

          if (colCount <= 1) {
            return;
          }

          const k = colIndex + 1;
          let step = pointerInNet / k;
          const maxStep = (100 - minGap) / (colCount - 1);
          step = clamp(step, minGap, maxStep);
          next.colPositions = Array.from({ length: colCount - 1 }, (_, index) => step * (index + 1));
          emitChange(next);
        }
      };

      const onWindowUp = () => endDrag();

      if (windowMoveHandlerRef.current) {
        window.removeEventListener('mousemove', windowMoveHandlerRef.current);
      }
      if (windowUpHandlerRef.current) {
        window.removeEventListener('mouseup', windowUpHandlerRef.current);
      }

      windowMoveHandlerRef.current = onWindowMove;
      windowUpHandlerRef.current = onWindowUp;

      window.addEventListener('mousemove', onWindowMove);
      window.addEventListener('mouseup', onWindowUp);
    },
    [disabled, effectiveColPositions, effectiveRowPositions, emitChange, endDrag, value]
  );

  return {
    overlayRef,
    effectiveRowPositions,
    effectiveColPositions,
    startDrag,
  };
}
