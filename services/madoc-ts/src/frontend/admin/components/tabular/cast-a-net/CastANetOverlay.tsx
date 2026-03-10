import {
  type MouseEvent as ReactMouseEvent,
  type WheelEvent as ReactWheelEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { NetConfig, TabularCellRef } from './types';
import { useCastANetOverlayDrag } from './use-cast-a-net-overlay-drag';
import { useCastANetOverlayGeometry } from './use-cast-a-net-overlay-geometry';

type CastANetOverlayProps = {
  value: NetConfig;
  onChange: (next: NetConfig) => void;
  disabled?: boolean;
  activeCell?: TabularCellRef | null;
  previewOverlayOnly?: boolean;
  onOverlayWheel?: (deltaY: number) => void;
};

const isMoveModifierPressed = (event: { altKey: boolean }) => {
  return event.altKey;
};

const sanitiseLineIndexes = (indexes: number[], max: number) => {
  return Array.from(new Set(indexes.filter(index => index >= 0 && index < max))).sort((a, b) => a - b);
};

const toggleLineSelection = (indexes: number[], index: number, max: number) => {
  const selection = new Set(indexes);
  if (selection.has(index)) {
    selection.delete(index);
  } else if (index >= 0 && index < max) {
    selection.add(index);
  }
  return sanitiseLineIndexes(Array.from(selection), max);
};

export function CastANetOverlay({
  value,
  onChange,
  disabled = false,
  activeCell,
  previewOverlayOnly = false,
  onOverlayWheel,
}: CastANetOverlayProps) {
  const OUTER_BORDER_THICKNESS = 5;
  const GRID_LINE_THICKNESS = 5;
  const GRID_HIT_THICKNESS = 20;
  const HANDLE_SIZE = 30;
  const { overlayRef, effectiveRowPositions, effectiveColPositions, startDrag } = useCastANetOverlayDrag({
    value,
    onChange,
    disabled,
  });
  const [isShiftPressed, setIsShiftPressed] = useState(false);
  const [isMoveModifierActive, setIsMoveModifierActive] = useState(false);
  const [selectedRowIndexes, setSelectedRowIndexes] = useState<number[]>([]);
  const [selectedColIndexes, setSelectedColIndexes] = useState<number[]>([]);

  useEffect(() => {
    const syncModifierState = (event: KeyboardEvent) => {
      setIsShiftPressed(event.shiftKey);
      setIsMoveModifierActive(isMoveModifierPressed(event));
    };

    const onBlur = () => {
      setIsShiftPressed(false);
      setIsMoveModifierActive(false);
    };

    window.addEventListener('keydown', syncModifierState);
    window.addEventListener('keyup', syncModifierState);
    window.addEventListener('blur', onBlur);

    return () => {
      window.removeEventListener('keydown', syncModifierState);
      window.removeEventListener('keyup', syncModifierState);
      window.removeEventListener('blur', onBlur);
    };
  }, []);

  useEffect(() => {
    setSelectedRowIndexes(current => sanitiseLineIndexes(current, effectiveRowPositions.length));
  }, [effectiveRowPositions.length]);

  useEffect(() => {
    setSelectedColIndexes(current => sanitiseLineIndexes(current, effectiveColPositions.length));
  }, [effectiveColPositions.length]);
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
  const handleWheel = useCallback(
    (event: ReactWheelEvent<SVGElement>) => {
      event.preventDefault();
      event.stopPropagation();
      onOverlayWheel?.(event.deltaY);
    },
    [onOverlayWheel]
  );
  const clearLineSelection = useCallback(() => {
    setSelectedRowIndexes([]);
    setSelectedColIndexes([]);
  }, []);

  useEffect(() => {
    if (!selectedRowIndexes.length && !selectedColIndexes.length) {
      return;
    }

    const onWindowMouseDown = (event: MouseEvent) => {
      const target = event.target;
      if (target instanceof Element && target.closest('[data-cast-a-net-interactive="true"]')) {
        return;
      }
      clearLineSelection();
    };

    window.addEventListener('mousedown', onWindowMouseDown);

    return () => {
      window.removeEventListener('mousedown', onWindowMouseDown);
    };
  }, [clearLineSelection, selectedColIndexes.length, selectedRowIndexes.length]);

  const handleMoveMouseDown = useCallback(
    (event: ReactMouseEvent<SVGRectElement>) => {
      clearLineSelection();
      startDrag('move')(event);
    },
    [clearLineSelection, startDrag]
  );

  const handleRowMouseDown = useCallback(
    (index: number) => (event: ReactMouseEvent<SVGLineElement>) => {
      event.stopPropagation();
      if (disabled) {
        return;
      }

      if (event.shiftKey) {
        setSelectedColIndexes([]);
        setSelectedRowIndexes(current => toggleLineSelection(current, index, effectiveRowPositions.length));
        return;
      }

      const activeSelection = selectedRowIndexes.includes(index)
        ? sanitiseLineIndexes(selectedRowIndexes, effectiveRowPositions.length)
        : [index];

      setSelectedRowIndexes(activeSelection);
      setSelectedColIndexes([]);
      startDrag({
        type: 'row',
        index,
        selectedIndexes: activeSelection.length > 1 ? activeSelection : undefined,
      })(event);
    },
    [disabled, effectiveRowPositions.length, selectedRowIndexes, startDrag]
  );

  const handleColMouseDown = useCallback(
    (index: number) => (event: ReactMouseEvent<SVGLineElement>) => {
      event.stopPropagation();
      if (disabled) {
        return;
      }

      if (event.shiftKey) {
        setSelectedRowIndexes([]);
        setSelectedColIndexes(current => toggleLineSelection(current, index, effectiveColPositions.length));
        return;
      }

      const activeSelection = selectedColIndexes.includes(index)
        ? sanitiseLineIndexes(selectedColIndexes, effectiveColPositions.length)
        : [index];

      setSelectedColIndexes(activeSelection);
      setSelectedRowIndexes([]);
      startDrag({
        type: 'col',
        index,
        selectedIndexes: activeSelection.length > 1 ? activeSelection : undefined,
      })(event);
    },
    [disabled, effectiveColPositions.length, selectedColIndexes, startDrag]
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
              pointerEvents={isMoveModifierActive ? 'all' : 'none'}
              data-cast-a-net-interactive="true"
              onMouseDown={handleMoveMouseDown}
              onWheel={handleWheel}
              style={{ cursor: disabled ? 'not-allowed' : 'move' }}
            />

            {effectiveRowPositions.map((position, index) => {
              const isSelected = selectedRowIndexes.includes(index);
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
                    data-cast-a-net-interactive="true"
                    onMouseDown={handleRowMouseDown(index)}
                    onWheel={handleWheel}
                    style={{ cursor: disabled ? 'not-allowed' : isShiftPressed ? 'copy' : 'row-resize' }}
                  />
                  <line
                    x1={netLeft}
                    y1={y}
                    x2={netRight}
                    y2={y}
                    stroke={isSelected ? '#1e8b72' : '#4A64E1'}
                    strokeWidth={isSelected ? GRID_LINE_THICKNESS + 1 : GRID_LINE_THICKNESS}
                    vectorEffect="non-scaling-stroke"
                    pointerEvents="none"
                  />
                </g>
              );
            })}

            {effectiveColPositions.map((position, index) => {
              const isSelected = selectedColIndexes.includes(index);
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
                    data-cast-a-net-interactive="true"
                    onMouseDown={handleColMouseDown(index)}
                    onWheel={handleWheel}
                    style={{ cursor: disabled ? 'not-allowed' : isShiftPressed ? 'copy' : 'col-resize' }}
                  />
                  <line
                    x1={x}
                    y1={netTop}
                    x2={x}
                    y2={netBottom}
                    stroke={isSelected ? '#1e8b72' : '#4A64E1'}
                    strokeWidth={isSelected ? GRID_LINE_THICKNESS + 1 : GRID_LINE_THICKNESS}
                    vectorEffect="non-scaling-stroke"
                    pointerEvents="none"
                  />
                </g>
              );
            })}

            <line
              x1={netLeft}
              y1={netTop}
              x2={netRight}
              y2={netTop}
              stroke="rgba(0, 0, 0, 0.001)"
              strokeWidth={GRID_HIT_THICKNESS}
              vectorEffect="non-scaling-stroke"
              pointerEvents="stroke"
              data-cast-a-net-interactive="true"
              onMouseDown={e => {
                e.stopPropagation();
                clearLineSelection();
                startDrag('resize-n')(e);
              }}
              onWheel={handleWheel}
              style={{ cursor: disabled ? 'not-allowed' : 'row-resize' }}
            />

            <line
              x1={netLeft}
              y1={netBottom}
              x2={netRight}
              y2={netBottom}
              stroke="rgba(0, 0, 0, 0.001)"
              strokeWidth={GRID_HIT_THICKNESS}
              vectorEffect="non-scaling-stroke"
              pointerEvents="stroke"
              data-cast-a-net-interactive="true"
              onMouseDown={e => {
                e.stopPropagation();
                clearLineSelection();
                startDrag('resize-s')(e);
              }}
              onWheel={handleWheel}
              style={{ cursor: disabled ? 'not-allowed' : 'row-resize' }}
            />

            <line
              x1={netLeft}
              y1={netTop}
              x2={netLeft}
              y2={netBottom}
              stroke="rgba(0, 0, 0, 0.001)"
              strokeWidth={GRID_HIT_THICKNESS}
              vectorEffect="non-scaling-stroke"
              pointerEvents="stroke"
              data-cast-a-net-interactive="true"
              onMouseDown={e => {
                e.stopPropagation();
                clearLineSelection();
                startDrag('resize-w')(e);
              }}
              onWheel={handleWheel}
              style={{ cursor: disabled ? 'not-allowed' : 'col-resize' }}
            />

            <line
              x1={netRight}
              y1={netTop}
              x2={netRight}
              y2={netBottom}
              stroke="rgba(0, 0, 0, 0.001)"
              strokeWidth={GRID_HIT_THICKNESS}
              vectorEffect="non-scaling-stroke"
              pointerEvents="stroke"
              data-cast-a-net-interactive="true"
              onMouseDown={e => {
                e.stopPropagation();
                clearLineSelection();
                startDrag('resize-e')(e);
              }}
              onWheel={handleWheel}
              style={{ cursor: disabled ? 'not-allowed' : 'col-resize' }}
            />

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
                data-cast-a-net-interactive="true"
                onMouseDown={e => {
                  e.stopPropagation();
                  clearLineSelection();
                  startDrag(handle.mode)(e);
                }}
                onWheel={handleWheel}
                style={{ cursor: disabled ? 'not-allowed' : handle.cursor }}
              />
            ))}
          </>
        ) : null}
      </svg>
    </div>
  );
}
