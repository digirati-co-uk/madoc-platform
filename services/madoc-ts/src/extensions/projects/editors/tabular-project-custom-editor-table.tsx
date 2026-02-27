import React, { useMemo } from 'react';
import { DataGrid, type Column } from 'react-data-grid';
import 'react-data-grid/lib/styles.css';
import type { TabularCellRef } from '@/frontend/shared/utility/tabular-types';
import { AddIcon } from '@/frontend/shared/icons/AddIcon';
import { MinusIcon } from '@/frontend/shared/icons/MinusIcon';
import { Button } from '@/frontend/shared/navigation/Button';
import {
  TABULAR_COLUMN_MIN_WIDTH_PX,
  TABULAR_GRID_HEADER_ROW_HEIGHT_PX,
  TABULAR_GRID_ROW_HEIGHT_PX,
} from '@/frontend/shared/utility/tabular-grid-constants';
import { TabularDataGridStyles } from '@/frontend/shared/components/TabularDataGridStyles';
import FlagIcon from '@/frontend/shared/icons/FlagIcon';
import type { TabularEditorHeaderModel, TabularEditorRowModel } from './tabular-project-custom-editor-table-model';

type TabularProjectCustomEditorTableProps = {
  headerColumns: TabularEditorHeaderModel[];
  rows: TabularEditorRowModel[];
  showEmptyState: boolean;
  tableActiveCell: TabularCellRef | null;
  onActiveCellChange: (next: TabularCellRef | null) => void;
  disabled: boolean;
  canAddRow: boolean;
  canRemoveRow: boolean;
  addRowFromFooter: () => void;
  removeRowFromFooter: () => void;
  isCellFlagged: (rowIndex: number, columnKey: string) => boolean;
};

type TabularGridRow = {
  id: string;
  rowIndex: number;
  row: TabularEditorRowModel;
};

function FlaggedCellBadge() {
  return (
    <span
      className="absolute right-2 top-2 rounded border border-red-300 bg-red-100 px-1 text-[10px] font-semibold leading-4 text-red-700"
      title="Flagged for review"
    >
      <FlagIcon className="h-3 w-3" />
    </span>
  );
}

function renderInput(options: {
  inputId: string;
  value: unknown;
  fieldType?: string;
  disabled: boolean;
  onChange: (nextValue: unknown) => void;
  onFocus: () => void;
  isActiveCell: boolean;
  isFlagged: boolean;
}) {
  const { inputId, value, fieldType, disabled, onChange, onFocus, isActiveCell, isFlagged } = options;

  const inputContainerClass = isActiveCell
    ? 'border-[#5071f4] bg-[#eaf0ff]'
    : isFlagged
      ? 'border-red-300 bg-red-50'
      : 'border-transparent bg-transparent';

  if (fieldType === 'checkbox-field') {
    return (
      <div className={`flex h-full items-center justify-center rounded border px-2 py-1 ${inputContainerClass}`}>
        <input
          id={inputId}
          type="checkbox"
          checked={!!value}
          disabled={disabled}
          onFocus={onFocus}
          onChange={event => onChange(event.target.checked)}
        />
      </div>
    );
  }

  return (
    <input
      id={inputId}
      className={`h-full w-full rounded border px-2 py-1 text-sm outline-none ${inputContainerClass}`}
      value={typeof value === 'string' ? value : value === null || typeof value === 'undefined' ? '' : String(value)}
      disabled={disabled}
      onFocus={onFocus}
      onChange={event => onChange(event.target.value)}
    />
  );
}

