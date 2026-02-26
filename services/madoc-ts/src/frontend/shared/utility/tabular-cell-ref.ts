import type { TabularCellRef } from '@/frontend/shared/utility/tabular-types';

export function offsetTabularCellRef(
  activeCell: TabularCellRef | null | undefined,
  rowOffset: number
): TabularCellRef | null {
  if (!activeCell) {
    return null;
  }

  return {
    row: activeCell.row + rowOffset,
    col: activeCell.col,
  };
}
