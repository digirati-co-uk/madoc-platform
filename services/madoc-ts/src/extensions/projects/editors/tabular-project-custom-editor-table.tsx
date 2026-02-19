import React from 'react';
import type { TabularCellRef } from '../../../frontend/admin/components/tabular/cast-a-net/types';
import type { CaptureModelEditorApi } from '@/frontend/shared/capture-models/new/hooks/use-capture-model-editor-api';

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
}) {
  const { inputId, value, fieldType, disabled, onChange, onFocus, isActiveCell } = options;

  if (fieldType === 'checkbox-field') {
    return (
      <div className="flex h-full items-center justify-center">
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
      className={`w-full rounded border px-2 py-1 text-sm ${
        isActiveCell ? 'border-emerald-600 ring-2 ring-emerald-500/40' : 'border-gray-300'
      }`}
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
  onCreateLegacyField,
}: TabularProjectCustomEditorTableProps) {
  return (
    <div
      className="flex min-h-0 flex-1 flex-col overflow-hidden rounded border border-gray-300"
      style={{ minHeight: 220 }}
    >
      <div className="min-h-0 flex-1 overflow-x-auto overflow-y-auto" style={{ minHeight: 160 }}>
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
                    className={tableActiveCell?.row === rowIndex ? 'bg-emerald-50' : undefined}
                  >
                    {legacyColumnKeys.map((columnKey, colIndex) => {
                      const field = table.topLevelFields[columnKey]?.[rowIndex];
                      const fieldType = columnHints.get(columnKey);
                      const isActiveCell =
                        tableActiveCell?.row === rowIndex && tableActiveCell?.col === colIndex;

                      return (
                        <td
                          key={`${rowIndex}-${columnKey}`}
                          className={`border-b border-gray-200 px-2 py-2 align-top ${
                            isActiveCell ? 'bg-emerald-100' : ''
                          }`}
                          style={{ minWidth: 220 }}
                        >
                          {renderInput({
                            inputId: `tabular-legacy-row-${rowIndex}-${columnKey}`,
                            value: field?.value,
                            fieldType,
                            disabled,
                            onFocus: () => onActiveCellChange({ row: rowIndex, col: colIndex }),
                            isActiveCell,
                            onChange: nextValue => {
                              if (field) {
                                field.setValue(nextValue);
                                return;
                              }

                              onCreateLegacyField(columnKey);
                            },
                          })}
                        </td>
                      );
                    })}
                  </tr>
                ))
              : table.rows.map(row => (
                  <tr
                    key={row.entityId}
                    className={tableActiveCell?.row === row.rowIndex ? 'bg-emerald-50' : undefined}
                  >
                    {visibleColumns.map((column, colIndex) => {
                      const cell = row.getCell(column.key);
                      const fieldType = columnHints.get(column.key) || column.fieldType;
                      const isActiveCell =
                        tableActiveCell?.row === row.rowIndex && tableActiveCell?.col === colIndex;

                      return (
                        <td
                          key={column.key}
                          className={`border-b border-gray-200 px-2 py-2 align-top ${
                            isActiveCell ? 'bg-emerald-100' : ''
                          }`}
                          style={{ minWidth: 220 }}
                        >
                          {renderInput({
                            inputId: `tabular-row-${row.rowIndex}-${column.key}`,
                            value: cell?.value,
                            fieldType,
                            disabled,
                            onFocus: () => onActiveCellChange({ row: row.rowIndex, col: colIndex }),
                            isActiveCell,
                            onChange: nextValue => row.setCell(column.key, nextValue),
                          })}
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
      <div className="flex items-center justify-center gap-8 border-t border-gray-300 bg-gray-50 px-3 py-2">
        <button
          type="button"
          onClick={removeRowFromFooter}
          disabled={disabled || !canRemoveRow}
          title="Remove row"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 34,
            height: 34,
            borderRadius: 6,
            border: '1px solid #98a3b8',
            background: '#fff',
            color: '#2f3a4f',
            fontSize: 24,
            lineHeight: 1,
            cursor: disabled || !canRemoveRow ? 'not-allowed' : 'pointer',
            opacity: disabled || !canRemoveRow ? 0.55 : 1,
          }}
        >
          -
        </button>
        <button
          type="button"
          onClick={addRowFromFooter}
          disabled={disabled || !canAddRow}
          title="Add row"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 34,
            height: 34,
            borderRadius: 6,
            border: '1px solid #98a3b8',
            background: '#fff',
            color: '#2f3a4f',
            fontSize: 24,
            lineHeight: 1,
            cursor: disabled || !canAddRow ? 'not-allowed' : 'pointer',
            opacity: disabled || !canAddRow ? 0.55 : 1,
          }}
        >
          +
        </button>
      </div>
    </div>
  );
}
