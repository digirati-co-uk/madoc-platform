import React from 'react';
import type { TabularCellRef } from '../../../frontend/admin/components/tabular/cast-a-net/types';
import type { CaptureModelEditorApi } from '@/frontend/shared/capture-models/new/hooks/use-capture-model-editor-api';
import { AddIcon } from '@/frontend/shared/icons/AddIcon';
import { MinusIcon } from '@/frontend/shared/icons/MinusIcon';
import { Button } from '@/frontend/shared/navigation/Button';
import FlagIcon from '@/frontend/shared/icons/FlagIcon';
import { getTabularCellElementId } from './tabular-project-custom-editor-utils';

type TabularProjectCustomEditorTableProps = {
  table: CaptureModelEditorApi;
  columnLabels: Map<string, string>;
  columnHints: Map<string, string>;
  visibleColumns: CaptureModelEditorApi['columns'];
  visibleColumnKeys: string[];
  legacyColumnKeys: string[];
  legacyMutableRowCount: number;
  useLegacyTopLevelLayout: boolean;
  tableActiveCell: TabularCellRef | null;
  onActiveCellChange: (next: TabularCellRef | null) => void;
  disabled: boolean;
  canAddRow: boolean;
  canRemoveRow: boolean;
  addRowFromFooter: () => void;
  removeRowFromFooter: () => void;
  isCellFlagged: (rowIndex: number, columnKey: string) => boolean;
  onCreateLegacyField: (columnKey: string) => void;
};

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

export function TabularProjectCustomEditorTable({
  table,
  columnLabels,
  columnHints,
  visibleColumns,
  visibleColumnKeys,
  legacyColumnKeys,
  legacyMutableRowCount,
  useLegacyTopLevelLayout,
  tableActiveCell,
  onActiveCellChange,
  disabled,
  canAddRow,
  canRemoveRow,
  addRowFromFooter,
  removeRowFromFooter,
  isCellFlagged,
  onCreateLegacyField,
}: TabularProjectCustomEditorTableProps) {
  const isRemoveRowDisabled = disabled || !canRemoveRow;
  const isAddRowDisabled = disabled || !canAddRow;

  return (
    <div className="flex min-h-0 flex-col overflow-hidden rounded border border-gray-300">
      <div className="min-h-0 overflow-x-auto overflow-y-auto">
        <table className="w-max min-w-full border-collapse">
          <thead className="sticky top-0 z-10">
            <tr>
              {visibleColumnKeys.map(columnKey => {
                const column = visibleColumns.find(visibleColumn => visibleColumn.key === columnKey);

                return (
                  <th
                    key={columnKey}
                    className="border-b border-gray-300 bg-gray-50 px-2 py-2 text-left text-sm"
                    style={{ minWidth: 220 }}
                  >
                    <div>{columnLabels.get(columnKey) || column?.label || columnKey}</div>
                    {column?.description ? (
                      <div className="text-xs font-normal text-gray-600">{column.description}</div>
                    ) : null}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {useLegacyTopLevelLayout
              ? Array.from({ length: legacyMutableRowCount }, (_, rowIndex) => (
                  <tr
                    key={`legacy-row-${rowIndex}`}
                    className={tableActiveCell?.row === rowIndex ? 'bg-amber-50' : undefined}
                  >
                    {legacyColumnKeys.map((columnKey, colIndex) => {
                      const field = table.topLevelFields[columnKey]?.[rowIndex];
                      const fieldType = columnHints.get(columnKey);
                      const isActiveCell = tableActiveCell?.row === rowIndex && tableActiveCell?.col === colIndex;
                      const isFlagged = isCellFlagged(rowIndex, columnKey);
                      const cellElementId = getTabularCellElementId(rowIndex, columnKey, true);

                      return (
                        <td
                          key={`${rowIndex}-${columnKey}`}
                          className={`border-b border-gray-200 px-2 py-2 align-top ${
                            isActiveCell
                              ? 'bg-amber-100 ring-2 ring-inset ring-amber-500'
                              : isFlagged
                                ? 'bg-red-50'
                                : ''
                          }`}
                          style={{ minWidth: 220 }}
                          id={cellElementId}
                          onMouseDown={() => onActiveCellChange({ row: rowIndex, col: colIndex })}
                        >
                          <div className="relative">
                            {isFlagged ? (
                              <span
                                className="absolute right-2 top-2 rounded border border-red-300 bg-red-100 px-1 text-[10px] font-semibold leading-4 text-red-700"
                                title="Flagged for review"
                              >
                                <FlagIcon />
                              </span>
                            ) : null}
                            {renderInput({
                              inputId: `tabular-legacy-row-${rowIndex}-${columnKey}`,
                              value: field?.value,
                              fieldType,
                              disabled,
                              onFocus: () => onActiveCellChange({ row: rowIndex, col: colIndex }),
                              isActiveCell,
                              isFlagged,
                              onChange: nextValue => {
                                if (field) {
                                  field.setValue(nextValue);
                                  return;
                                }

                                onCreateLegacyField(columnKey);
                              },
                            })}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))
              : table.rows.map(row => (
                  <tr key={row.entityId} className={tableActiveCell?.row === row.rowIndex ? 'bg-amber-50' : undefined}>
                    {visibleColumns.map((column, colIndex) => {
                      const cell = row.getCell(column.key);
                      const fieldType = columnHints.get(column.key) || column.fieldType;
                      const isActiveCell = tableActiveCell?.row === row.rowIndex && tableActiveCell?.col === colIndex;
                      const isFlagged = isCellFlagged(row.rowIndex, column.key);
                      const cellElementId = getTabularCellElementId(row.rowIndex, column.key, false);

                      return (
                        <td
                          key={column.key}
                          className={`border-b border-gray-200 px-2 py-2 align-top ${
                            isActiveCell
                              ? 'bg-amber-100 ring-2 ring-inset ring-amber-500'
                              : isFlagged
                                ? 'bg-red-50'
                                : ''
                          }`}
                          style={{ minWidth: 220 }}
                          id={cellElementId}
                          onMouseDown={() => onActiveCellChange({ row: row.rowIndex, col: colIndex })}
                        >
                          <div className="relative">
                            {isFlagged ? (
                              <span
                                className="absolute right-2 top-2 rounded border border-red-300 bg-red-100 px-1 text-[10px] font-semibold leading-4 text-red-700"
                                title="Flagged for review"
                              >
                                <FlagIcon />
                              </span>
                            ) : null}
                            {renderInput({
                              inputId: `tabular-row-${row.rowIndex}-${column.key}`,
                              value: cell?.value,
                              fieldType,
                              disabled,
                              onFocus: () => onActiveCellChange({ row: row.rowIndex, col: colIndex }),
                              isActiveCell,
                              isFlagged,
                              onChange: nextValue => row.setCell(column.key, nextValue),
                            })}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
            {!useLegacyTopLevelLayout && table.rows.length === 0 ? (
              <tr>
                <td
                  colSpan={Math.max(1, visibleColumns.length)}
                  className="px-3 py-6 text-center text-sm text-gray-600"
                >
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
