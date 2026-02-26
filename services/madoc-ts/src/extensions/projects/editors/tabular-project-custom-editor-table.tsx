import React from 'react';
import type { TabularCellRef } from '@/frontend/shared/utility/tabular-types';
import { AddIcon } from '@/frontend/shared/icons/AddIcon';
import { MinusIcon } from '@/frontend/shared/icons/MinusIcon';
import { Button } from '@/frontend/shared/navigation/Button';
import { TABULAR_COLUMN_MIN_WIDTH_PX } from '@/frontend/shared/utility/tabular-grid-constants';
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

function getTableCellClassName(isActiveCell: boolean, isFlagged: boolean) {
  return `border-b border-gray-200 px-2 py-2 align-top ${
    isActiveCell ? 'bg-amber-100 ring-2 ring-inset ring-amber-500' : isFlagged ? 'bg-red-50' : ''
  }`;
}

function FlaggedCellBadge() {
  return (
    <span
      className="absolute right-2 top-2 rounded border border-red-300 bg-red-100 px-1 text-[10px] font-semibold leading-4 text-red-700"
      title="Flagged for review"
    >
      <FlagIcon />
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
    ? 'border-amber-500 bg-amber-50 ring-2 ring-amber-500/40'
    : isFlagged
      ? 'border-red-300 bg-red-50'
      : 'border-gray-300';

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
      className={`w-full rounded border px-2 py-1 text-sm ${inputContainerClass}`}
      value={typeof value === 'string' ? value : value === null || typeof value === 'undefined' ? '' : String(value)}
      disabled={disabled}
      onFocus={onFocus}
      onChange={event => onChange(event.target.value)}
    />
  );
}

type TabularBodyCellProps = {
  cellElementId: string;
  inputId: string;
  value: unknown;
  fieldType?: string;
  disabled: boolean;
  isActiveCell: boolean;
  isFlagged: boolean;
  onActivate: () => void;
  onChange: (nextValue: unknown) => void;
};

function TabularBodyCell({
  cellElementId,
  inputId,
  value,
  fieldType,
  disabled,
  isActiveCell,
  isFlagged,
  onActivate,
  onChange,
}: TabularBodyCellProps) {
  return (
    <td
      className={getTableCellClassName(isActiveCell, isFlagged)}
      style={{ minWidth: TABULAR_COLUMN_MIN_WIDTH_PX }}
      id={cellElementId}
      onMouseDown={onActivate}
    >
      <div className="relative">
        {isFlagged ? <FlaggedCellBadge /> : null}
        {renderInput({
          inputId,
          value,
          fieldType,
          disabled,
          onFocus: onActivate,
          isActiveCell,
          isFlagged,
          onChange,
        })}
      </div>
    </td>
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

  return (
    <div className="flex min-h-0 flex-col overflow-hidden rounded border border-gray-300">
      <div className="min-h-0 overflow-x-auto overflow-y-auto">
        <table className="w-max min-w-full border-collapse">
          <thead className="sticky top-0 z-10">
            <tr>
              {headerColumns.map(column => {
                return (
                  <th
                    key={column.key}
                    className="border-b border-gray-300 bg-gray-50 px-2 py-2 text-left text-sm"
                    style={{ minWidth: TABULAR_COLUMN_MIN_WIDTH_PX }}
                  >
                    <div>{column.label}</div>
                    {column.description ? (
                      <div className="text-xs font-normal text-gray-600">{column.description}</div>
                    ) : null}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {rows.map(row => (
              <tr key={row.key} className={tableActiveCell?.row === row.rowIndex ? 'bg-amber-50' : undefined}>
                {row.cells.map(cell => {
                  const isActiveCell = tableActiveCell?.row === cell.rowIndex && tableActiveCell?.col === cell.colIndex;
                  const isFlagged = isCellFlagged(cell.rowIndex, cell.columnKey);

                  return (
                    <TabularBodyCell
                      key={`${cell.rowIndex}-${cell.columnKey}`}
                      cellElementId={cell.cellElementId}
                      inputId={cell.inputId}
                      value={cell.value}
                      fieldType={cell.fieldType}
                      disabled={disabled}
                      isActiveCell={isActiveCell}
                      isFlagged={isFlagged}
                      onActivate={() => onActiveCellChange({ row: cell.rowIndex, col: cell.colIndex })}
                      onChange={cell.onChange}
                    />
                  );
                })}
              </tr>
            ))}
            {showEmptyState ? (
              <tr>
                <td colSpan={Math.max(1, headerColumns.length)} className="px-3 py-6 text-center text-sm text-gray-600">
                  No rows yet. Use + to create the first row.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-center gap-12 border-t border-gray-300 bg-gray-300 px-3 py-1">
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
