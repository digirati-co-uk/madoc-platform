import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import type { DragMode, NetConfig, TabularCellRef } from './types';
import {
  NET_LINE_MIN_GAP_PCT,
  NET_OVERLAY_MIN_SIZE_PCT,
  clamp,
  getStops,
  makeEvenPositions,
  normalisePositions,
} from './utils';

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
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const dragModeRef = useRef<DragMode>(null);
  const dragStartRef = useRef<{
    x: number;
    y: number;
    config: NetConfig;
    shiftKey: boolean;
  } | null>(null);
  const windowMoveHandlerRef = useRef<((e: MouseEvent) => void) | null>(null);
  const windowUpHandlerRef = useRef<((e: MouseEvent) => void) | null>(null);

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
    const expectedLen = Math.max(0, value.rows - 1);
    if (value.rowPositions.length === expectedLen) {
      return normalisePositions(value.rowPositions, value.rows);
    }
    return normalisePositions(makeEvenPositions(value.rows), value.rows);
  }, [value.rows, value.rowPositions]);

  const effectiveColPositions = useMemo(() => {
    const expectedLen = Math.max(0, value.cols - 1);
    if (value.colPositions.length === expectedLen) {
      return normalisePositions(value.colPositions, value.cols);
    }
    return normalisePositions(makeEvenPositions(value.cols), value.cols);
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

  const startDrag = (mode: DragMode) => (e: React.MouseEvent) => {
    if (disabled) return;
    e.preventDefault();

    const el = overlayRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    dragModeRef.current = mode;
    dragStartRef.current = {
      x,
      y,
      config: {
        ...value,
        rowPositions: effectiveRowPositions,
        colPositions: effectiveColPositions,
      },
      shiftKey: e.shiftKey,
    };

    const onWindowMove = (ev: MouseEvent) => {
      if (disabled) return;
      const elNow = overlayRef.current;
      if (!elNow) return;
      if (!dragModeRef.current || !dragStartRef.current) return;

      const rectNow = elNow.getBoundingClientRect();
      const currentX = ((ev.clientX - rectNow.left) / rectNow.width) * 100;
      const currentY = ((ev.clientY - rectNow.top) / rectNow.height) * 100;

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

      if (modeNow && typeof modeNow === 'object' && modeNow.type === 'row') {
        const idx = modeNow.index;
        const minGap = NET_LINE_MIN_GAP_PCT;
        const pointerInNet = clamp(((currentY - start.top) / start.height) * 100, 0, 100);

        if (!dragStartRef.current.shiftKey) {
          const prev = idx === 0 ? 0 : start.rowPositions[idx - 1];
          const nextPos = idx === start.rowPositions.length - 1 ? 100 : start.rowPositions[idx + 1];
          next.rowPositions = [...start.rowPositions];
          next.rowPositions[idx] = clamp(pointerInNet, prev + minGap, nextPos - minGap);
          emitChange(next);
          return;
        }

        const k = idx + 1;
        let step = pointerInNet / k;
        const maxStep = (100 - minGap) / (value.rows - 1);
        step = clamp(step, minGap, maxStep);
        next.rowPositions = Array.from({ length: value.rows - 1 }, (_, i) => step * (i + 1));
        emitChange(next);
        return;
      }

      if (modeNow && typeof modeNow === 'object' && modeNow.type === 'col') {
        const idx = modeNow.index;
        const minGap = NET_LINE_MIN_GAP_PCT;
        const pointerInNet = clamp(((currentX - start.left) / start.width) * 100, 0, 100);

        if (!dragStartRef.current.shiftKey) {
          const prev = idx === 0 ? 0 : start.colPositions[idx - 1];
          const nextPos = idx === start.colPositions.length - 1 ? 100 : start.colPositions[idx + 1];
          next.colPositions = [...start.colPositions];
          next.colPositions[idx] = clamp(pointerInNet, prev + minGap, nextPos - minGap);
          emitChange(next);
          return;
        }

        const k = idx + 1;
        let step = pointerInNet / k;
        const maxStep = (100 - minGap) / (value.cols - 1);
        step = clamp(step, minGap, maxStep);
        next.colPositions = Array.from({ length: value.cols - 1 }, (_, i) => step * (i + 1));
        emitChange(next);
      }
    };

    const onWindowUp = () => endDrag();

    if (windowMoveHandlerRef.current) window.removeEventListener('mousemove', windowMoveHandlerRef.current);
    if (windowUpHandlerRef.current) window.removeEventListener('mouseup', windowUpHandlerRef.current);

    windowMoveHandlerRef.current = onWindowMove;
    windowUpHandlerRef.current = onWindowUp;

    window.addEventListener('mousemove', onWindowMove);
    window.addEventListener('mouseup', onWindowUp);
  };

  const rowStops = useMemo(() => getStops(value.rows, effectiveRowPositions), [value.rows, effectiveRowPositions]);
  const colStops = useMemo(() => getStops(value.cols, effectiveColPositions), [value.cols, effectiveColPositions]);
  const showInteractiveNet = !previewOverlayOnly;
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

    // Row 0 is the heading row in the tabular flow; use data row sizes for extrapolation.
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

  const handleDefinitions = useMemo(
    () =>
      [
        { key: 'nw', x: netLeft, y: netTop, mode: 'resize-nw', cursor: 'nwse-resize' },
        { key: 'ne', x: netRight, y: netTop, mode: 'resize-ne', cursor: 'nesw-resize' },
        { key: 'sw', x: netLeft, y: netBottom, mode: 'resize-sw', cursor: 'nesw-resize' },
        { key: 'se', x: netRight, y: netBottom, mode: 'resize-se', cursor: 'nwse-resize' },
      ] as const,
    [netBottom, netLeft, netRight, netTop]
  );

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
          fill="rgba(255, 105, 180, 0.25)"
          pointerEvents="none"
        />
        <line
          x1={netLeft}
          y1={bottom}
          x2={netRight}
          y2={bottom}
          stroke="rgba(255, 105, 180, 0.55)"
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
  }, [colStops, headerEnd, headerStart, netLeft, netRight, showInteractiveNet, toCanvasX, toCanvasY, value.width]);

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
          fill="rgba(54, 179, 126, 0.24)"
          pointerEvents="none"
        />
        <line
          x1={netLeft}
          y1={rowTop}
          x2={netRight}
          y2={rowTop}
          stroke="rgba(22, 140, 83, 0.65)"
          strokeWidth={2}
          vectorEffect="non-scaling-stroke"
          pointerEvents="none"
        />
        <line
          x1={netLeft}
          y1={rowBottom}
          x2={netRight}
          y2={rowBottom}
          stroke="rgba(22, 140, 83, 0.65)"
          strokeWidth={2}
          vectorEffect="non-scaling-stroke"
          pointerEvents="none"
        />
        <rect
          x={cellLeft}
          y={rowTop}
          width={cellWidth}
          height={rowHeight}
          fill="rgba(54, 179, 126, 0.16)"
          stroke="rgba(22, 140, 83, 0.8)"
          strokeWidth={2}
          vectorEffect="non-scaling-stroke"
          pointerEvents="none"
        />
      </>
    );
  }, [activeCell, colStops, getProjectedRowBounds, netLeft, netRight, toCanvasX, toCanvasY, value.width]);

  return (
    <div
      ref={overlayRef}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 2,
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
