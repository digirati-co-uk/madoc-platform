/** @jest-environment node */
import { getTabularAnnotationSelectors } from '../../../../src/utility/tabular-annotation-selectors';
import {
  captureModelFieldToW3CAnnotation,
  captureModelFieldToOpenAnnotation,
} from '../../../../src/utility/model-annotation-helpers';
import type { CaptureModel, Revision } from '../../../../src/frontend/shared/capture-models/types/capture-model';

const project = {
  template_name: 'tabular-project',
  template_config: {
    tabular: { model: { columns: [{ id: 'a' }, { id: 'private', type: 'hidden-field' }, { id: 'b' }] } },
  },
};
const revision: Revision = {
  id: 'r1',
  fields: [['rows', ['a', 'b']]],
  status: 'accepted',
  tabularAlignment: {
    version: 1,
    net: {
      rows: 2,
      cols: 2,
      top: 10,
      left: 20,
      width: 60,
      height: 40,
      rowPositions: [50],
      colPositions: [25],
      rowOffsetAdjustments: [{ startRow: 1, offsetPctOfPage: 5 }],
    },
  },
};
const field = (id: string, revisionId = 'r1') => ({
  id,
  revision: revisionId,
  type: 'text-field',
  label: id,
  value: `Text ${id}`,
});
const row = (id: string, revisionId = 'r1'): CaptureModel['document'] => ({
  id,
  revision: revisionId,
  type: 'entity',
  label: 'Row',
  properties: { a: [field(`${id}-a`, revisionId)], b: [field(`${id}-b`, revisionId)] },
});
const model: CaptureModel = {
  structure: { id: 'structure', type: 'model', label: 'Table', fields: revision.fields },
  revisions: [revision],
  document: { id: 'doc', type: 'entity', label: 'Table', properties: { rows: [row('first'), row('second')] } },
};
const canvas = { width: 1000, height: 1000 };

it('exports saved alignment as pixel xywh, skipping the heading and projecting later rows', () => {
  const selectors = getTabularAnnotationSelectors(model, project, canvas);
  expect(selectors.size).toBe(4);
  expect(selectors.get('first-b')?.state).toEqual({ x: 350, y: 350, width: 450, height: 200 });
  expect(selectors.get('second-b')?.state).toEqual({ x: 350, y: 550, width: 450, height: 200 });
  const options = {
    madocCanvasId: 1,
    canvas: 'https://example.org/canvas',
    gatewayHost: 'https://madoc.local',
    path: '/models',
  };
  expect(captureModelFieldToW3CAnnotation('first-b', 'Text', selectors.get('first-b'), options).target).toBe(
    'https://example.org/canvas#xywh=350,350,450,200'
  );
  expect(captureModelFieldToOpenAnnotation('first-b', 'Text', selectors.get('first-b'), options).on).toBe(
    'https://example.org/canvas#xywh=350,350,450,200'
  );
});

it('uses each contribution’s own row indices and snapshot without changing the model', () => {
  const other: Revision = {
    ...revision,
    id: 'r2',
    tabularAlignment: { version: 1, net: { ...revision.tabularAlignment!.net, left: 0 } },
  };
  const mixed = {
    ...model,
    revisions: [revision, other],
    document: { ...model.document, properties: { rows: [row('first'), row('other', 'r2')] } },
  };
  const before = JSON.stringify(mixed);
  const selectors = getTabularAnnotationSelectors(mixed, project, canvas);
  expect(selectors.get('other-b')?.state).toEqual({ x: 150, y: 350, width: 450, height: 200 });
  expect(selectors.get('first-b')?.state.x).toBe(350);
  expect(JSON.stringify(mixed)).toBe(before);
});

it('supports legacy column lists and declines models without sufficient tabular information', () => {
  const legacy = {
    ...model,
    revisions: [{ ...revision, fields: ['a', 'b'] }],
    document: { ...model.document, properties: { a: [field('a1'), field('a2')], b: [field('b1'), field('b2')] } },
  };
  expect(getTabularAnnotationSelectors(legacy, project, canvas).get('b2')?.state.y).toBe(550);
  expect(getTabularAnnotationSelectors(model, { ...project, template_name: 'custom' }, canvas).size).toBe(0);
  expect(
    getTabularAnnotationSelectors(
      { ...model, revisions: [{ ...revision, tabularAlignment: undefined }] },
      project,
      canvas
    ).size
  ).toBe(0);
  expect(getTabularAnnotationSelectors(model, project, { width: null, height: 1000 }).size).toBe(0);
  expect(getTabularAnnotationSelectors(model, { ...project, template_config: {} }, canvas).size).toBe(0);
});

jest.mock(
  '@/frontend/shared/utility/tabular-row-offset-adjustments',
  () => jest.requireActual('../../../../src/frontend/shared/utility/tabular-row-offset-adjustments'),
  { virtual: true }
);
