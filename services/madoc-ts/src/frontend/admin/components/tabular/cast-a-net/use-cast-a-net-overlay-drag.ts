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

const isMoveModifierPressed = (event: { altKey: boolean; shiftKey: boolean }) => {
  return event.altKey && event.shiftKey;
};

// Keep a visible, non-zero separation even in fallback paths so lines
// never collapse onto each other in tight layouts.
const NON_CROSSING_GAP_PCT = 0.1;

const sanitizeLineIndexes = (indexes: number[] | undefined, max: number) => {
  if (!indexes?.length || max <= 0) {
    return [];
  }

  return Array.from(
    new Set(
      indexes.map(index => Math.floor(index)).filter(index => Number.isFinite(index) && index >= 0 && index < max)
    )
  ).sort((a, b) => a - b);
};

const clampSelectedLineDelta = (
  positions: number[],
  selectedIndexes: number[],
  requestedDelta: number,
  minGap: number
) => {
  if (!selectedIndexes.length) {
    return 0;
  }

  const selectedSet = new Set(selectedIndexes);
  let minDelta = Number.NEGATIVE_INFINITY;
  let maxDelta = Number.POSITIVE_INFINITY;
  let minDeltaNoGap = Number.NEGATIVE_INFINITY;
  let maxDeltaNoGap = Number.POSITIVE_INFINITY;

  for (const index of selectedIndexes) {
    const position = positions[index];
    if (position == null) {
      continue;
    }

    if (!selectedSet.has(index - 1)) {
      const previousPosition = index === 0 ? 0 : positions[index - 1];
      minDelta = Math.max(minDelta, previousPosition + minGap - position);
      minDeltaNoGap = Math.max(minDeltaNoGap, previousPosition + NON_CROSSING_GAP_PCT - position);
    }

    if (!selectedSet.has(index + 1)) {
      const nextPosition = index === positions.length - 1 ? 100 : positions[index + 1];
      maxDelta = Math.min(maxDelta, nextPosition - minGap - position);
      maxDeltaNoGap = Math.min(maxDeltaNoGap, nextPosition - NON_CROSSING_GAP_PCT - position);
    }
  }

  if (minDelta <= maxDelta) {
    return clamp(requestedDelta, minDelta, maxDelta);
  }

  if (minDeltaNoGap > maxDeltaNoGap) {
    return 0;
  }

  // If the preferred min gap cannot be preserved (very tight tables),
  // fall back to non-crossing bounds so outer lines remain draggable.
  return clamp(requestedDelta, minDeltaNoGap, maxDeltaNoGap);
};

const clampSingleLinePosition = (
  requestedPosition: number,
  previousPosition: number,
  nextPosition: number,
  minGap: number
) => {
  const lowerBound = previousPosition + minGap;
  const upperBound = nextPosition - minGap;

  if (lowerBound <= upperBound) {
    return clamp(requestedPosition, lowerBound, upperBound);
  }

  // If the preferred min gap cannot be preserved, allow movement within
  // non-crossing bounds so tightly packed outer lines still move.
  const nonCrossingLower = previousPosition + NON_CROSSING_GAP_PCT;
  const nonCrossingUpper = nextPosition - NON_CROSSING_GAP_PCT;
  if (nonCrossingLower <= nonCrossingUpper) {
    return clamp(requestedPosition, nonCrossingLower, nonCrossingUpper);
  }
  return clamp((previousPosition + nextPosition) / 2, previousPosition, nextPosition);
};

const normalizeNonCrossingPositions = (positions: number[], lineCount: number) => {
  const normalised = normalisePositions(positions, lineCount);
  if (normalised.length <= 1) {
    return normalised;
  }

  const spacing = Math.min(NON_CROSSING_GAP_PCT, 100 / Math.max(1, lineCount));
  const next = [...normalised];

  for (let index = 0; index < next.length; index++) {
    const previousPosition = index === 0 ? 0 : next[index - 1];
    next[index] = Math.max(next[index], previousPosition + spacing);
  }

  for (let index = next.length - 1; index >= 0; index--) {
    const followingPosition = index === next.length - 1 ? 100 : next[index + 1];
    next[index] = Math.min(next[index], followingPosition - spacing);
  }

  return next.map(position => clamp(position, 0, 100));
};

