import { useCallback, useMemo } from 'react';
import type { DragMode, NetConfig } from './types';
import { getProjectedBodyRowHeightPctOfTable, getTabularRowBoundsPctOfTable } from './projected-row-bounds';
import { sanitizeTabularRowOffsetAdjustments } from '@/frontend/shared/utility/tabular-row-offset-adjustments';
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

  const projectedBodyRowHeightPctOfTable = useMemo(() => {
    return getProjectedBodyRowHeightPctOfTable(rowStops, value.rows);
  }, [rowStops, value.rows]);

  const rowOffsetAdjustments = useMemo(
    () => sanitizeTabularRowOffsetAdjustments(value.rowOffsetAdjustments),
    [value.rowOffsetAdjustments]
  );

  const getProjectedRowBounds = useCallback(
    (rowIndex: number) => {
      if (rowIndex < 0) {
        return null;
      }

      return getTabularRowBoundsPctOfTable({
        rowIndex,
        rowStops,
        rowCount: value.rows,
        projectedBodyRowHeightPctOfTable,
        rowOffsetAdjustments,
        netHeightPctOfPage: value.height,
      });
    },
    [projectedBodyRowHeightPctOfTable, rowOffsetAdjustments, rowStops, value.height, value.rows]
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
