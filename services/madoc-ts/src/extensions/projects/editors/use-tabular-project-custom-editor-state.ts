import { useCallback, useEffect, useMemo, useState } from 'react';
import type { CaptureModelEditorApi } from '@/frontend/shared/capture-models/new/hooks/use-capture-model-editor-api';
import { offsetTabularCellRef } from '@/frontend/shared/utility/tabular-cell-ref';
import type { NetConfig, TabularCellRef } from '@/frontend/shared/utility/tabular-types';
import {
  createTabularColumnModel,
  getTabularCellElementId,
  isHiddenFieldType,
  isTabularSystemProperty,
  type TabularModelColumn,
} from './tabular-project-custom-editor-utils';
import type { TabularEditorHeaderModel, TabularEditorRowModel } from './tabular-project-custom-editor-table-model';

type CreateNewFieldInstanceAction = (payload: {
  path: Array<[string, string]>;
  property: string;
  revisionId?: string;
  withId?: string;
  multipleOverride?: boolean;
}) => void;

type RemoveInstanceAction = (payload: { path: Array<[string, string]>; revisionId?: string }) => void;

type UseTabularProjectCustomEditorStateProps = {
  table: CaptureModelEditorApi;
  tabularColumns: TabularModelColumn[];
  netConfig: NetConfig | null;
  createNewFieldInstance: CreateNewFieldInstanceAction;
  removeInstance: RemoveInstanceAction;
};

type UseTabularProjectCustomEditorStateResult = {
  tableActiveCell: TabularCellRef | null;
  setTableActiveCell: (next: TabularCellRef | null) => void;
  overlayActiveCell: TabularCellRef | null;
  visibleColumnKeys: string[];
  headerColumns: TabularEditorHeaderModel[];
  tableRows: TabularEditorRowModel[];
  showEmptyTableState: boolean;
  useLegacyTopLevelLayout: boolean;
  visibleTableErrors: string[];
  canAddRow: boolean;
  canRemoveRow: boolean;
  addRowFromFooter: () => void;
  removeRowFromFooter: () => number | null;
};