const getSafeGapRatio = (lineCount: number) => {
  const minGap = getLineMinGapPct(lineCount);
  return minGap / 100;
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
        rowPositions: normalizeNonCrossingPositions(next.rowPositions, rows),
        colPositions: normalizeNonCrossingPositions(next.colPositions, cols),
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

      // Keep image panning as the default; moving the net requires Alt+Shift + drag.
      if (mode === 'move' && !isMoveModifierPressed(event)) {
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

          const rowCount = Math.max(1, Math.floor(start.rows));
          const rowAbsolutePositions = projectPositionsToAbsolute(start.rowPositions, start.top, start.height);
          const firstRowAbsolute = rowAbsolutePositions[0];
          if (typeof firstRowAbsolute === 'number') {
            const gapRatio = getSafeGapRatio(rowCount);
            const denominator = Math.max(0.0001, 1 - gapRatio);
            const bottom = start.top + start.height;
            const maxTop = (firstRowAbsolute - gapRatio * bottom) / denominator;
            next.top = Math.min(next.top, maxTop);
            next.height = bottom - next.top;
          }
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

          const rowCount = Math.max(1, Math.floor(start.rows));
          const rowAbsolutePositions = projectPositionsToAbsolute(start.rowPositions, start.top, start.height);
          const lastRowAbsolute = rowAbsolutePositions[rowAbsolutePositions.length - 1];
          if (typeof lastRowAbsolute === 'number') {
            const gapRatio = getSafeGapRatio(rowCount);
            const denominator = Math.max(0.0001, 1 - gapRatio);
            const minHeight = (lastRowAbsolute - start.top) / denominator;
            next.height = Math.max(next.height, minHeight);
          }
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

          const colCount = Math.max(1, Math.floor(start.cols));
          const colAbsolutePositions = projectPositionsToAbsolute(start.colPositions, start.left, start.width);
          const firstColAbsolute = colAbsolutePositions[0];
          if (typeof firstColAbsolute === 'number') {
            const gapRatio = getSafeGapRatio(colCount);
            const denominator = Math.max(0.0001, 1 - gapRatio);
            const right = start.left + start.width;
            const maxLeft = (firstColAbsolute - gapRatio * right) / denominator;
            next.left = Math.min(next.left, maxLeft);
            next.width = right - next.left;
          }
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

          const colCount = Math.max(1, Math.floor(start.cols));
          const colAbsolutePositions = projectPositionsToAbsolute(start.colPositions, start.left, start.width);
          const lastColAbsolute = colAbsolutePositions[colAbsolutePositions.length - 1];
          if (typeof lastColAbsolute === 'number') {
            const gapRatio = getSafeGapRatio(colCount);
            const denominator = Math.max(0.0001, 1 - gapRatio);
            const minWidth = (lastColAbsolute - start.left) / denominator;
            next.width = Math.max(next.width, minWidth);
          }
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
          const safeHeight = Math.max(0.0001, start.height);
          const pointerInNet = clamp(((currentY - start.top) / safeHeight) * 100, 0, 100);
          const selectedRowIndexes = sanitizeLineIndexes(
            modeNow.selectedIndexes ?? [rowIndex],
            start.rowPositions.length
          );

          if (selectedRowIndexes.length <= 1) {
            const previousPosition = rowIndex === 0 ? 0 : start.rowPositions[rowIndex - 1];
            const nextPosition = rowIndex === start.rowPositions.length - 1 ? 100 : start.rowPositions[rowIndex + 1];
            next.rowPositions = [...start.rowPositions];
            next.rowPositions[rowIndex] = clampSingleLinePosition(pointerInNet, previousPosition, nextPosition, minGap);
            emitChange(next);
            return;
          }

          const startPointerInNet = clamp(((dragStartRef.current.y - start.top) / safeHeight) * 100, 0, 100);
          const requestedDelta = pointerInNet - startPointerInNet;
          const boundedDelta = clampSelectedLineDelta(start.rowPositions, selectedRowIndexes, requestedDelta, minGap);
          const selectedRowSet = new Set(selectedRowIndexes);
          next.rowPositions = start.rowPositions.map((position, index) =>
            selectedRowSet.has(index) ? position + boundedDelta : position
          );
          emitChange(next);
          return;
        }

        if (typeof modeNow === 'object' && modeNow.type === 'col') {
          const colIndex = modeNow.index;
          const colCount = Math.max(1, Math.floor(start.cols));
          const minGap = getLineMinGapPct(colCount);
          const safeWidth = Math.max(0.0001, start.width);
          const pointerInNet = clamp(((currentX - start.left) / safeWidth) * 100, 0, 100);
          const selectedColIndexes = sanitizeLineIndexes(
            modeNow.selectedIndexes ?? [colIndex],
            start.colPositions.length
          );

          if (selectedColIndexes.length <= 1) {
            const previousPosition = colIndex === 0 ? 0 : start.colPositions[colIndex - 1];
            const nextPosition = colIndex === start.colPositions.length - 1 ? 100 : start.colPositions[colIndex + 1];
            next.colPositions = [...start.colPositions];
            next.colPositions[colIndex] = clampSingleLinePosition(pointerInNet, previousPosition, nextPosition, minGap);
            emitChange(next);
            return;
          }

          const startPointerInNet = clamp(((dragStartRef.current.x - start.left) / safeWidth) * 100, 0, 100);
          const requestedDelta = pointerInNet - startPointerInNet;
          const boundedDelta = clampSelectedLineDelta(start.colPositions, selectedColIndexes, requestedDelta, minGap);
          const selectedColSet = new Set(selectedColIndexes);
          next.colPositions = start.colPositions.map((position, index) =>
            selectedColSet.has(index) ? position + boundedDelta : position
          );
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
