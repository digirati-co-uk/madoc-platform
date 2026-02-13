import { Store } from 'easy-peasy';
import { RevisionsModel } from '../../editor/stores/revisions';
import { isEntity } from '../../helpers/is-entity';
import { CaptureModel } from '../../types/capture-model';
import { BaseField } from '../../types/field-types';

export type TableEditorApiStatus = 'ready' | 'missing-revision' | 'invalid-table-property';

export type TableColumn = {
  key: string;
  label: string;
  description?: string;
  fieldType?: string;
  required?: boolean;
};

export type TableCellRef = {
  columnKey: string;
  rowIndex: number;
  rowEntityId: string;
  path: Array<[string, string]>;
  value: unknown;
  setValue: (value: unknown) => void;
  fieldId?: string;
};

export type TableRowRef = {
  rowIndex: number;
  entityId: string;
  path: Array<[string, string]>;
  getCell: (columnKey: string) => TableCellRef | null;
  setCell: (columnKey: string, value: unknown) => void;
};

export type TopLevelFieldRef = {
  property: string;
  index: number;
  path: Array<[string, string]>;
  value: unknown;
  setValue: (value: unknown) => void;
  fieldId?: string;
};

export type TableEditorSnapshot = {
  status: TableEditorApiStatus;
  columns: TableColumn[];
  rows: CaptureModel['document'][];
  errors: string[];
};

function getCurrentRevisionDocument(store: Store<RevisionsModel>): CaptureModel['document'] | null {
  return store.getState().currentRevision?.document || null;
}

function getTopLevelPropertyList(
  document: CaptureModel['document'],
  property: string
): Array<BaseField | CaptureModel['document']> {
  return (document.properties[property] || []) as Array<BaseField | CaptureModel['document']>;
}

function getTopLevelRowPath(tableProperty: string, rowEntityId: string): Array<[string, string]> {
  return [[tableProperty, rowEntityId]];
}

function updateFieldByPath(store: Store<RevisionsModel>, path: Array<[string, string]>, value: unknown) {
  store.getActions().updateFieldValue({ path, value });
}

function findCreatedFieldId(
  previousList: Array<BaseField | CaptureModel['document']>,
  nextList: Array<BaseField | CaptureModel['document']>
): string | undefined {
  const previousIds = new Set(previousList.map(item => item.id));
  const created = nextList.find(item => !previousIds.has(item.id) && !isEntity(item));
  return created?.id;
}

export function getTableEditorSnapshot(
  store: Store<RevisionsModel>,
  tableProperty: string
): TableEditorSnapshot {
  const document = getCurrentRevisionDocument(store);

  if (!document) {
    return {
      status: 'missing-revision',
      columns: [],
      rows: [],
      errors: ['No revision is currently selected.'],
    };
  }

  const propertyList = getTopLevelPropertyList(document, tableProperty);

  if (!propertyList.length || !isEntity(propertyList[0] as any)) {
    return {
      status: 'invalid-table-property',
      columns: [],
      rows: [],
      errors: [
        `Table property \"${tableProperty}\" is missing or is not an entity list on the top-level revision document.`,
      ],
    };
  }

  const rows = propertyList.filter(isEntity) as CaptureModel['document'][];
  const columnMap = new Map<string, TableColumn>();

  for (const row of rows) {
    for (const property of Object.keys(row.properties || {})) {
      const instances = row.properties[property] as Array<BaseField | CaptureModel['document']>;
      const first = instances[0];

      if (!first || isEntity(first)) {
        continue;
      }

      if (!columnMap.has(property)) {
        columnMap.set(property, {
          key: property,
          label: first.label || property,
          description: first.description,
          fieldType: first.type,
          required: !!first.required,
        });
      }
    }
  }

  return {
    status: 'ready',
    columns: Array.from(columnMap.values()),
    rows,
    errors: [],
  };
}

