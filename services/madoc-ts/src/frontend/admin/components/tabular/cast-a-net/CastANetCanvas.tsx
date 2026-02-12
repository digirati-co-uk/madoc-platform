import React, { useEffect, useRef, useState } from 'react';
import type { CastANetStructure, NetConfig, TabularCellRef } from './types';
import { CanvasPanel, SimpleViewerProvider, useCanvas } from 'react-iiif-vault';
import { CastANetOverlayAtlas } from './CastANetOverlayAtlas';
import { buildCastANetStructure } from './CastANetStructure';
import { CanvasViewerButton, CanvasViewerControls } from '../../../../shared/atoms/CanvasViewerGrid';
import { HomeIcon } from '../../../../shared/icons/HomeIcon';
import { MinusIcon } from '../../../../shared/icons/MinusIcon';
import { OpacityIcon } from '../../../../shared/icons/OpacityIcon';
import { PlusIcon } from '../../../../shared/icons/PlusIcon';
import {
  NET_DIM_STEP,
  NET_MAX_DIM_OPACITY,
  clampDimOpacity,
  dimOpacityToPercent,
  getStops,
  makeEvenPositions,
  normalisePositions,
} from './utils';
import './CastANetCanvas.css';

type CastANetCanvasProps = {
  manifestId: string;
  canvasId?: string;
  value: NetConfig;
  onChange: (next: NetConfig) => void;
  height?: number;
  onStructureChange?: (next: CastANetStructure) => void;
  blankColumnIndexes?: number[];
  disabled?: boolean;
  dimOpacity?: number;
  onChangeDimOpacity?: (next: number) => void;
  activeCell?: TabularCellRef | null;
  previewOverlayOnly?: boolean;
};

function FollowActiveCellOnCanvas(props: {
  runtimeRef: React.MutableRefObject<any>;
  runtimeTick: number;
  value: NetConfig;
  activeCell?: TabularCellRef | null;
  enabled?: boolean;
}) {
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
    const expectedRows = Math.max(0, rows - 1);
    const expectedCols = Math.max(0, cols - 1);
    const rowPositions =
      value.rowPositions.length === expectedRows
        ? normalisePositions(value.rowPositions, rows)
        : normalisePositions(makeEvenPositions(rows), rows);
    const colPositions =
      value.colPositions.length === expectedCols
        ? normalisePositions(value.colPositions, cols)
        : normalisePositions(makeEvenPositions(cols), cols);

    const rowStops = getStops(rows, rowPositions);
    const colStops = getStops(cols, colPositions);

    const rowHeights = Array.from({ length: rows }, (_, index) => {
      const start = rowStops[index];
      const end = rowStops[index + 1];
      if (start == null || end == null) {
        return 0;
      }
      return Math.max(0, end - start);
    }).filter(height => height > 0);
    const bodyRows = rowHeights.slice(1);
    const projectedBodyRowHeight =
      (bodyRows.length ? bodyRows : rowHeights).reduce((sum, height) => sum + height, 0) /
      Math.max(1, (bodyRows.length ? bodyRows : rowHeights).length);

    const rowStart = rowStops[activeCell.row];
    const rowEnd = rowStops[activeCell.row + 1];
    const colStart = colStops[activeCell.col];
    const colEnd = colStops[activeCell.col + 1];

    let r0 = rowStart;
    let r1 = rowEnd;

    // Data rows beyond the configured net rows are projected using the average body-row height.
    if ((r0 == null || r1 == null) && projectedBodyRowHeight > 0 && activeCell.row >= rows) {
      const offset = activeCell.row - rows;
      r0 = 100 + offset * projectedBodyRowHeight;
      r1 = r0 + projectedBodyRowHeight;
    }

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

    // Preserve current zoom by only panning the viewport when the highlighted target moves out of view.
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

    // Fallback for runtimes without viewport controls.
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
    value.rowPositions,
    value.top,
    value.width,
  ]);

  return null;
}

