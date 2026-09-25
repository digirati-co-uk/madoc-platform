/** @jest-environment node */
import {
  isTabularAlignmentSnapshot,
  resolveTabularAlignment,
  TabularAlignmentSnapshot,
} from '../../../../src/frontend/shared/utility/tabular-alignment-snapshot';
import { createRevisionStore } from '../../../../src/frontend/shared/capture-models/editor/stores/revisions/revisions-store';
import type { RevisionRequest } from '../../../../src/frontend/shared/capture-models/types/revision-request';

const snapshot: TabularAlignmentSnapshot = {
  version: 1,
  net: {
    rows: 2,
    cols: 2,
    top: 10,
    left: 12,
    width: 76,
    height: 80,
    rowPositions: [45],
    colPositions: [40],
    rowOffsetAdjustments: [{ startRow: 1, offsetPctOfPage: -0.5 }],
  },
};
const revision: RevisionRequest = {
  captureModelId: 'model',
  source: 'structure',
  revision: { id: 'first', fields: [], status: 'draft' },
  document: { id: 'document', type: 'entity', label: 'Table', properties: {} },
};

it('saves all geometry with the revision, reloads it for review, and isolates other revisions', async () => {
  const store = createRevisionStore();
  const actions = store.getActions();
  actions.importRevision({ revisionRequest: revision });
  actions.selectRevision({ revisionId: 'first' });
  actions.setTabularAlignment(snapshot);
  let persisted: RevisionRequest | undefined;
  const save = async (request: RevisionRequest) => {
    persisted = JSON.parse(JSON.stringify(request));
    return persisted!;
  };
  await actions.persistRevision({ createRevision: save, updateRevision: save, status: 'draft' });
  expect(persisted?.revision.tabularAlignment).toEqual(snapshot);

  const review = createRevisionStore();
  review.getActions().importRevision({ revisionRequest: persisted! });
  review.getActions().selectRevision({ revisionId: 'first', readMode: true });
  expect(resolveTabularAlignment(review.getState().currentRevision?.revision.tabularAlignment, null)).toEqual(
    snapshot.net
  );
  review.getActions().setTabularAlignment({ ...snapshot, net: { ...snapshot.net, left: 0 } });
  expect(review.getState().currentRevision?.revision.tabularAlignment).toEqual(snapshot);

  actions.importRevision({ revisionRequest: { ...revision, revision: { ...revision.revision, id: 'second' } } });
  actions.selectRevision({ revisionId: 'second' });
  expect(resolveTabularAlignment(store.getState().currentRevision?.revision.tabularAlignment, null)).toBeNull();
  actions.selectRevision({ revisionId: 'first' });
  expect(store.getState().currentRevision?.revision.tabularAlignment).toEqual(snapshot);
});

it('falls back for older contributions and rejects malformed or unsupported snapshots', () => {
  expect(isTabularAlignmentSnapshot(snapshot)).toBe(true);
  for (const invalid of [
    undefined,
    null,
    {},
    { ...snapshot, version: 2 },
    { ...snapshot, net: { ...snapshot.net, width: 0 } },
    { ...snapshot, net: { ...snapshot.net, left: NaN } },
    { ...snapshot, net: { ...snapshot.net, rowOffsetAdjustments: [{ startRow: -1, offsetPctOfPage: 1 }] } },
  ]) {
    expect(isTabularAlignmentSnapshot(invalid)).toBe(false);
    expect(resolveTabularAlignment(invalid, snapshot.net)).toBe(snapshot.net);
  }
});
