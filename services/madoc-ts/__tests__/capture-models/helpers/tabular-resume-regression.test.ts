import {
  captureModelToRevisionList,
  fixModelBugs,
} from '../../../src/frontend/shared/capture-models/helpers/capture-model-to-revision-list';
import { createRevisionDocument } from '../../../src/frontend/shared/capture-models/helpers/create-revision-document';
import type { CaptureModel } from '../../../src/frontend/shared/capture-models/types/capture-model';

vi.mock('../../../src/frontend/shared/capture-models/plugin-api/globals', () => ({
  pluginStore: { fields: { 'text-field': { defaultValue: '', allowMultiple: true } } },
}));

function fixture(): CaptureModel {
  return {
    id: 'model',
    structure: { id: 'view', type: 'model', label: 'Table', fields: [['rows', ['1', '2']]] },
    document: {
      id: 'document',
      type: 'entity',
      label: 'Document',
      properties: {
        rows: [
          {
            id: 'row',
            type: 'entity',
            label: 'Row',
            allowMultiple: true,
            properties: {
              '1': [
                { id: 'first', type: 'text-field', label: '1', value: null },
                {
                  id: 'edited-first',
                  type: 'text-field',
                  label: '1',
                  value: 'Transcribed',
                  revises: 'first',
                  revision: 'submitted',
                },
              ],
              '2': [{ id: 'second', type: 'text-field', label: '2', value: null }],
            },
          },
        ],
      },
    },
    revisions: [
      {
        id: 'submitted',
        structureId: 'view',
        fields: [['rows', ['1', '2']]],
        status: 'submitted',
        tabularAlignment: {
          version: 1,
          net: {
            rows: 2,
            cols: 2,
            top: 10,
            left: 10,
            width: 80,
            height: 80,
            rowPositions: [50],
            colPositions: [50],
            rowOffsetAdjustments: [],
          },
        },
      },
    ],
  };
}

test('mixed canonical and submitted fields retain every column when loaded, forked and repaired for saving', () => {
  const model = fixture();
  const original = JSON.stringify(model);
  fixModelBugs(model);
  expect(JSON.stringify(model)).toBe(original);
  const [canonical, submitted] = captureModelToRevisionList(model, true);
  const templateRow = canonical.document.properties.rows[0] as CaptureModel['document'];
  expect(Object.keys(templateRow.properties)).toEqual(['1', '2']);
  expect(templateRow.properties['1'][0]).toMatchObject({ id: 'first', value: null });
  const fork = createRevisionDocument('new', canonical.document, 'FORK_TEMPLATE');
  expect(Object.keys((fork.properties.rows[0] as CaptureModel['document']).properties)).toEqual(['1', '2']);
  expect((submitted.document.properties.rows[0] as CaptureModel['document']).properties['1'][0]).toMatchObject({
    value: 'Transcribed',
    revision: 'submitted',
  });
  expect(submitted.revision.tabularAlignment).toEqual(model.revisions![0].tabularAlignment);
  expect(JSON.stringify(model)).toBe(original);
});

test('legacy rows containing only revision fields still get a canonical template', () => {
  const model = fixture();
  const row = model.document.properties.rows[0] as CaptureModel['document'];
  row.properties['1'].splice(0, 1);
  row.properties['2'][0].revision = 'submitted';
  fixModelBugs(model);
  expect(model.document.properties.rows).toHaveLength(2);
  const template = model.document.properties.rows[0] as CaptureModel['document'];
  expect(template.revision).toBeUndefined();
  expect(Object.keys(template.properties)).toEqual(['1', '2']);
  expect(template.properties['1'][0].revision).toBeUndefined();
  expect(row.revision).toBe('submitted');
});
