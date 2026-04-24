/**
 * @jest-environment node
 */

import { projectCsvSimpleExport } from '../../../src/extensions/project-export/export-configs/project/project-csv-simple-export';
import { TABULAR_CELL_FLAGS_PROPERTY } from '../../../src/frontend/shared/utility/tabular-cell-flags';

function createExportOptions(fields: any[], templateConfig: unknown) {
  return {
    config: {
      reviews: false,
      entity: 'rows',
    },
    api: {
      getProject: async () => ({
        template_config: templateConfig,
      }),
      getProjectFieldsRaw: async () => fields,
      getManifestById: async () => ({ manifest: undefined }),
      getCanvasById: async () => ({ canvas: undefined }),
    },
  } as any;
}

describe('projectCsvSimpleExport', () => {
  test('trims empty rows for tabular projects', async () => {
    const files = await projectCsvSimpleExport.exportData(
      { id: 1, type: 'project' } as any,
      createExportOptions(
        [
          { doc_id: 'row-0', model_id: 'model-1', key: 'name', value: 'Alice', id: 'field-0', target: [] },
          { doc_id: 'row-1', model_id: 'model-1', key: 'name', value: '', id: 'field-1', target: [] },
          { doc_id: 'row-1', model_id: 'model-1', key: 'age', value: '   ', id: 'field-2', target: [] },
          { doc_id: 'row-2', model_id: 'model-1', key: 'name', value: 'Bob', id: 'field-3', target: [] },
        ],
        {
          tabular: {
            model: {
              captureModelTemplate: {
                [TABULAR_CELL_FLAGS_PROPERTY]: { type: 'text-field' },
              },
            },
          },
        }
      )
    );

    const csv = files?.[0].content.value || '';
    expect(csv).toContain('row-0');
    expect(csv).toContain('Alice');
    expect(csv).not.toContain('row-1');
    expect(csv).toContain('row-2');
    expect(csv).toContain('Bob');
  });

  test('keeps empty rows for non-tabular projects', async () => {
    const files = await projectCsvSimpleExport.exportData(
      { id: 1, type: 'project' } as any,
      createExportOptions(
        [{ doc_id: 'row-1', model_id: 'model-1', key: 'name', value: '', id: 'field-1', target: [] }],
        {}
      )
    );

    const csv = files?.[0].content.value || '';
    expect(csv).toContain('row-1');
  });
});
