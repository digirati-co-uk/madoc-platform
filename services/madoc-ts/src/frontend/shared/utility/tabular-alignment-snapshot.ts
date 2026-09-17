import type { NetConfig } from './tabular-types';

/** Image-relative percentages, frozen with a contribution rather than its project template. */
export type TabularAlignmentSnapshot = {
  version: 1;
  net: NetConfig;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isPositions(value: unknown): value is number[] {
  return (
    Array.isArray(value) &&
    value.every(
      (position, index) =>
        isFiniteNumber(position) && position >= 0 && position <= 100 && (index === 0 || position >= value[index - 1])
    )
  );
}

export function isTabularAlignmentSnapshot(value: unknown): value is TabularAlignmentSnapshot {
  if (!isRecord(value) || value.version !== 1 || !isRecord(value.net)) return false;
  const net = value.net;
  return (
    isFiniteNumber(net.rows) &&
    Number.isInteger(net.rows) &&
    net.rows > 0 &&
    isFiniteNumber(net.cols) &&
    Number.isInteger(net.cols) &&
    net.cols > 0 &&
    isFiniteNumber(net.top) &&
    net.top >= 0 &&
    net.top <= 100 &&
    isFiniteNumber(net.left) &&
    net.left >= 0 &&
    net.left <= 100 &&
    isFiniteNumber(net.width) &&
    net.width > 0 &&
    net.width <= 100 &&
    isFiniteNumber(net.height) &&
    net.height > 0 &&
    net.height <= 100 &&
    isPositions(net.rowPositions) &&
    net.rowPositions.length <= net.rows - 1 &&
    isPositions(net.colPositions) &&
    net.colPositions.length <= net.cols - 1 &&
    Array.isArray(net.rowOffsetAdjustments) &&
    net.rowOffsetAdjustments.every(
      adjustment =>
        isRecord(adjustment) &&
        isFiniteNumber(adjustment.startRow) &&
        Number.isInteger(adjustment.startRow) &&
        adjustment.startRow >= 0 &&
        isFiniteNumber(adjustment.offsetPctOfPage)
    )
  );
}

export function resolveTabularAlignment(snapshot: unknown, fallback: NetConfig | null): NetConfig | null {
  return isTabularAlignmentSnapshot(snapshot) ? snapshot.net : fallback;
}