export function setTopLevelFieldValue(
  store: Store<RevisionsModel>,
  property: string,
  fieldId: string,
  value: unknown
): { ok: boolean; error?: string } {
  const document = getCurrentRevisionDocument(store);
  if (!document) {
    return { ok: false, error: 'No revision selected.' };
  }

  const instances = getTopLevelPropertyList(document, property);
  const target = instances.find(instance => instance.id === fieldId);

  if (!target || isEntity(target)) {
    return { ok: false, error: `Top-level field \"${property}\" (${fieldId}) was not found.` };
  }

  updateFieldByPath(store, [[property, fieldId]], value);
  return { ok: true };
}

export function setTableCellValue(options: {
  store: Store<RevisionsModel>;
  tableProperty: string;
  rowIndex: number;
  columnKey: string;
  value: unknown;
}): { ok: boolean; error?: string } {
  const { store, tableProperty, rowIndex, columnKey, value } = options;
  const document = getCurrentRevisionDocument(store);

  if (!document) {
    return { ok: false, error: 'No revision selected.' };
  }

  const propertyList = getTopLevelPropertyList(document, tableProperty);
  if (!propertyList.length || !isEntity(propertyList[0] as any)) {
    return { ok: false, error: `Table property \"${tableProperty}\" is invalid.` };
  }

  const rows = propertyList.filter(isEntity) as CaptureModel['document'][];
  const row = rows[rowIndex];

  if (!row) {
    return { ok: false, error: `Row index ${rowIndex} does not exist.` };
  }

  const rowPath = getTopLevelRowPath(tableProperty, row.id);
  const columnItems = (row.properties[columnKey] || []) as Array<BaseField | CaptureModel['document']>;
  const existingField = columnItems.find(item => !isEntity(item)) as BaseField | undefined;

  if (existingField) {
    updateFieldByPath(store, [...rowPath, [columnKey, existingField.id]], value);
    return { ok: true };
  }

  if (!row.properties[columnKey]) {
    return {
      ok: false,
      error: `Column \"${columnKey}\" does not exist on row ${rowIndex}.`,
    };
  }

  try {
    store.getActions().createNewFieldInstance({ path: rowPath, property: columnKey });
  } catch (error: any) {
    return {
      ok: false,
      error: error?.message || `Unable to create a new field instance for column \"${columnKey}\".`,
    };
  }

  const refreshed = getCurrentRevisionDocument(store);
  if (!refreshed) {
    return { ok: false, error: 'Revision disappeared after creating a field instance.' };
  }

  const refreshedRows = getTopLevelPropertyList(refreshed, tableProperty).filter(isEntity) as CaptureModel['document'][];
  const refreshedRow = refreshedRows.find(entity => entity.id === row.id);

  if (!refreshedRow) {
    return {
      ok: false,
      error: `Could not re-locate row ${row.id} after creating a field instance.`,
    };
  }

  const refreshedColumnItems = (refreshedRow.properties[columnKey] || []) as Array<BaseField | CaptureModel['document']>;
  const newFieldId = findCreatedFieldId(columnItems, refreshedColumnItems);

  if (!newFieldId) {
    return {
      ok: false,
      error: `Unable to find the created field instance for column \"${columnKey}\".`,
    };
  }

  updateFieldByPath(store, [...rowPath, [columnKey, newFieldId]], value);
  return { ok: true };
}

export function addTableRow(
  store: Store<RevisionsModel>,
  tableProperty: string
): { ok: boolean; error?: string } {
  const document = getCurrentRevisionDocument(store);

  if (!document) {
    return { ok: false, error: 'No revision selected.' };
  }

  const propertyList = getTopLevelPropertyList(document, tableProperty);
  if (!propertyList.length || !isEntity(propertyList[0] as any)) {
    return { ok: false, error: `Table property \"${tableProperty}\" is invalid.` };
  }

  try {
    store.getActions().createNewEntityInstance({ path: [], property: tableProperty });
    return { ok: true };
  } catch (error: any) {
    return {
      ok: false,
      error: error?.message || `Unable to create a new row for property \"${tableProperty}\".`,
    };
  }
}

