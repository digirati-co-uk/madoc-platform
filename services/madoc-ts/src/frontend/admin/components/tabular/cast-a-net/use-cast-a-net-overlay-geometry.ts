import { useCallback, useMemo } from 'react';
import type { DragMode, NetConfig } from './types';
import { getStops } from './utils';

type ResizeHandleMode = Extract<DragMode, 'resize-nw' | 'resize-ne' | 'resize-sw' | 'resize-se'>;
type RowBounds = { top: number; bottom: number };

export type CastANetResizeHandle = {
  key: 'nw' | 'ne' | 'sw' | 'se';
  x: number;
  y: number;
  mode: ResizeHandleMode;
  cursor: 'nwse-resize' | 'nesw-resize';
};

type UseCastANetOverlayGeometryProps = {
  value: NetConfig;
  rowPositions: number[];
  colPositions: number[];
};

type UseCastANetOverlayGeometryResult = {
  rowStops: number[];
  colStops: number[];
  netLeft: number;
  netTop: number;
  netRight: number;
  netBottom: number;
  toCanvasX: (positionInNet: number) => number;
  toCanvasY: (positionInNet: number) => number;
  handleDefinitions: readonly CastANetResizeHandle[];
  getProjectedRowBounds: (rowIndex: number) => RowBounds | null;
};

export function useCastANetOverlayGeometry({
  value,
  rowPositions,
  colPositions,
}: UseCastANetOverlayGeometryProps): UseCastANetOverlayGeometryResult {
  const rowStops = useMemo(() => getStops(value.rows, rowPositions), [rowPositions, value.rows]);
  const colStops = useMemo(() => getStops(value.cols, colPositions), [colPositions, value.cols]);

  const netLeft = value.left;
  const netTop = value.top;
  const netRight = value.left + value.width;
  const netBottom = value.top + value.height;

  const toCanvasX = useCallback(
    (positionInNet: number) => {
      return netLeft + (positionInNet / 100) * value.width;
    },
    [netLeft, value.width]
  );

  const toCanvasY = useCallback(
    (positionInNet: number) => {
      return netTop + (positionInNet / 100) * value.height;
    },
    [netTop, value.height]
  );

  const projectedBodyRowHeight = useMemo(() => {
    if (rowStops.length < 2) {
      return 0;
    }

    const rowHeights = Array.from({ length: value.rows }, (_, index) => {
      const start = rowStops[index];
      const end = rowStops[index + 1];
      if (start == null || end == null) {
        return 0;
      }
      return Math.max(0, end - start);
    }).filter(height => height > 0);

    if (!rowHeights.length) {
      return 0;
    }

    // Row 0 is the heading row in the tabular flow; use data row sizes for extrapolation
    const bodyRows = rowHeights.slice(1);
    const target = bodyRows.length ? bodyRows : rowHeights;
    const total = target.reduce((sum, height) => sum + height, 0);
    return total / target.length;
  }, [rowStops, value.rows]);

  const getProjectedRowBounds = useCallback(
    (rowIndex: number) => {
      if (rowIndex < 0) {
        return null;
      }

      const directStart = rowStops[rowIndex];
      const directEnd = rowStops[rowIndex + 1];
      if (directStart != null && directEnd != null) {
        return {
          top: directStart,
          bottom: directEnd,
        };
      }

      if (projectedBodyRowHeight <= 0) {
        return null;
      }

      const beyond = rowIndex - value.rows;
      if (beyond < 0) {
        return null;
      }

      const start = 100 + beyond * projectedBodyRowHeight;
      const end = start + projectedBodyRowHeight;
      return {
        top: start,
        bottom: end,
      };
    },
    [projectedBodyRowHeight, rowStops, value.rows]
  );

  const handleDefinitions = useMemo<readonly CastANetResizeHandle[]>(
    () => [
      { key: 'nw', x: netLeft, y: netTop, mode: 'resize-nw', cursor: 'nwse-resize' },
      { key: 'ne', x: netRight, y: netTop, mode: 'resize-ne', cursor: 'nesw-resize' },
      { key: 'sw', x: netLeft, y: netBottom, mode: 'resize-sw', cursor: 'nesw-resize' },
      { key: 'se', x: netRight, y: netBottom, mode: 'resize-se', cursor: 'nwse-resize' },
    ],
    [netBottom, netLeft, netRight, netTop]
  );

  return {
    rowStops,
    colStops,
    netLeft,
    netTop,
    netRight,
    netBottom,
    toCanvasX,
    toCanvasY,
    handleDefinitions,
    getProjectedRowBounds,
  };
}
