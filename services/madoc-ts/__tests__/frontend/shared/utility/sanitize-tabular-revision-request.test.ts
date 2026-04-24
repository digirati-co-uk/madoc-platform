/**
 * @jest-environment node
 */

import { sanitizeTabularRevisionRequestForSave } from '../../../../src/frontend/shared/utility/sanitize-tabular-revision-request';
import {
  parseTabularCellFlags,
  serializeTabularCellFlags,
  TABULAR_CELL_FLAGS_PROPERTY,
  type TabularCellFlagMap,
} from '../../../../src/frontend/shared/utility/tabular-cell-flags';
import type { RevisionRequest } from '../../../../src/frontend/shared/capture-models/types/revision-request';
import type { CaptureModel } from '../../../../src/frontend/shared/capture-models/types/capture-model';

function createTextField(id: string, value: string) {
  return {
    id,
    type: 'text-field',
    label: 'Value',
    value,
  };
}

function createRowEntity(id: string, value: string): CaptureModel['document'] {
  return {
    id,
    type: 'entity',
    label: 'Row',
    properties: {
      value: [createTextField(`${id}-value`, value)],
    },
  };
}

function createRevisionRequestFixture(options: {
  rows: CaptureModel['document'][];
  flags: TabularCellFlagMap;
  includeTabularMarker?: boolean;
}): RevisionRequest {
  const properties: CaptureModel['document']['properties'] = {
    rows: options.rows,
  };

  if (options.includeTabularMarker !== false) {
    properties[TABULAR_CELL_FLAGS_PROPERTY] = [
      {
        id: 'tabular-flags',
        type: 'text-field',
        label: 'Cell flags',
        value: serializeTabularCellFlags(options.flags),
      },
    ];
  }

  return {
    captureModelId: 'capture-model-1',
    source: 'structure',
    revision: {
      id: 'revision-1',
      status: 'draft',
      approved: false,
      label: 'Default',
      fields: [],
    },
    document: {
      id: 'document-root',
      type: 'entity',
      label: 'Root',
      properties,
    },
  };
}

describe('sanitizeTabularRevisionRequestForSave', () => {
  test('preserves unfilled tabular rows by default', () => {
    const request = createRevisionRequestFixture({
      rows: [
        createRowEntity('row-0', 'Filled'),
        createRowEntity('row-1', ''),
        createRowEntity('row-2', ''),
        createRowEntity('row-3', ''),
        createRowEntity('row-4', ''),
      ],
      flags: {},
    });

    const sanitized = sanitizeTabularRevisionRequestForSave(request);

    expect(sanitized).toBe(request);
    const rows = sanitized.document.properties.rows as Array<ReturnType<typeof createRowEntity>>;
    expect(rows).toHaveLength(5);
    expect(rows[0].id).toEqual('row-0');
    expect(rows[1].id).toEqual('row-1');
  });

  test('preserves tabular cell flag row indexes by default', () => {
    const request = createRevisionRequestFixture({
      rows: [createRowEntity('row-0', 'A'), createRowEntity('row-1', ''), createRowEntity('row-2', 'B')],
      flags: {
        '2:value': {
          rowIndex: 2,
          columnKey: 'value',
          flaggedAt: '2025-01-01T00:00:00.000Z',
        },
      },
    });

    const sanitized = sanitizeTabularRevisionRequestForSave(request);
    const flagsField = (sanitized.document.properties[TABULAR_CELL_FLAGS_PROPERTY] || [])[0] as { value?: unknown };
    const parsedFlags = parseTabularCellFlags(flagsField?.value);

    expect(sanitized).toBe(request);
    expect(parsedFlags['2:value']).toBeDefined();
    expect(parsedFlags['2:value'].rowIndex).toEqual(2);
    expect(parsedFlags['1:value']).toBeUndefined();
  });

  test('does not modify non-tabular revision requests', () => {
    const request = createRevisionRequestFixture({
      rows: [createRowEntity('row-0', 'A'), createRowEntity('row-1', '')],
      flags: {},
      includeTabularMarker: false,
    });

    const sanitized = sanitizeTabularRevisionRequestForSave(request);

    expect(sanitized).toBe(request);
    expect(sanitized.document.properties.rows).toHaveLength(2);
  });
});