export function TabularProjectCustomEditorTable({
  headerColumns,
  rows,
  showEmptyState,
  tableActiveCell,
  onActiveCellChange,
  disabled,
  canAddRow,
  canRemoveRow,
  addRowFromFooter,
  removeRowFromFooter,
  isCellFlagged,
}: TabularProjectCustomEditorTableProps) {
  const isRemoveRowDisabled = disabled || !canRemoveRow;
  const isAddRowDisabled = disabled || !canAddRow;
  const headerRowHeight = TABULAR_GRID_HEADER_ROW_HEIGHT_PX;
  const rowHeight = TABULAR_GRID_ROW_HEIGHT_PX;
  const minGridWidth = Math.max(1, headerColumns.length) * TABULAR_COLUMN_MIN_WIDTH_PX + 2;

  const gridRows = useMemo<readonly TabularGridRow[]>(
    () =>
      rows.map(row => ({
        id: row.key,
        rowIndex: row.rowIndex,
        row,
      })),
    [rows]
  );

  const gridColumns = useMemo<readonly Column<TabularGridRow>[]>(() => {
    return headerColumns.map((column, colIndex) => {
      return {
        key: column.key,
        name: '',
        width: TABULAR_COLUMN_MIN_WIDTH_PX,
        sortable: false,
        resizable: false,
        renderHeaderCell: () => {
          const isActiveColumn = tableActiveCell?.col === colIndex;

          return (
            <div
              style={{
                height: '100%',
                background: isActiveColumn ? '#b9c8f5' : '#d9deee',
                boxShadow: isActiveColumn ? 'inset 0 0 0 2px #8aa3ea' : undefined,
                color: '#283452',
                display: 'grid',
                alignContent: 'center',
                padding: '8px 10px',
                textAlign: 'left',
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 600 }}>{column.label}</div>
              {column.description ? (
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 400,
                    lineHeight: 1.2,
                    opacity: 0.85,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {column.description}
                </div>
              ) : null}
            </div>
          );
        },
        renderCell: ({ row }) => {
          const cell = row.row.cells[colIndex];
          if (!cell) {
            return <div />;
          }

          const isActiveRow = tableActiveCell?.row === cell.rowIndex;
          const isActiveCell = isActiveRow && tableActiveCell?.col === colIndex;
          const isFlagged = isCellFlagged(cell.rowIndex, cell.columnKey);

          return (
            <div
              id={cell.cellElementId}
              onMouseDown={() => onActiveCellChange({ row: cell.rowIndex, col: colIndex })}
              style={{
                height: '100%',
                padding: 4,
                position: 'relative',
                background: isActiveCell ? '#eaf0ff' : isFlagged ? '#fef2f2' : isActiveRow ? '#f5f8ff' : '#fff',
              }}
            >
              {isFlagged ? <FlaggedCellBadge /> : null}
              {renderInput({
                inputId: cell.inputId,
                value: cell.value,
                fieldType: cell.fieldType,
                disabled,
                onFocus: () => onActiveCellChange({ row: cell.rowIndex, col: colIndex }),
                isActiveCell,
                isFlagged,
                onChange: cell.onChange,
              })}
            </div>
          );
        },
      } satisfies Column<TabularGridRow>;
    });
  }, [disabled, headerColumns, isCellFlagged, onActiveCellChange, tableActiveCell]);

  return (
    <div className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded border border-[#d6d6d6] bg-white">
      <TabularDataGridStyles scopeClassName="tabular-contributor-rdg" disableRowHover />
      <div className="min-h-0 min-w-0 flex-1 overflow-x-auto overflow-y-auto">
        <DataGrid
          className="rdg-light tabular-contributor-rdg"
          columns={gridColumns}
          rows={gridRows}
          rowKeyGetter={row => row.id}
          enableVirtualization={false}
          headerRowHeight={headerRowHeight}
          rowHeight={rowHeight}
          style={{
            height: '100%',
            minWidth: minGridWidth,
            border: 'none',
            ['--rdg-selection-width' as string]: '0px',
            ['--rdg-border-color' as string]: '#d6d6d6',
          }}
        />
      </div>
      {showEmptyState ? (
        <div className="border-t border-[#d6d6d6] px-3 py-6 text-center text-sm text-gray-600">
          No rows yet. Use + to create the first row.
        </div>
      ) : null}
      <div className="flex flex-none items-center justify-center gap-12 border-t border-gray-300 bg-gray-300 px-3 py-1">
        <Button
          type="button"
          onClick={removeRowFromFooter}
          disabled={isRemoveRowDisabled}
          title="Remove row"
          style={{ background: 'transparent', border: 'none' }}
        >
          <MinusIcon className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          onClick={addRowFromFooter}
          disabled={isAddRowDisabled}
          title="Add row"
          style={{ background: 'transparent', border: 'none' }}
        >
          <AddIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
