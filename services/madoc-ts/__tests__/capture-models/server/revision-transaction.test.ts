/** @jest-environment node */
import type { DatabasePoolConnectionType, DatabaseTransactionConnectionType } from 'slonik';
import { CaptureModelRepository } from '../../../src/capture-model-server/capture-model-repository';
import type { RevisionRequest } from '../../../src/frontend/shared/capture-models/types/revision-request';

jest.mock('../../../src/utility/slonik-helpers', () => ({ upsert: jest.fn() }));

test('updating a revision reads its stored revision on the already borrowed transaction connection', async () => {
  const sentinel = new Error('Reached transaction revision lookup');
  const transaction = { one: jest.fn().mockRejectedValue(sentinel) } as unknown as DatabaseTransactionConnectionType;
  const poolRead = jest.fn(() => { throw new Error('Borrowed a second pool connection'); });
  const pool = {
    one: poolRead,
    transaction: async (callback: (connection: DatabaseTransactionConnectionType) => Promise<void>) => callback(transaction),
  } as unknown as DatabasePoolConnectionType;
  const repository = new CaptureModelRepository(pool);
  jest.spyOn(repository, 'getCaptureModel').mockResolvedValue({
    id: 'model', structure: { id: 'structure', type: 'model', label: '', fields: [] },
    document: { id: 'document', type: 'entity', label: '', properties: {} },
  });
  const request = { captureModelId: 'model', revision: { id: 'revision' } } as RevisionRequest;
  await expect(repository.updateRevision(request, { siteId: 123 })).rejects.toBe(sentinel);
  expect(poolRead).not.toHaveBeenCalled();
  expect(transaction.one).toHaveBeenCalledWith(CaptureModelRepository.queries.getRevisionById('revision', 123));
});
