import { useCallback, useMemo, useState } from 'react';
import { Revisions } from '../../editor/stores/revisions';
import {
  addTableRow,
  getTableCellReference,
  getTableEditorSnapshot,
  getTopLevelFieldReferences,
  removeTableRow,
  setTableCellValue,
  TableCellRef,
  TableColumn,
  TableEditorApiStatus,
  TableRowRef,
  TopLevelFieldRef,
} from '../utility/table-editor-api';

export type CaptureModelEditorApiOptions = {
  tableProperty: string;
};

export type CaptureModelEditorApi = {
  status: TableEditorApiStatus;
  revisionId?: string;
  columns: TableColumn[];
  rows: TableRowRef[];
  rowCount: number;
  addRow: () => void;
  removeRow: (rowIndex: number) => void;
  getCell: (rowIndex: number, columnKey: string) => TableCellRef | null;
  setCell: (rowIndex: number, columnKey: string, value: unknown) => void;
  topLevelFields: Record<string, TopLevelFieldRef[]>;
  errors: string[];
};

export function useCaptureModelEditorApi({ tableProperty }: CaptureModelEditorApiOptions): CaptureModelEditorApi {
  const store = Revisions.useStore();
  const currentRevisionId = Revisions.useStoreState(state => state.currentRevisionId || undefined);
  const currentDocument = Revisions.useStoreState(state => state.currentRevision?.document);
  const [actionErrors, setActionErrors] = useState<string[]>([]);

  const appendError = useCallback((error: string) => {
    setActionErrors(previous => {
      if (previous.length && previous[previous.length - 1] === error) {
        return previous;
      }
      return [...previous, error];
    });
  }, []);

  const snapshot = useMemo(() => getTableEditorSnapshot(store, tableProperty), [store, tableProperty, currentDocument]);

  const getCell = useCallback(
    (rowIndex: number, columnKey: string) => {
      return getTableCellReference({
        store,
        tableProperty,
        rowIndex,
        columnKey,
        columns: snapshot.columns,
        onError: appendError,
      });
    },
    [appendError, snapshot.columns, store, tableProperty]
  );

  const setCell = useCallback(
    (rowIndex: number, columnKey: string, value: unknown) => {
      const result = setTableCellValue({
        store,
        tableProperty,
        rowIndex,
        columnKey,
        value,
      });

      if (!result.ok && result.error) {
        appendError(result.error);
      }
    },
    [appendError, store, tableProperty]
  );

  const addRow = useCallback(() => {
    const result = addTableRow(store, tableProperty);
    if (!result.ok && result.error) {
      appendError(result.error);
    }
  }, [appendError, store, tableProperty]);

  const removeRowAtIndex = useCallback(
    (rowIndex: number) => {
      const result = removeTableRow(store, tableProperty, rowIndex);
      if (!result.ok && result.error) {
        appendError(result.error);
      }
    },
    [appendError, store, tableProperty]
  );

  const rows = useMemo<TableRowRef[]>(() => {
    return snapshot.rows.map((row, rowIndex) => {
      const path = [[tableProperty, row.id]] as Array<[string, string]>;

      return {
        rowIndex,
        entityId: row.id,
        path,
        getCell: (columnKey: string) => getCell(rowIndex, columnKey),
        setCell: (columnKey: string, value: unknown) => setCell(rowIndex, columnKey, value),
      };
    });
  }, [getCell, setCell, snapshot.rows, tableProperty]);

  const topLevelFields = useMemo(() => {
    return getTopLevelFieldReferences(store, tableProperty, appendError);
  }, [appendError, store, tableProperty, currentDocument]);

  return {
    status: snapshot.status,
    revisionId: currentRevisionId,
    columns: snapshot.columns,
    rows,
    rowCount: rows.length,
    addRow,
    removeRow: removeRowAtIndex,
    getCell,
    setCell,
    topLevelFields,
    errors: [...snapshot.errors, ...actionErrors],
  };
}
