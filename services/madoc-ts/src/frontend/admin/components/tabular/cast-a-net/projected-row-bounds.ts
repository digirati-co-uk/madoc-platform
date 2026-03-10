import type { TabularRowOffsetAdjustment } from '@/frontend/shared/utility/tabular-types';
import { getRowBoundaryOffsetPctOfPage } from '@/frontend/shared/utility/tabular-row-offset-adjustments';

type RowBounds = { top: number; bottom: number };

const MIN_PROJECTED_BODY_ROW_HEIGHT_PCT = 0.05;
const MIN_ROW_HEIGHT_PCT = 0.01;

export function getProjectedBodyRowHeightPctOfTable(rowStops: number[], rowCount: number) {
  if (rowStops.length < 2) {
    return 0;
  }

  const rowHeights = Array.from({ length: rowCount }, (_, index) => {
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

  const bodyRows = rowHeights.slice(1);
  const targetRows = bodyRows.length ? bodyRows : rowHeights;
  const total = targetRows.reduce((sum, height) => sum + height, 0);
  return total / targetRows.length;
}

function getBaseRowBoundsInTablePct(
  rowIndex: number,
  rowStops: number[],
  rowCount: number,
  projectedBodyRowHeightPctOfTable: number
): RowBounds | null {
  const directTop = rowStops[rowIndex];
  const directBottom = rowStops[rowIndex + 1];
  if (directTop != null && directBottom != null) {
    return {
      top: directTop,
      bottom: directBottom,
    };
  }

  if (projectedBodyRowHeightPctOfTable <= 0 || rowIndex < rowCount) {
    return null;
  }

  const beyond = rowIndex - rowCount;
  const safeProjectedHeight = Math.max(MIN_PROJECTED_BODY_ROW_HEIGHT_PCT, projectedBodyRowHeightPctOfTable);
  const top = 100 + beyond * safeProjectedHeight;
  return {
    top,
    bottom: top + safeProjectedHeight,
  };
}

export function getTabularRowBoundsPctOfTable(options: {
  rowIndex: number;
  rowStops: number[];
  rowCount: number;
  projectedBodyRowHeightPctOfTable: number;
  rowOffsetAdjustments: TabularRowOffsetAdjustment[];
  netHeightPctOfPage: number;
}): RowBounds | null {
  const { rowIndex, rowStops, rowCount, projectedBodyRowHeightPctOfTable, rowOffsetAdjustments, netHeightPctOfPage } =
    options;

  const bounds = getBaseRowBoundsInTablePct(rowIndex, rowStops, rowCount, projectedBodyRowHeightPctOfTable);
  if (!bounds) {
    return null;
  }

  if (!rowOffsetAdjustments.length || netHeightPctOfPage <= 0) {
    return bounds;
  }

  const pagePctToTablePct = 100 / netHeightPctOfPage;
  const topOffset = getRowBoundaryOffsetPctOfPage(rowIndex, rowOffsetAdjustments) * pagePctToTablePct;
  const bottomOffset = getRowBoundaryOffsetPctOfPage(rowIndex + 1, rowOffsetAdjustments) * pagePctToTablePct;
  const top = bounds.top + topOffset;
  const bottom = bounds.bottom + bottomOffset;

  return {
    top,
    bottom: Math.max(top + MIN_ROW_HEIGHT_PCT, bottom),
  };
}
