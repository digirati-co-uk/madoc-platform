import type { DataGridHandle } from 'react-data-grid';

type ScrollTabularGridCellOptions = {
  gridRowIndex?: number;
  gridColumnIndex?: number;
};

export function scrollTabularGridCellIntoView(
  dataGrid: DataGridHandle | null | undefined,
  options: ScrollTabularGridCellOptions
) {
  if (!dataGrid) {
    return;
  }

  const { gridRowIndex, gridColumnIndex } = options;
  const hasRowIndex = typeof gridRowIndex === 'number' && Number.isFinite(gridRowIndex);
  const hasColumnIndex = typeof gridColumnIndex === 'number' && Number.isFinite(gridColumnIndex);

  if (!hasRowIndex && !hasColumnIndex) {
    return;
  }

  dataGrid.scrollToCell({
    rowIdx: hasRowIndex ? gridRowIndex : undefined,
    idx: hasColumnIndex ? gridColumnIndex : undefined,
  });
}
