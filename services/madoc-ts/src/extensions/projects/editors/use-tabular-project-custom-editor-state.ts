import { useCallback, useEffect, useMemo, useState } from 'react';
import type { CaptureModelEditorApi } from '@/frontend/shared/capture-models/new/hooks/use-capture-model-editor-api';
import type { NetConfig, TabularCellRef } from '../../../frontend/admin/components/tabular/cast-a-net/types';
import {
  createTabularColumnModel,
  isHiddenFieldType,
  isTabularSystemProperty,
  type TabularColumnModel,
  type TabularModelColumn,
} from './tabular-project-custom-editor-utils';

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
  columnModel: TabularColumnModel;
  visibleColumns: CaptureModelEditorApi['columns'];
  legacyColumnKeys: string[];
  visibleColumnKeys: string[];
  useLegacyTopLevelLayout: boolean;
  visibleTableErrors: string[];
  legacyMutableRowCount: number;
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
    if (!tableActiveCell || !netConfig) {
      return null;
    }

    // Row 0 in cast-a-net is the heading row, so contributor data rows start at +1.
    return {
      row: tableActiveCell.row + 1,
      col: tableActiveCell.col,
    };
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

  return {
    tableActiveCell,
    setTableActiveCell,
    overlayActiveCell,
    columnModel,
    visibleColumns,
    legacyColumnKeys,
    visibleColumnKeys,
    useLegacyTopLevelLayout,
    visibleTableErrors,
    legacyMutableRowCount,
    canAddRow,
    canRemoveRow,
    addRowFromFooter,
    removeRowFromFooter,
  };
}
