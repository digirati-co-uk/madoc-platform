import type { NetConfig } from './tabular-types';

export type TabularHorizontalAlignment = Pick<NetConfig, 'left' | 'width'>;
export const ALIGNMENT_STEP = 0.1;
export const MIN_ALIGNMENT_WIDTH = 1;

export function nudgeHorizontalAlignment(value: TabularHorizontalAlignment, delta: number): TabularHorizontalAlignment {
  if (!Number.isFinite(delta)) return value;
  return { ...value, left: Math.max(0, Math.min(100 - value.width, value.left + delta)) };
}

export function moveAlignmentEdge(
  value: TabularHorizontalAlignment,
  edge: 'left' | 'right',
  position: number
): TabularHorizontalAlignment {
  if (!Number.isFinite(position)) return value;
  const right = value.left + value.width;
  if (edge === 'left') {
    const left = Math.max(0, Math.min(right - MIN_ALIGNMENT_WIDTH, position));
    return { left, width: right - left };
  }
  return { left: value.left, width: Math.max(MIN_ALIGNMENT_WIDTH, Math.min(100, position) - value.left) };
}
