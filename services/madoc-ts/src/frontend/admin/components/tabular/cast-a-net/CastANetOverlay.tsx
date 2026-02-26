import React, { useMemo } from 'react';
import type { NetConfig, TabularCellRef } from './types';
import { useCastANetOverlayDrag } from './use-cast-a-net-overlay-drag';
import { useCastANetOverlayGeometry } from './use-cast-a-net-overlay-geometry';

type CastANetOverlayProps = {
  value: NetConfig;
  onChange: (next: NetConfig) => void;
  disabled?: boolean;
  activeCell?: TabularCellRef | null;
  previewOverlayOnly?: boolean;
};

export const CastANetOverlay: React.FC<CastANetOverlayProps> = ({
  value,
  onChange,
  disabled = false,
  activeCell,
  previewOverlayOnly = false,
}) => {
  const OUTER_BORDER_THICKNESS = 5;
  const GRID_LINE_THICKNESS = 5;
  const GRID_HIT_THICKNESS = 20;
  const HANDLE_SIZE = 30;
  const { overlayRef, effectiveRowPositions, effectiveColPositions, startDrag } = useCastANetOverlayDrag({
    value,
    onChange,
    disabled,
  });
  const {
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
  } = useCastANetOverlayGeometry({
    value,
    rowPositions: effectiveRowPositions,
    colPositions: effectiveColPositions,
  });
  const showInteractiveNet = !previewOverlayOnly;

  const headerStart = rowStops[0];
  const headerEnd = rowStops[1];

  const header = useMemo(() => {
    if (headerStart == null || headerEnd == null) {
      return null;
    }

    const top = toCanvasY(headerStart);
    const bottom = toCanvasY(headerEnd);
    const height = bottom - top;
    if (height <= 0) {
      return null;
    }

    return (
      <>
        <rect
          x={netLeft}
          y={top}
          width={value.width}
          height={height}
          fill={previewOverlayOnly ? 'rgba(255, 105, 180, 0.35)' : 'rgba(255, 105, 180, 0.25)'}
          pointerEvents="none"
        />
        <line
          x1={netLeft}
          y1={bottom}
          x2={netRight}
          y2={bottom}
          stroke={previewOverlayOnly ? 'rgba(255, 105, 180, 0.75)' : 'rgba(255, 105, 180, 0.55)'}
          strokeWidth={2}
          vectorEffect="non-scaling-stroke"
          pointerEvents="none"
        />

        {showInteractiveNet
          ? colStops.slice(1, -1).map((position, index) => {
              const x = toCanvasX(position);
              return (
                <line
                  key={`head-col-${index}`}
                  x1={x}
                  y1={top}
                  x2={x}
                  y2={bottom}
                  stroke="rgba(74, 100, 225, 0.9)"
                  strokeWidth={2}
                  vectorEffect="non-scaling-stroke"
                  pointerEvents="none"
                />
              );
            })
          : null}
      </>
    );
  }, [
    colStops,
    headerEnd,
    headerStart,
    netLeft,
    netRight,
    previewOverlayOnly,
    showInteractiveNet,
    toCanvasX,
    toCanvasY,
    value.width,
  ]);

  const activeCellHighlight = useMemo(() => {
    if (!activeCell) {
      return null;
    }

    const rowBounds = getProjectedRowBounds(activeCell.row);
    const rowStart = rowBounds?.top;
    const rowEnd = rowBounds?.bottom;
    const colStart = colStops[activeCell.col];
    const colEnd = colStops[activeCell.col + 1];
    if (rowStart == null || rowEnd == null || colStart == null || colEnd == null) {
      return null;
    }

    const rowTop = toCanvasY(rowStart);
    const rowBottom = toCanvasY(rowEnd);
    const rowHeight = rowBottom - rowTop;
    const cellLeft = toCanvasX(colStart);
    const cellRight = toCanvasX(colEnd);
    const cellWidth = cellRight - cellLeft;

    if (rowHeight <= 0 || cellWidth <= 0) {
      return null;
    }

    return (
      <>
        <rect
          x={netLeft}
          y={rowTop}
          width={value.width}
          height={rowHeight}
          fill={previewOverlayOnly ? 'rgba(54, 179, 126, 0.34)' : 'rgba(54, 179, 126, 0.24)'}
          pointerEvents="none"
        />
        <line
          x1={netLeft}
          y1={rowTop}
          x2={netRight}
          y2={rowTop}
          stroke={previewOverlayOnly ? 'rgba(22, 140, 83, 0.82)' : 'rgba(22, 140, 83, 0.65)'}
          strokeWidth={2}
          vectorEffect="non-scaling-stroke"
          pointerEvents="none"
        />
        <line
          x1={netLeft}
          y1={rowBottom}
          x2={netRight}
          y2={rowBottom}
          stroke={previewOverlayOnly ? 'rgba(22, 140, 83, 0.82)' : 'rgba(22, 140, 83, 0.65)'}
          strokeWidth={2}
          vectorEffect="non-scaling-stroke"
          pointerEvents="none"
        />
        <rect
          x={cellLeft}
          y={rowTop}
          width={cellWidth}
          height={rowHeight}
          fill={previewOverlayOnly ? 'rgba(54, 179, 126, 0.26)' : 'rgba(54, 179, 126, 0.16)'}
          stroke={previewOverlayOnly ? 'rgba(22, 140, 83, 0.92)' : 'rgba(22, 140, 83, 0.8)'}
          strokeWidth={2}
          vectorEffect="non-scaling-stroke"
          pointerEvents="none"
        />
      </>
    );
  }, [
    activeCell,
    colStops,
    getProjectedRowBounds,
    netLeft,
    netRight,
    previewOverlayOnly,
    toCanvasX,
    toCanvasY,
    value.width,
  ]);

  return (
    <div
      ref={overlayRef}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 8,
        pointerEvents: 'none',
        userSelect: 'none',
      }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{
          position: 'absolute',
          inset: 0,
          overflow: 'visible',
          pointerEvents: 'none',
        }}
      >
        {header}
        {activeCellHighlight}

        {showInteractiveNet ? (
          <>
            <rect
              x={netLeft}
              y={netTop}
              width={value.width}
              height={value.height}
              fill="none"
              stroke="#4A64E1"
              strokeWidth={OUTER_BORDER_THICKNESS}
              vectorEffect="non-scaling-stroke"
              pointerEvents="none"
            />

            <rect
              x={netLeft}
              y={netTop}
              width={value.width}
              height={value.height}
              fill="rgba(0,0,0,0.001)"
              pointerEvents="all"
              onMouseDown={startDrag('move')}
              style={{ cursor: disabled ? 'not-allowed' : 'move' }}
            />

            {effectiveRowPositions.map((position, index) => {
              const y = toCanvasY(position);
              return (
                <g key={`row-${index}`}>
                  <line
                    x1={netLeft}
                    y1={y}
                    x2={netRight}
                    y2={y}
                    stroke="rgba(0, 0, 0, 0.001)"
                    strokeWidth={GRID_HIT_THICKNESS}
                    vectorEffect="non-scaling-stroke"
                    pointerEvents="stroke"
                    onMouseDown={e => {
                      e.stopPropagation();
                      startDrag({ type: 'row', index })(e);
                    }}
                    style={{ cursor: disabled ? 'not-allowed' : 'row-resize' }}
                  />
                  <line
                    x1={netLeft}
                    y1={y}
                    x2={netRight}
                    y2={y}
                    stroke="#4A64E1"
                    strokeWidth={GRID_LINE_THICKNESS}
                    vectorEffect="non-scaling-stroke"
                    pointerEvents="none"
                  />
                </g>
              );
            })}

            {effectiveColPositions.map((position, index) => {
              const x = toCanvasX(position);
              return (
                <g key={`col-${index}`}>
                  <line
                    x1={x}
                    y1={netTop}
                    x2={x}
                    y2={netBottom}
                    stroke="rgba(0, 0, 0, 0.001)"
                    strokeWidth={GRID_HIT_THICKNESS}
                    vectorEffect="non-scaling-stroke"
                    pointerEvents="stroke"
                    onMouseDown={e => {
                      e.stopPropagation();
                      startDrag({ type: 'col', index })(e);
                    }}
                    style={{ cursor: disabled ? 'not-allowed' : 'col-resize' }}
                  />
                  <line
                    x1={x}
                    y1={netTop}
                    x2={x}
                    y2={netBottom}
                    stroke="#4A64E1"
                    strokeWidth={GRID_LINE_THICKNESS}
                    vectorEffect="non-scaling-stroke"
                    pointerEvents="none"
                  />
                </g>
              );
            })}

            {handleDefinitions.map(handle => (
              <line
                key={handle.key}
                x1={handle.x}
                y1={handle.y}
                x2={handle.x}
                y2={handle.y}
                stroke="#4A64E1"
                strokeWidth={HANDLE_SIZE}
                strokeLinecap="square"
                vectorEffect="non-scaling-stroke"
                pointerEvents="stroke"
                onMouseDown={e => {
                  e.stopPropagation();
                  startDrag(handle.mode)(e);
                }}
                style={{ cursor: disabled ? 'not-allowed' : handle.cursor }}
              />
            ))}
          </>
        ) : null}
      </svg>
    </div>
  );
};
