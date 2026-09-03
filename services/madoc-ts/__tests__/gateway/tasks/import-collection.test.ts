import {
  getManifestImportChanges,
  getManifestImportResult,
} from '../../../src/gateway/tasks/collection-import-helpers';

interface ManifestSubtask {
  id: string;
  type: string;
  name: string;
  subject: string;
  status: number;
  state: { resourceId?: number };
}

function manifestSubtask(subject: string, status: number, resourceId?: number): ManifestSubtask {
  return {
    id: `${subject}-${status}`,
    type: 'madoc-manifest-import',
    name: subject,
    subject,
    status,
    state: resourceId === undefined ? {} : { resourceId },
  };
}

test('queues every missing manifest together', () => {
  const manifestIds = ['https://example.org/1', 'https://example.org/2', 'https://example.org/3'];

  const changes = getManifestImportChanges([], manifestIds);

  expect(changes.manifestIdsToCreate).toEqual(manifestIds);
  expect(changes.taskIdsToRetry).toEqual([]);
});

test('retries failed manifests without duplicating active or completed tasks', () => {
  const subtasks = [
    manifestSubtask('https://example.org/1', 3, 101),
    manifestSubtask('https://example.org/2', 2),
    manifestSubtask('https://example.org/3', -1),
  ];

  const changes = getManifestImportChanges(subtasks, [
    'https://example.org/1',
    'https://example.org/2',
    'https://example.org/3',
    'https://example.org/4',
  ]);

  expect(changes.manifestIdsToCreate).toEqual(['https://example.org/4']);
  expect(changes.taskIdsToRetry).toEqual(['https://example.org/3--1']);
});

test('finalizes only usable imports unless terminal errors are explicitly skipped', () => {
  const manifestIds = [
    'https://example.org/1',
    'https://example.org/2',
    'https://example.org/3',
    'https://example.org/4',
  ];
  const subtasks = [
    manifestSubtask(manifestIds[0], 3, 101),
    manifestSubtask(manifestIds[1], -1),
    manifestSubtask(manifestIds[2], 3, 103),
    manifestSubtask(manifestIds[3], 3),
  ];

  expect(getManifestImportResult(subtasks, manifestIds)).toBeUndefined();
  expect(getManifestImportResult(subtasks, manifestIds, true)).toEqual({
    resourceIds: [101, 103],
    skippedManifestIds: [manifestIds[1], manifestIds[3]],
  });
});