export const CastANetCanvas: React.FC<CastANetCanvasProps> = ({
  manifestId,
  canvasId,
  value,
  onChange,
  height = 520,
  onStructureChange,
  blankColumnIndexes,
  disabled,
  dimOpacity,
  onChangeDimOpacity,
  activeCell,
  previewOverlayOnly,
}) => {
  const AnySimpleViewerProvider = SimpleViewerProvider as unknown as React.FC<any>;
  const runtime = useRef<any>(null);
  const [internalDimOpacity, setInternalDimOpacity] = useState(0);
  const [runtimeTick, setRuntimeTick] = useState(0);

  useEffect(() => {
    if (typeof dimOpacity === 'number') {
      setInternalDimOpacity(clampDimOpacity(dimOpacity));
    }
  }, [dimOpacity]);

  useEffect(() => {
    if (!onStructureChange) return;
    onStructureChange(
      buildCastANetStructure(value, {
        blankColumnIndexes,
      })
    );
  }, [value, blankColumnIndexes, onStructureChange]);

  const goHome = () => runtime.current?.world?.goHome?.();
  const zoomIn = () => runtime.current?.world?.zoomIn?.();
  const zoomOut = () => runtime.current?.world?.zoomOut?.();
  const resolvedDimOpacity = typeof dimOpacity === 'number' ? dimOpacity : internalDimOpacity;
  const safeDim = clampDimOpacity(resolvedDimOpacity);
  const dimPercent = dimOpacityToPercent(safeDim);
  const sliderPositionValue = NET_MAX_DIM_OPACITY - safeDim;
  const sliderPositionPercent = Math.round((sliderPositionValue / NET_MAX_DIM_OPACITY) * 100);
  const sliderStyle = {
    '--cast-a-net-opacity-progress': `${sliderPositionPercent}%`,
  } as React.CSSProperties;

  const setDim = (next: number) => {
    const clamped = clampDimOpacity(next);
    setInternalDimOpacity(clamped);
    onChangeDimOpacity?.(clamped);
  };
  const viewerKey = `${manifestId}::${canvasId ?? ''}`;

  return (
    <div style={{ border: '1px solid #ddd', height, position: 'relative', background: '#fff', overflow: 'hidden' }}>
      {!previewOverlayOnly ? (
        <div className="cast-a-net-opacity-control" role="group" aria-label="Canvas opacity">
          <OpacityIcon className="cast-a-net-opacity-icon" aria-hidden="true" />
          <input
            type="range"
            aria-label="Canvas opacity"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={dimPercent}
            aria-valuetext={`${dimPercent}%`}
            min={0}
            max={NET_MAX_DIM_OPACITY}
            step={NET_DIM_STEP}
            value={sliderPositionValue}
            disabled={disabled}
            onChange={e => setDim(NET_MAX_DIM_OPACITY - Number(e.target.value))}
            className="cast-a-net-opacity-slider"
            style={sliderStyle}
          />
        </div>
      ) : null}

      <CanvasViewerControls style={{ top: 12, right: 12, zIndex: 50 }}>
        <CanvasViewerButton type="button" title="Home" onClick={goHome} disabled={disabled}>
          <HomeIcon />
        </CanvasViewerButton>
        <CanvasViewerButton type="button" title="Zoom out" onClick={zoomOut} disabled={disabled}>
          <MinusIcon />
        </CanvasViewerButton>
        <CanvasViewerButton type="button" title="Zoom in" onClick={zoomIn} disabled={disabled}>
          <PlusIcon />
        </CanvasViewerButton>
      </CanvasViewerControls>

      <AnySimpleViewerProvider key={viewerKey} manifest={manifestId} startCanvas={canvasId}>
        <CanvasPanel.Viewer
          runtimeOptions={{ maxOverZoom: 5, visibilityRatio: 1, maxUnderZoom: 1 }}
          onCreated={(preset: any) => {
            runtime.current = preset.runtime;
            setRuntimeTick(tick => tick + 1);
          }}
        >
          <FollowActiveCellOnCanvas
            runtimeRef={runtime}
            runtimeTick={runtimeTick}
            value={value}
            activeCell={activeCell}
            enabled={previewOverlayOnly && !!activeCell}
          />
          <CanvasPanel.RenderCanvas>
            <CastANetOverlayAtlas
              value={value}
              onChange={onChange}
              disabled={disabled}
              activeCell={activeCell}
              dimOpacity={safeDim}
              previewOverlayOnly={previewOverlayOnly}
            />
          </CanvasPanel.RenderCanvas>
        </CanvasPanel.Viewer>
      </AnySimpleViewerProvider>
    </div>
  );
};
