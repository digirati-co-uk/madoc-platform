import React, { useEffect } from 'react';
import { useCanvas } from 'react-iiif-vault';
import type { NetConfig, TabularCellRef } from './types';
import { getEffectivePositions, getStops } from './utils';
import { getProjectedBodyRowHeightPctOfTable, getTabularRowBoundsPctOfTable } from './projected-row-bounds';
import { sanitizeTabularRowOffsetAdjustments } from '@/frontend/shared/utility/tabular-row-offset-adjustments';

type CanvasViewport = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type RuntimeWithViewport = {
  getViewport?: () => CanvasViewport | null | undefined;
  setViewport?: (next: CanvasViewport) => void;
  updateNextFrame?: () => void;
  updateRendererScreenPosition?: () => void;
  renderer?: {
    resize?: (width?: number, height?: number) => void;
  };
  resize?: {
    (): void;
    (width?: number, height?: number): void;
    (fromWidth: number, toWidth: number, fromHeight: number, toHeight: number): void;
  };
  world?: {
    gotoRegion?: (next: CanvasViewport) => void;
    goHome?: () => void;
    zoomIn?: () => void;
    zoomOut?: () => void;
  };
};

type FollowActiveCellOnCanvasProps = {
  runtimeRef: React.MutableRefObject<RuntimeWithViewport | null>;
  runtimeTick: number;
  value: NetConfig;
  activeCell?: TabularCellRef | null;
  enabled?: boolean;
};

export function FollowActiveCellOnCanvas(props: FollowActiveCellOnCanvasProps) {
  const { runtimeRef, runtimeTick, value, activeCell, enabled = true } = props;
  const canvas = useCanvas();

  useEffect(() => {
    if (!enabled || !activeCell || !canvas) {
      return;
    }

    const runtime = runtimeRef.current;
    if (!runtime) {
      return;
    }

    const rows = Math.max(1, Math.floor(value.rows || 1));
    const cols = Math.max(1, Math.floor(value.cols || 1));
    const rowPositions = getEffectivePositions(rows, value.rowPositions);
    const colPositions = getEffectivePositions(cols, value.colPositions);
    const rowOffsetAdjustments = sanitizeTabularRowOffsetAdjustments(value.rowOffsetAdjustments);

    const rowStops = getStops(rows, rowPositions);
    const colStops = getStops(cols, colPositions);
    const projectedBodyRowHeightPctOfTable = getProjectedBodyRowHeightPctOfTable(rowStops, rows);
    const rowBounds = getTabularRowBoundsPctOfTable({
      rowIndex: activeCell.row,
      rowStops,
      rowCount: rows,
      projectedBodyRowHeightPctOfTable,
      rowOffsetAdjustments,
      netHeightPctOfPage: value.height,
    });
    const colStart = colStops[activeCell.col];
    const colEnd = colStops[activeCell.col + 1];
    const r0 = rowBounds?.top;
    const r1 = rowBounds?.bottom;

    if (r0 == null || r1 == null || colStart == null || colEnd == null) {
      return;
    }

    const cellTopPct = value.top + (r0 / 100) * value.height;
    const cellBottomPct = value.top + (r1 / 100) * value.height;
    const cellLeftPct = value.left + (colStart / 100) * value.width;
    const cellRightPct = value.left + (colEnd / 100) * value.width;

    const cellWidthPct = Math.max(0.5, cellRightPct - cellLeftPct);
    const cellHeightPct = Math.max(0.5, cellBottomPct - cellTopPct);
    const padXPct = Math.max(1, cellWidthPct * 0.35);
    const padYPct = Math.max(1, cellHeightPct * 0.6);
    const targetLeftPct = cellLeftPct - padXPct;
    const targetTopPct = cellTopPct - padYPct;
    const targetWidthPct = Math.max(4, cellWidthPct + padXPct * 2);
    const targetHeightPct = Math.max(4, cellHeightPct + padYPct * 2);

    const targetLeft = (targetLeftPct / 100) * canvas.width;
    const targetTop = (targetTopPct / 100) * canvas.height;
    const targetWidth = (targetWidthPct / 100) * canvas.width;
    const targetHeight = (targetHeightPct / 100) * canvas.height;
    const targetRight = targetLeft + targetWidth;
    const targetBottom = targetTop + targetHeight;

    // Preserve current zoom by only panning the viewport when the highlighted target moves out of view
    if (typeof runtime.getViewport === 'function' && typeof runtime.setViewport === 'function') {
      const viewport = runtime.getViewport();
      if (!viewport) {
        return;
      }

      const viewLeft = viewport.x;
      const viewTop = viewport.y;
      const viewRight = viewport.x + viewport.width;
      const viewBottom = viewport.y + viewport.height;
      const targetTooWide = targetWidth > viewport.width;
      const targetTooTall = targetHeight > viewport.height;

      let nextX = viewport.x;
      let nextY = viewport.y;

      if (targetTooWide) {
        nextX = targetLeft + targetWidth / 2 - viewport.width / 2;
      } else if (targetLeft < viewLeft) {
        nextX = targetLeft;
      } else if (targetRight > viewRight) {
        nextX = targetRight - viewport.width;
      }

      if (targetTooTall) {
        nextY = targetTop + targetHeight / 2 - viewport.height / 2;
      } else if (targetTop < viewTop) {
        nextY = targetTop;
      } else if (targetBottom > viewBottom) {
        nextY = targetBottom - viewport.height;
      }

      if (nextX !== viewport.x || nextY !== viewport.y) {
        runtime.setViewport({ x: nextX, y: nextY, width: viewport.width, height: viewport.height });
        runtime.updateNextFrame?.();
      }
      return;
    }

    // Fallback
    const world = runtime.world;
    if (world && typeof world.gotoRegion === 'function') {
      world.gotoRegion({
        x: targetLeft,
        y: targetTop,
        width: targetWidth,
        height: targetHeight,
      });
    }
  }, [
    activeCell,
    canvas,
    enabled,
    runtimeRef,
    runtimeTick,
    value.cols,
    value.colPositions,
    value.height,
    value.left,
    value.rows,
    value.rowOffsetAdjustments,
    value.rowPositions,
    value.top,
    value.width,
  ]);

  return null;
}
