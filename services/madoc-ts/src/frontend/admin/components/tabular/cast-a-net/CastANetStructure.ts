import type {
  CastANetPayload,
  CastANetStructure,
  NetConfig,
  TabularModelPayload,
  TabularProjectSetupPayload,
} from './types';
import { NET_MIN_SIZE_PCT, clamp, getStops, normalisePositions, sanitizeIndexList } from './utils';

function sanitizeNetConfig(value: NetConfig): NetConfig {
  const rows = Math.max(1, Math.floor(value.rows || 0));
  const cols = Math.max(1, Math.floor(value.cols || 0));

  const minSize = NET_MIN_SIZE_PCT;
  const top = clamp(value.top ?? 0, 0, 100 - minSize);
  const left = clamp(value.left ?? 0, 0, 100 - minSize);
  const width = clamp(value.width ?? 0, minSize, 100 - left);
  const height = clamp(value.height ?? 0, minSize, 100 - top);

  return {
    ...value,
    rows,
    cols,
    top,
    left,
    width,
    height,
    rowPositions: normalisePositions(value.rowPositions || [], rows),
    colPositions: normalisePositions(value.colPositions || [], cols),
  };
}

function sanitizeBlankColumnIndexes(indexes: number[] | undefined, cols: number): number[] {
  return sanitizeIndexList(indexes, cols);
}

export function buildCastANetStructure(
  value: NetConfig,
  options?: {
    blankColumnIndexes?: number[];
  }
): CastANetStructure {
  const safe = sanitizeNetConfig(value);
  const rowStops = getStops(safe.rows, safe.rowPositions);
  const colStops = getStops(safe.cols, safe.colPositions);
  const blankColumnIndexes = sanitizeBlankColumnIndexes(options?.blankColumnIndexes, safe.cols);
  const blankSet = new Set(blankColumnIndexes);

  const columns = Array.from({ length: safe.cols }, (_, index) => {
    const leftPctOfTable = colStops[index] ?? 0;
    const rightPctOfTable = colStops[index + 1] ?? 100;
    const widthPctOfTable = rightPctOfTable - leftPctOfTable;
    const leftPctOfPage = safe.left + (leftPctOfTable / 100) * safe.width;
    const widthPctOfPage = (widthPctOfTable / 100) * safe.width;
    return {
      index,
      leftPctOfTable,
      leftPctOfPage,
      widthPctOfTable,
      widthPctOfPage,
      isBlank: blankSet.has(index),
    };
  });

  const rows = Array.from({ length: safe.rows }, (_, index) => {
    const topPctOfTable = rowStops[index] ?? 0;
    const bottomPctOfTable = rowStops[index + 1] ?? 100;
    const heightPctOfTable = bottomPctOfTable - topPctOfTable;
    const topPctOfPage = safe.top + (topPctOfTable / 100) * safe.height;
    const heightPctOfPage = (heightPctOfTable / 100) * safe.height;
    return {
      index,
      topPctOfTable,
      topPctOfPage,
      heightPctOfTable,
      heightPctOfPage,
    };
  });

  const right = safe.left + safe.width;
  const bottom = safe.top + safe.height;

  return {
    topLeft: { x: safe.left, y: safe.top },
    topRight: { x: right, y: safe.top },
    marginsPct: {
      top: safe.top,
      right: 100 - right,
      bottom: 100 - bottom,
      left: safe.left,
    },
    tableBoxPct: {
      top: safe.top,
      left: safe.left,
      right,
      bottom,
      width: safe.width,
      height: safe.height,
    },
    columnCount: safe.cols,
    rowCount: safe.rows,
    columnWidthsPctOfPage: columns.map(column => column.widthPctOfPage),
    rowHeightsPctOfPage: rows.map(row => row.heightPctOfPage),
    blankColumnIndexes,
    columns,
    rows,
  };
}

function buildCastANetPayload(structure: CastANetStructure): CastANetPayload {
  return {
    topLeft: structure.topLeft,
    topRight: structure.topRight,
    marginsPct: structure.marginsPct,
    columnCount: structure.columnCount,
    columnWidthsPctOfPage: structure.columnWidthsPctOfPage,
    rowHeightsPctOfPage: structure.rowHeightsPctOfPage,
    blankColumnIndexes: structure.blankColumnIndexes,
  };
}

function inferBlankColumnsFromModel(model: TabularModelPayload): number[] {
  const blank: number[] = [];
  model.columns.forEach((column, index) => {
    const type = (column.type || column.fieldType || '').trim();
    if (type === 'hidden' || type === 'hidden-field') {
      blank.push(index);
    }
  });
  return blank;
}

export function buildTabularProjectSetupPayload(
  value: NetConfig,
  model: TabularModelPayload,
  options?: { blankColumnIndexes?: number[] }
): TabularProjectSetupPayload {
  const inferred = inferBlankColumnsFromModel(model);
  const merged = [...(options?.blankColumnIndexes || []), ...inferred];
  const structure = buildCastANetStructure(value, {
    blankColumnIndexes: merged,
  });

  return {
    structure: buildCastANetPayload(structure),
    model,
  };
}
