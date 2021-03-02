import { useApi } from './use-api';
import { Revisions } from '@capture-models/editor';
import { useMutation } from 'react-query';
import { RevisionRequest } from '@capture-models/types';
import { useCallback } from 'react';
import { useUser } from './use-site';

export function useViewerSaving(
  afterSave?: (req: RevisionRequest, status: string | undefined) => Promise<void> | void
) {
  const api = useApi();
  const user = useUser();
  const persistRevision = Revisions.useStoreActions(a => a.persistRevision);

  const [createRevision] = useMutation(
    async ({ req, status }: { req: RevisionRequest; status?: string }): Promise<RevisionRequest> => {
      req.author =
        req.author || !user
          ? req.author
          : {
              type: 'Person',
              id: `urn:madoc:user:${user.id}`,
              name: user.name,
            };

      const response = await api.createCaptureModelRevision(req, status);
      if (afterSave) {
        await afterSave(response, status);
      }
      return response;
    }
  );
  const [updateRevision] = useMutation(
    async ({ req, status }: { req: RevisionRequest; status?: string }): Promise<RevisionRequest> => {
      const response = await api.updateCaptureModelRevision(req, status);
      if (afterSave) {
        await afterSave(response, status);
      }
      return response;
    }
  );

  return useCallback(
    (revisionRequest: RevisionRequest, status: string | undefined) => {
      return persistRevision({
        createRevision: async (req, s) => {
          const create = await createRevision({ req, status: s });
          if (!create) {
            throw new Error('Could not create revision');
          }
          return create;
        },
        updateRevision: async (req, s) => {
          const update = await updateRevision({ req, status: s });
          if (!update) {
            throw new Error('Could not update revision');
          }
          return update;
        },
        revisionId: revisionRequest.revision.id,
        status,
      });
    },
    [createRevision, persistRevision, updateRevision]
  );
}
