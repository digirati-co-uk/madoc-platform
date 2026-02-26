import type { NetConfig } from '@/frontend/shared/utility/tabular-types';

export type TabularStructureLike = {
  topLeft?: { x: number; y: number };
  topRight?: { x: number; y: number };
  marginsPct?: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  };
  columnCount?: number;
  columnWidthsPctOfPage?: number[];
  rowHeightsPctOfPage?: number[];
};

export type TabularNetConfigOptions = {
  useEvenlySpacedFallbackPositions?: boolean;
};

export function clampToRange(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function makeEvenRelativePositions(count: number): number[] {
  if (count <= 1) {
    return [];
  }

  const step = 100 / count;
  return Array.from({ length: count - 1 }, (_item, index) => step * (index + 1));
}

function toRelativePositions(
  parts: number[] | undefined,
  total: number,
  count: number,
  useEvenlySpacedFallbackPositions: boolean
): number[] {
  if (!parts?.length || total <= 0 || count <= 1) {
    return useEvenlySpacedFallbackPositions ? makeEvenRelativePositions(count) : [];
  }

  let cumulative = 0;
  const positions: number[] = [];
  for (let index = 0; index < count - 1; index += 1) {
    cumulative += parts[index] ?? 0;
    const ratio = (cumulative / total) * 100;
    positions.push(clampToRange(ratio, 0, 100));
  }
  return positions;
}

export function netConfigFromSharedStructure(
  tabular?: TabularStructureLike,
  options: TabularNetConfigOptions = {}
): NetConfig | null {
  if (!tabular) {
    return null;
  }

  const rowHeights = tabular.rowHeightsPctOfPage || [];
  const columnWidths = tabular.columnWidthsPctOfPage || [];
  const fallbackLeft = tabular.topLeft?.x ?? 10;
  const fallbackTop = tabular.topLeft?.y ?? 10;
  const fallbackWidth = (tabular.topRight?.x ?? 90) - fallbackLeft;
  const widthFromMargins = 100 - (tabular.marginsPct?.left ?? fallbackLeft) - (tabular.marginsPct?.right ?? 10);
  const totalWidth = clampToRange(widthFromMargins > 0 ? widthFromMargins : fallbackWidth, 1, 100);

  const totalHeightFromRows = rowHeights.reduce((sum, rowHeight) => sum + rowHeight, 0);
  const heightFromMargins = 100 - (tabular.marginsPct?.top ?? fallbackTop) - (tabular.marginsPct?.bottom ?? 10);
  const totalHeight = clampToRange(heightFromMargins > 0 ? heightFromMargins : totalHeightFromRows, 1, 100);

  const left = clampToRange(tabular.marginsPct?.left ?? fallbackLeft, 0, 100 - totalWidth);
  const top = clampToRange(tabular.marginsPct?.top ?? fallbackTop, 0, 100 - totalHeight);

  const cols = Math.max(1, tabular.columnCount || columnWidths.length || 1);
  const rows = Math.max(1, rowHeights.length || 1);

  return {
    rows,
    cols,
    top,
    left,
    width: totalWidth,
    height: totalHeight,
    rowPositions: toRelativePositions(rowHeights, totalHeight, rows, options.useEvenlySpacedFallbackPositions === true),
    colPositions: toRelativePositions(
      columnWidths,
      totalWidth,
      cols,
      options.useEvenlySpacedFallbackPositions === true
    ),
  };
}
