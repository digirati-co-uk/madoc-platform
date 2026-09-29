import { useAfterFrame } from '@atlas-viewer/atlas';
import React, { useEffect, useState } from 'react';
import { useCanvas } from 'react-iiif-vault';
import type { NetConfig, TabularCellRef } from './types';
import { getTabularCellBounds } from './tabular-cell-bounds';

type CanvasViewport = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type RuntimeWithViewport = {
  getViewport?: () => CanvasViewport | null | undefined;
  setViewport?: (next: CanvasViewport) => void;
  setHomePosition?: (next?: CanvasViewport) => void;
  getRendererScreenPosition?: () =>
    | {
        width: number;
        height: number;
      }
    | undefined;
  goHome?: () => void;
  updateNextFrame?: () => void;
  updateControllerPosition?: () => void;
  transitionManager?: { stopTransition: () => void };
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
    width?: number;
    height?: number;
    gotoRegion?: (next: CanvasViewport) => void;
    goHome?: () => void;
    zoomIn?: (origin?: { x: number; y: number }) => void;
    zoomOut?: () => void;
    rotateBy?: (degrees: number) => void;
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
  const [viewportSize, setViewportSize] = useState('');
  useAfterFrame(() => {
    const screen = runtimeRef.current?.getRendererScreenPosition?.();
    if (screen) setViewportSize(`${screen.width}:${screen.height}`);
  }, [runtimeRef]);

  useEffect(() => {
    if (!enabled || !activeCell || !canvas) {
      return;
    }

    const runtime = runtimeRef.current;
    if (!runtime) {
      return;
    }

    const cell = getTabularCellBounds(value, activeCell, canvas);
    if (!cell) return;
    const cellWidth = Math.max(canvas.width * 0.005, cell.width);
    const cellHeight = Math.max(canvas.height * 0.005, cell.height);
    const padX = Math.max(canvas.width * 0.01, cellWidth * 0.35);
    const padY = Math.max(canvas.height * 0.01, cellHeight * 0.6);
    const targetLeft = cell.x - padX;
    const targetTop = cell.y - padY;
    const targetWidth = Math.max(canvas.width * 0.04, cellWidth + padX * 2);
    const targetHeight = Math.max(canvas.height * 0.04, cellHeight + padY * 2);
    const targetRight = targetLeft + targetWidth;

    // Preserve zoom, centre the selected row vertically, and keep its column in view.
    if (typeof runtime.getViewport === 'function' && typeof runtime.setViewport === 'function') {
      const viewport = runtime.getViewport();
      if (!viewport) {
        return;
      }

      const screen = runtime.getRendererScreenPosition?.();
      // Atlas can retain the old viewport height while its renderer changes aspect ratio.
      const viewHeight =
        screen?.width && screen.height ? (viewport.width * screen.height) / screen.width : viewport.height;
      const viewLeft = viewport.x;
      const viewRight = viewport.x + viewport.width;
      const targetTooWide = targetWidth > viewport.width;

      let nextX = viewport.x;
      const nextY = cell.y + cell.height / 2 - viewHeight / 2;

      if (targetTooWide) {
        nextX = targetLeft + targetWidth / 2 - viewport.width / 2;
      } else if (targetLeft < viewLeft) {
        nextX = targetLeft;
      } else if (targetRight > viewRight) {
        nextX = targetRight - viewport.width;
      }

      if (nextX !== viewport.x || nextY !== viewport.y || Math.abs(viewHeight - viewport.height) > 0.01) {
        runtime.transitionManager?.stopTransition();
        runtime.setViewport({ x: nextX, y: nextY, width: viewport.width, height: viewHeight });
        runtime.updateControllerPosition?.();
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
    viewportSize,
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
