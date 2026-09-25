import type { TabularCellRef } from '../types';

interface ActiveCellHighlightProps {
  activeCell?: TabularCellRef | null;
  colStops: number[];
  getProjectedRowBounds: (row: number) => { top: number; bottom: number } | undefined;
  netLeft: number;
  netRight: number;
  activeCellFillColor: string;
  activeCellStrokeColor: string;
  activeRowFillColor: string;
  activeRowStrokeColor: string;
  toCanvasX: (x: number) => number;
  toCanvasY: (y: number) => number;
  value: { width: number };
}

export function ActiveCellHighlight({
  activeCell,
  colStops,
  getProjectedRowBounds,
  netLeft,
  netRight,
  activeCellFillColor,
  activeCellStrokeColor,
  activeRowFillColor,
  activeRowStrokeColor,
  toCanvasX,
  toCanvasY,
  value,
}: ActiveCellHighlightProps) {
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
      {/* Background of whole row */}
      <rect
        x={netLeft}
        y={rowTop}
        width={value.width}
        height={rowHeight}
        fill={activeRowFillColor}
        pointerEvents="none"
      />

      {/* Line above row */}
      <line
        x1={netLeft}
        y1={rowTop}
        x2={netRight}
        y2={rowTop}
        stroke={activeRowStrokeColor}
        strokeWidth={2}
        vectorEffect="non-scaling-stroke"
        pointerEvents="none"
      />

      {/* Line below row */}
      <line
        x1={netLeft}
        y1={rowBottom}
        x2={netRight}
        y2={rowBottom}
        stroke={activeRowStrokeColor}
        strokeWidth={2}
        vectorEffect="non-scaling-stroke"
        pointerEvents="none"
      />

      {/* Active cell */}
      <rect
        x={cellLeft}
        y={rowTop}
        width={cellWidth}
        height={rowHeight}
        fill={activeCellFillColor}
        stroke={activeCellStrokeColor}
        strokeWidth={2}
        vectorEffect="non-scaling-stroke"
        pointerEvents="none"
      />
    </>
  );
}
