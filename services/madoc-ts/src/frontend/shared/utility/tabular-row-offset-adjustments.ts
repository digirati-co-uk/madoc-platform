import type { TabularRowOffsetAdjustment } from './tabular-types';

const MAX_ROW_OFFSET_PCT_OF_PAGE = 100;
const MIN_ROW_OFFSET_PCT_OF_PAGE = -100;
const ROW_OFFSET_EPSILON = 0.00001;

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const sanitizeStartRow = (value: unknown) => {
  const num = Number(value);
  if (!Number.isFinite(num)) {
    return null;
  }

  return Math.max(0, Math.floor(num));
};

const sanitizeOffset = (value: unknown) => {
  const num = Number(value);
  if (!Number.isFinite(num)) {
    return null;
  }

  return clamp(num, MIN_ROW_OFFSET_PCT_OF_PAGE, MAX_ROW_OFFSET_PCT_OF_PAGE);
};

export function sanitizeTabularRowOffsetAdjustments(
  adjustments: TabularRowOffsetAdjustment[] | undefined
): TabularRowOffsetAdjustment[] {
  if (!Array.isArray(adjustments) || !adjustments.length) {
    return [];
  }

  const byRow = new Map<number, number>();

  for (const adjustment of adjustments) {
    const startRow = sanitizeStartRow(adjustment?.startRow);
    const offset = sanitizeOffset(adjustment?.offsetPctOfPage);
    if (startRow == null || offset == null) {
      continue;
    }

    const existing = byRow.get(startRow) || 0;
    byRow.set(startRow, clamp(existing + offset, MIN_ROW_OFFSET_PCT_OF_PAGE, MAX_ROW_OFFSET_PCT_OF_PAGE));
  }

  return Array.from(byRow.entries())
    .filter(([_startRow, offset]) => Math.abs(offset) >= ROW_OFFSET_EPSILON)
    .sort(([leftRow], [rightRow]) => leftRow - rightRow)
    .map(([startRow, offsetPctOfPage]) => ({ startRow, offsetPctOfPage }));
}

export function addTabularRowOffsetAdjustment(
  adjustments: TabularRowOffsetAdjustment[] | undefined,
  startRow: number,
  offsetPctOfPage: number
): TabularRowOffsetAdjustment[] {
  const safeStartRow = sanitizeStartRow(startRow);
  const safeOffset = sanitizeOffset(offsetPctOfPage);

  if (safeStartRow == null || safeOffset == null || Math.abs(safeOffset) < ROW_OFFSET_EPSILON) {
    return sanitizeTabularRowOffsetAdjustments(adjustments);
  }

  return sanitizeTabularRowOffsetAdjustments([
    ...(adjustments || []),
    {
      startRow: safeStartRow,
      offsetPctOfPage: safeOffset,
    },
  ]);
}

export function getRowBoundaryOffsetPctOfPage(
  boundaryRow: number,
  adjustments: TabularRowOffsetAdjustment[] | undefined
): number {
  if (!adjustments?.length) {
    return 0;
  }

  const safeBoundary = Math.max(0, Math.floor(boundaryRow));
  let total = 0;

  for (const adjustment of adjustments) {
    if (adjustment.startRow > safeBoundary) {
      break;
    }
    total += adjustment.offsetPctOfPage;
  }

  return total;
}
