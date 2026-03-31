import { useCallback, useMemo } from 'react';
import { type TabularCellRef } from './types';
import { TabularProjectCustomEditorTable } from '@/extensions/projects/editors/tabular-project-custom-editor-table';
import { parseTabularDropdownOptionsText } from './TabularModel';
import type {
  TabularEditorHeaderModel,
  TabularEditorRowModel,
} from '@/extensions/projects/editors/tabular-project-custom-editor-table-model';

export type TabularPreviewTableProps = {
  headings: string[];
  tooltips?: (string | undefined)[];
  rows: number;
  values: string[][];
  fieldTypes?: (string | undefined)[];
  dropdownOptionsText?: (string | undefined)[];
  onChange: (next: string[][]) => void;
  activeCell: TabularCellRef | null;
  onActiveCellChange: (next: TabularCellRef | null) => void;
  disabled?: boolean;
  onAddRow?: () => void;
  onRemoveRow?: () => void;
  canRemoveRow?: boolean;
  addRowLabel?: string;
  removeRowLabel?: string;
  containerHeight?: number | string;
  containerWidth?: number | string;
};

function getPreviewInputId(rowIndex: number, colIndex: number) {
  return `tabular-preview-row-${rowIndex}-col-${colIndex}`;
}

function getPreviewCellElementId(rowIndex: number, colIndex: number) {
  return `tabular-preview-cell-${rowIndex}-col-${colIndex}`;
}

function toTextValue(value: unknown): string {
  return typeof value === 'string' ? value : value === null || typeof value === 'undefined' ? '' : String(value);
}

export function TabularPreviewTable({
  headings,
  tooltips = [],
  rows,
  values,
  fieldTypes = [],
  dropdownOptionsText = [],
  onChange,
  activeCell,
  onActiveCellChange,
  disabled = false,
  onAddRow,
  onRemoveRow,
  canRemoveRow = true,
  addRowLabel = '+ Add row',
  removeRowLabel = 'Remove row -',
  containerHeight,
  containerWidth,
}: TabularPreviewTableProps) {
  const safeColumns = Math.max(1, headings.length);
  const safeRows = Math.max(1, rows);

  const safeHeadings = useMemo(
    () =>
      Array.from({ length: safeColumns }, (_, index) => {
        const value = (headings[index] || '').trim();
        return value || `Column ${index + 1}`;
      }),
    [headings, safeColumns]
  );

  const safeTooltips = useMemo(
    () => Array.from({ length: safeColumns }, (_, index) => (tooltips[index] || '').trim()),
    [tooltips, safeColumns]
  );
  const safeFieldTypes = useMemo(
    () => Array.from({ length: safeColumns }, (_, index) => fieldTypes[index] ?? 'text-field'),
    [fieldTypes, safeColumns]
  );
  const safeDropdownOptionsByColumn = useMemo(
    () =>
      Array.from({ length: safeColumns }, (_unused, colIndex) => {
        if (safeFieldTypes[colIndex] !== 'dropdown-field') {
          return [];
        }
        return parseTabularDropdownOptionsText(dropdownOptionsText[colIndex]);
      }),
    [dropdownOptionsText, safeColumns, safeFieldTypes]
  );

  const safeValues = useMemo(
    () =>
      Array.from({ length: safeRows }, (_row, rowIndex) =>
        Array.from({ length: safeColumns }, (_col, colIndex) => values[rowIndex]?.[colIndex] ?? '')
      ),
    [values, safeRows, safeColumns]
  );

  const updateCell = useCallback(
    (rowIndex: number, colIndex: number, nextValue: string) => {
      const nextRows = safeValues.map(row => row.slice());
      nextRows[rowIndex][colIndex] = nextValue;
      onChange(nextRows);
    },
    [onChange, safeValues]
  );

  const headerColumns = useMemo<TabularEditorHeaderModel[]>(
    () =>
      Array.from({ length: safeColumns }, (_unused, colIndex) => ({
        key: `c-${colIndex}`,
        label: safeHeadings[colIndex] ?? `Column ${colIndex + 1}`,
        description: safeTooltips[colIndex] || undefined,
      })),
    [safeColumns, safeHeadings, safeTooltips]
  );

  const tableRows = useMemo<TabularEditorRowModel[]>(
    () =>
      Array.from({ length: safeRows }, (_unused, rowIndex) => ({
        key: `preview-row-${rowIndex}`,
        rowIndex,
        cells: Array.from({ length: safeColumns }, (_unusedCell, colIndex) => {
          const columnKey = `c-${colIndex}`;
          const value = safeValues[rowIndex]?.[colIndex] ?? '';

          return {
            key: `${rowIndex}-${columnKey}`,
            rowIndex,
            colIndex,
            columnKey,
            fieldType: safeFieldTypes[colIndex] ?? 'text-field',
            fieldOptions: safeDropdownOptionsByColumn[colIndex],
            value,
            cellElementId: getPreviewCellElementId(rowIndex, colIndex),
            inputId: getPreviewInputId(rowIndex, colIndex),
            onChange: nextValue => updateCell(rowIndex, colIndex, toTextValue(nextValue)),
          };
        }),
      })),
    [safeColumns, safeDropdownOptionsByColumn, safeFieldTypes, safeRows, safeValues, updateCell]
  );

  const hasFixedHeight = typeof containerHeight !== 'undefined';
  const showAddRowControl = !!onAddRow;
  const showRemoveRowControl = !!onRemoveRow;
  const showRowControls = showAddRowControl || showRemoveRowControl;

  return (
    <div
      style={{
        height: containerHeight,
        width: containerWidth || '100%',
        maxWidth: '100%',
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <TabularProjectCustomEditorTable
        headerColumns={headerColumns}
        rows={tableRows}
        showEmptyState={false}
        showRowControls={showRowControls}
        showAddRowControl={showAddRowControl}
        showRemoveRowControl={showRemoveRowControl}
        addRowLabel={addRowLabel}
        removeRowLabel={removeRowLabel}
        tableActiveCell={activeCell}
        onActiveCellChange={onActiveCellChange}
        disabled={disabled}
        canAddRow={!!onAddRow && !disabled}
        canRemoveRow={!!onRemoveRow && canRemoveRow && !disabled}
        addRowFromFooter={() => onAddRow?.()}
        removeRowFromFooter={() => onRemoveRow?.()}
        isCellFlagged={() => false}
        containerClassName={hasFixedHeight ? 'h-full flex-1' : undefined}
        containerStyle={{ width: '100%', minHeight: 0 }}
      />
    </div>
  );
}
