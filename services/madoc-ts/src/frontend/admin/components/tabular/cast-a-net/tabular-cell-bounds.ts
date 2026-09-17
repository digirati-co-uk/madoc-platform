import type { NetConfig, TabularCellRef } from './types';
import { getEffectivePositions, getStops } from './utils';
import { getProjectedBodyRowHeightPctOfTable, getTabularRowBoundsPctOfTable } from './projected-row-bounds';
import { sanitizeTabularRowOffsetAdjustments } from '../../../../shared/utility/tabular-row-offset-adjustments';

export function getTabularCellBounds(
  value: NetConfig,
  cell: TabularCellRef,
  canvas: { width: number; height: number }
) {
  const rows = Math.max(1, Math.floor(value.rows || 1));
  const cols = Math.max(1, Math.floor(value.cols || 1));
  const rowStops = getStops(rows, getEffectivePositions(rows, value.rowPositions));
  const colStops = getStops(cols, getEffectivePositions(cols, value.colPositions));
  const row = getTabularRowBoundsPctOfTable({
    rowIndex: cell.row,
    rowStops,
    rowCount: rows,
    projectedBodyRowHeightPctOfTable: getProjectedBodyRowHeightPctOfTable(rowStops, rows),
    rowOffsetAdjustments: sanitizeTabularRowOffsetAdjustments(value.rowOffsetAdjustments),
    netHeightPctOfPage: value.height,
  });
  const left = colStops[cell.col];
  const right = colStops[cell.col + 1];
  if (!row || left == null || right == null) return null;
  return {
    x: ((value.left + (left / 100) * value.width) / 100) * canvas.width,
    y: ((value.top + (row.top / 100) * value.height) / 100) * canvas.height,
    width: ((((right - left) / 100) * value.width) / 100) * canvas.width,
    height: ((((row.bottom - row.top) / 100) * value.height) / 100) * canvas.height,
  };
}