export function useTabularProjectCustomEditorState({
  table,
  tabularColumns,
  netConfig,
  createNewFieldInstance,
  removeInstance,
}: UseTabularProjectCustomEditorStateProps): UseTabularProjectCustomEditorStateResult {
  const [tableActiveCell, setTableActiveCell] = useState<TabularCellRef | null>(null);

  const columnModel = useMemo(() => createTabularColumnModel(tabularColumns), [tabularColumns]);

  const visibleColumns = useMemo(() => {
    const tableColumnsById = new Map(table.columns.map(column => [column.key, column]));
    const ordered = columnModel.order
      .map(columnId => tableColumnsById.get(columnId))
      .filter((column): column is (typeof table.columns)[number] => !!column);

    const used = new Set(ordered.map(column => column.key));
    const dynamic = table.columns.filter(column => {
      if (used.has(column.key)) {
        return false;
      }
      if (columnModel.hidden.has(column.key)) {
        return false;
      }
      return !isHiddenFieldType(column.fieldType);
    });

    return [...ordered, ...dynamic];
  }, [columnModel.hidden, columnModel.order, table]);

  const legacyColumnKeys = useMemo(() => {
    const fromTemplate = columnModel.order.filter(columnKey => !columnModel.hidden.has(columnKey));
    const fromTemplateSet = new Set(fromTemplate);
    const dynamic = Object.keys(table.topLevelFields).filter(
      columnKey =>
        !isTabularSystemProperty(columnKey) && !columnModel.hidden.has(columnKey) && !fromTemplateSet.has(columnKey)
    );
    return [...fromTemplate, ...dynamic];
  }, [columnModel.hidden, columnModel.order, table.topLevelFields]);

  const useLegacyTopLevelLayout = table.status !== 'ready' && legacyColumnKeys.length > 0;

  const visibleTableErrors = useMemo(() => {
    if (!useLegacyTopLevelLayout) {
      return table.errors;
    }

    return table.errors.filter(error => !error.includes('Table property "rows"'));
  }, [table.errors, useLegacyTopLevelLayout]);

  const legacyMutableColumnKeys = useMemo(() => {
    const existingConfiguredKeys = legacyColumnKeys.filter(columnKey => !!table.topLevelFields[columnKey]);
    if (existingConfiguredKeys.length) {
      return existingConfiguredKeys;
    }
    return Object.keys(table.topLevelFields).filter(columnKey => !isTabularSystemProperty(columnKey));
  }, [legacyColumnKeys, table.topLevelFields]);

  const legacyMutableRowCount = useMemo(() => {
    const largest = legacyMutableColumnKeys.reduce((max, columnKey) => {
      const size = table.topLevelFields[columnKey]?.length || 0;
      return Math.max(max, size);
    }, 0);

    return Math.max(1, largest);
  }, [legacyMutableColumnKeys, table.topLevelFields]);

  const visibleColumnKeys = useMemo(() => {
    return useLegacyTopLevelLayout ? legacyColumnKeys : visibleColumns.map(column => column.key);
  }, [legacyColumnKeys, useLegacyTopLevelLayout, visibleColumns]);

  const displayedRowCount = useMemo(() => {
    return useLegacyTopLevelLayout ? legacyMutableRowCount : table.rows.length;
  }, [legacyMutableRowCount, table.rows.length, useLegacyTopLevelLayout]);

  useEffect(() => {
    if (!tableActiveCell) {
      return;
    }

    if (tableActiveCell.row < displayedRowCount && tableActiveCell.col < visibleColumnKeys.length) {
      return;
    }

    setTableActiveCell(null);
  }, [displayedRowCount, tableActiveCell, visibleColumnKeys.length]);

  const overlayActiveCell = useMemo<TabularCellRef | null>(() => {
    if (!netConfig) {
      return null;
    }

    // Row 0 in cast-a-net is the heading row, so contributor data rows start at +1.
    return offsetTabularCellRef(tableActiveCell, 1);
  }, [netConfig, tableActiveCell]);

  const addLegacyRow = useCallback(() => {
    for (const columnKey of legacyMutableColumnKeys) {
      try {
        createNewFieldInstance({ path: [], property: columnKey, multipleOverride: true });
      } catch {
        // Error is surfaced through table.errors from helper hooks.
      }
    }
  }, [createNewFieldInstance, legacyMutableColumnKeys]);

  const removeLegacyRow = useCallback(
    (rowIndex: number) => {
      for (const columnKey of legacyMutableColumnKeys) {
        const field = table.topLevelFields[columnKey]?.[rowIndex];
        if (!field) {
          continue;
        }

        try {
          removeInstance({ path: field.path });
        } catch {
          // Error is surfaced through table.errors from helper hooks.
        }
      }
    },
    [legacyMutableColumnKeys, removeInstance, table.topLevelFields]
  );

  const createLegacyField = useCallback(
    (columnKey: string) => {
      try {
        createNewFieldInstance({
          path: [],
          property: columnKey,
          multipleOverride: true,
        });
      } catch {
        // Error is surfaced through table.errors from helper hooks.
      }
    },
    [createNewFieldInstance]
  );

  const addRowFromFooter = useCallback(() => {
    if (useLegacyTopLevelLayout) {
      addLegacyRow();
      return;
    }

    table.addRow();
  }, [addLegacyRow, table, useLegacyTopLevelLayout]);

  const removeRowFromFooter = useCallback(() => {
    if (useLegacyTopLevelLayout) {
      if (legacyMutableRowCount < 2) {
        return null;
      }

      const targetRow =
        tableActiveCell && tableActiveCell.row >= 0 && tableActiveCell.row < legacyMutableRowCount
          ? tableActiveCell.row
          : legacyMutableRowCount - 1;
      removeLegacyRow(targetRow);
      return targetRow;
    }

    if (table.rowCount < 2) {
      return null;
    }

    const selectedRow = tableActiveCell?.row;
    const selectedExists = typeof selectedRow === 'number' && table.rows.some(row => row.rowIndex === selectedRow);
    const fallbackRow = table.rows[table.rows.length - 1]?.rowIndex;
    const targetRow = selectedExists ? selectedRow : fallbackRow;

    if (typeof targetRow === 'number') {
      table.removeRow(targetRow);
      return targetRow;
    }

    return null;
  }, [legacyMutableRowCount, removeLegacyRow, table, tableActiveCell, useLegacyTopLevelLayout]);

  const canAddRow = useLegacyTopLevelLayout ? legacyMutableColumnKeys.length > 0 : true;
  const canRemoveRow = useLegacyTopLevelLayout ? legacyMutableRowCount > 1 : table.rowCount > 1;

  const visibleColumnsById = useMemo(
    () => new Map(visibleColumns.map(column => [column.key, column])),
    [visibleColumns]
  );

  const headerColumns = useMemo<TabularEditorHeaderModel[]>(() => {
    return visibleColumnKeys.map(columnKey => {
      const column = visibleColumnsById.get(columnKey);
      return {
        key: columnKey,
        label: columnModel.labels.get(columnKey) || column?.label || columnKey,
        description: column?.description || columnModel.descriptions.get(columnKey),
      };
    });
  }, [columnModel.descriptions, columnModel.labels, visibleColumnKeys, visibleColumnsById]);

  const tableRows = useMemo<TabularEditorRowModel[]>(() => {
    if (useLegacyTopLevelLayout) {
      return Array.from({ length: legacyMutableRowCount }, (_unused, rowIndex) => ({
        key: `legacy-row-${rowIndex}`,
        rowIndex,
        cells: legacyColumnKeys.map((columnKey, colIndex) => {
          const field = table.topLevelFields[columnKey]?.[rowIndex];
          return {
            key: `${rowIndex}-${columnKey}`,
            rowIndex,
            colIndex,
            columnKey,
            fieldType: columnModel.hints.get(columnKey),
            value: field?.value,
            cellElementId: getTabularCellElementId(rowIndex, columnKey, true),
            inputId: `tabular-legacy-row-${rowIndex}-${columnKey}`,
            onChange: nextValue => {
              if (field) {
                field.setValue(nextValue);
                return;
              }

              createLegacyField(columnKey);
            },
          };
        }),
      }));
    }

    return table.rows.map(row => ({
      key: String(row.entityId),
      rowIndex: row.rowIndex,
      cells: visibleColumns.map((column, colIndex) => {
        const cell = row.getCell(column.key);
        return {
          key: `${row.rowIndex}-${column.key}`,
          rowIndex: row.rowIndex,
          colIndex,
          columnKey: column.key,
          fieldType: columnModel.hints.get(column.key) || column.fieldType,
          value: cell?.value,
          cellElementId: getTabularCellElementId(row.rowIndex, column.key, false),
          inputId: `tabular-row-${row.rowIndex}-${column.key}`,
          onChange: nextValue => row.setCell(column.key, nextValue),
        };
      }),
    }));
  }, [
    columnModel.hints,
    createLegacyField,
    legacyColumnKeys,
    legacyMutableRowCount,
    table.rows,
    table.topLevelFields,
    useLegacyTopLevelLayout,
    visibleColumns,
  ]);

  const showEmptyTableState = !useLegacyTopLevelLayout && table.rows.length === 0;

  return {
    tableActiveCell,
    setTableActiveCell,
    overlayActiveCell,
    visibleColumnKeys,
    headerColumns,
    tableRows,
    showEmptyTableState,
    useLegacyTopLevelLayout,
    visibleTableErrors,
    canAddRow,
    canRemoveRow,
    addRowFromFooter,
    removeRowFromFooter,
  };
}
