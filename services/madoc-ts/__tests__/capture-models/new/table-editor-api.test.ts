/**
 * @jest-environment node
 */

import { createRevisionStore } from '../../../src/frontend/shared/capture-models/editor/stores/revisions/revisions-store';
import { registerField } from '../../../src/frontend/shared/capture-models/plugin-api/global-store';
import { CaptureModel } from '../../../src/frontend/shared/capture-models/types/capture-model';
import {
  addTableRow,
  getTableEditorSnapshot,
  getTopLevelFieldReferences,
  removeTableRow,
  setTableCellValue,
} from '../../../src/frontend/shared/capture-models/new/utility/table-editor-api';

registerField({
  label: 'Text field',
  type: 'text-field',
  description: 'Simple text field',
  Component: undefined as any,
  defaultValue: '',
  allowMultiple: true,
  defaultProps: {},
  Editor: undefined as any,
  TextPreview: undefined as any,
} as any);

function getFixtureModel(): CaptureModel {
  return {
    id: 'capture-model-1',
    structure: {
      id: 'model-structure-1',
      label: 'Table model',
      type: 'model',
      fields: [['rows', ['name', 'age']], 'notes', 'comments'],
    },
    document: {
      id: 'document-root-1',
      type: 'entity',
      label: 'Root',
      properties: {
        rows: [
          {
            id: 'row-1',
            type: 'entity',
            label: 'Row',
            allowMultiple: true,
            properties: {
              name: [
                {
                  id: 'row-1-name',
                  type: 'text-field',
                  label: 'Name',
                  value: 'Alice',
                },
              ],
              age: [
                {
                  id: 'row-1-age',
                  type: 'text-field',
                  label: 'Age',
                  value: '35',
                },
              ],
            },
          },
        ],
        notes: [
          {
            id: 'notes-1',
            type: 'text-field',
            label: 'Notes',
            value: 'Top-level note',
          },
        ],
        comments: [
          {
            id: 'comments-1',
            type: 'text-field',
            label: 'Comments',
            value: 'Top-level comment',
          },
        ],
      },
    },
  };
}

describe('table-editor-api utility', () => {
  test('maps entity-list property to rows and columns', () => {
    const store = createRevisionStore({ captureModel: getFixtureModel(), initialRevision: 'model-structure-1' });

    const snapshot = getTableEditorSnapshot(store, 'rows');

    expect(snapshot.status).toEqual('ready');
    expect(snapshot.rows).toHaveLength(1);
    expect(snapshot.columns.map(column => column.key)).toEqual(['name', 'age']);
  });

  test('edits table cell value via revision path', () => {
    const store = createRevisionStore({ captureModel: getFixtureModel(), initialRevision: 'model-structure-1' });

    const result = setTableCellValue({
      store,
      tableProperty: 'rows',
      rowIndex: 0,
      columnKey: 'name',
      value: 'Updated name',
    });

    expect(result.ok).toBe(true);

    const current = store.getState().currentRevision;
    const row = current?.document.properties.rows[0] as any;
    expect(row.properties.name[0].value).toEqual('Updated name');
  });

  test('addRow creates a new entity row', () => {
    const store = createRevisionStore({ captureModel: getFixtureModel(), initialRevision: 'model-structure-1' });

    const result = addTableRow(store, 'rows');
    expect(result.ok).toBe(true);

    const current = store.getState().currentRevision;
    const rows = current?.document.properties.rows as any[];

    expect(rows).toHaveLength(2);
  });

  test('removeRow removes the target row', () => {
    const store = createRevisionStore({ captureModel: getFixtureModel(), initialRevision: 'model-structure-1' });

    const addResult = addTableRow(store, 'rows');
    expect(addResult.ok).toBe(true);

    const beforeRemoveRows = (store.getState().currentRevision?.document.properties.rows || []) as any[];
    const idOfSecondRow = beforeRemoveRows[1].id;

    const removeResult = removeTableRow(store, 'rows', 1);
    expect(removeResult.ok).toBe(true);

    const rowsAfter = (store.getState().currentRevision?.document.properties.rows || []) as any[];
    expect(rowsAfter).toHaveLength(1);
    expect(rowsAfter.find(row => row.id === idOfSecondRow)).toBeUndefined();
  });

  test('exposes top-level non-table fields', () => {
    const store = createRevisionStore({ captureModel: getFixtureModel(), initialRevision: 'model-structure-1' });

    const topLevelFields = getTopLevelFieldReferences(store, 'rows');

    expect(Object.keys(topLevelFields)).toEqual(['notes', 'comments']);
    expect(topLevelFields.notes[0].value).toEqual('Top-level note');
    expect(topLevelFields.comments[0].value).toEqual('Top-level comment');
  });

  test('invalid table property returns invalid-table-property status', () => {
    const store = createRevisionStore({ captureModel: getFixtureModel(), initialRevision: 'model-structure-1' });

    const snapshot = getTableEditorSnapshot(store, 'missingRows');

    expect(snapshot.status).toEqual('invalid-table-property');
    expect(snapshot.errors[0]).toContain('missingRows');
  });
});