export function removeTableRow(
  store: Store<RevisionsModel>,
  tableProperty: string,
  rowIndex: number
): { ok: boolean; error?: string } {
  const document = getCurrentRevisionDocument(store);

  if (!document) {
    return { ok: false, error: 'No revision selected.' };
  }

  const propertyList = getTopLevelPropertyList(document, tableProperty);
  if (!propertyList.length || !isEntity(propertyList[0] as any)) {
    return { ok: false, error: `Table property \"${tableProperty}\" is invalid.` };
  }

  const rows = propertyList.filter(isEntity) as CaptureModel['document'][];
  const row = rows[rowIndex];

  if (!row) {
    return { ok: false, error: `Row index ${rowIndex} does not exist.` };
  }

  try {
    store.getActions().removeInstance({ path: [[tableProperty, row.id]] });
    return { ok: true };
  } catch (error: any) {
    return {
      ok: false,
      error: error?.message || `Unable to remove row index ${rowIndex}.`,
    };
  }
}

export function getTopLevelFieldReferences(
  store: Store<RevisionsModel>,
  excludeProperty?: string,
  onError?: (message: string) => void
): Record<string, TopLevelFieldRef[]> {
  const document = getCurrentRevisionDocument(store);

  if (!document) {
    return {};
  }

  const references: Record<string, TopLevelFieldRef[]> = {};

  for (const property of Object.keys(document.properties || {})) {
    if (excludeProperty && property === excludeProperty) {
      continue;
    }

    const list = getTopLevelPropertyList(document, property);
    const fieldRefs = list
      .filter(item => !isEntity(item))
      .map((item, index) => {
        const field = item as BaseField;

        return {
          property,
          index,
          path: [[property, field.id]] as Array<[string, string]>,
          value: field.value,
          fieldId: field.id,
          setValue: (value: unknown) => {
            const result = setTopLevelFieldValue(store, property, field.id, value);
            if (!result.ok && result.error && onError) {
              onError(result.error);
            }
          },
        };
      });

    if (fieldRefs.length) {
      references[property] = fieldRefs;
    }
  }

  return references;
}

export function getTableCellReference(options: {
  store: Store<RevisionsModel>;
  tableProperty: string;
  rowIndex: number;
  columnKey: string;
  columns: TableColumn[];
  onError?: (message: string) => void;
}): TableCellRef | null {
  const { store, tableProperty, rowIndex, columnKey, columns, onError } = options;

  if (!columns.find(col => col.key === columnKey)) {
    return null;
  }

  const document = getCurrentRevisionDocument(store);

  if (!document) {
    return null;
  }

  const propertyList = getTopLevelPropertyList(document, tableProperty);

  if (!propertyList.length || !isEntity(propertyList[0] as any)) {
    return null;
  }

  const rows = propertyList.filter(isEntity) as CaptureModel['document'][];
  const row = rows[rowIndex];

  if (!row) {
    return null;
  }

  const rowPath = getTopLevelRowPath(tableProperty, row.id);
  const list = (row.properties[columnKey] || []) as Array<BaseField | CaptureModel['document']>;
  const field = list.find(item => !isEntity(item)) as BaseField | undefined;

  return {
    columnKey,
    rowIndex,
    rowEntityId: row.id,
    path: field ? [...rowPath, [columnKey, field.id]] : rowPath,
    value: field ? field.value : undefined,
    fieldId: field?.id,
    setValue: (value: unknown) => {
      const result = setTableCellValue({
        store,
        tableProperty,
        rowIndex,
        columnKey,
        value,
      });
      if (!result.ok && result.error && onError) {
        onError(result.error);
      }
    },
  };
}
