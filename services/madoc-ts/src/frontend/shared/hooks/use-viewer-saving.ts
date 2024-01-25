import { Revisions } from '../capture-models/editor/stores/revisions/index';
import { RevisionRequest } from '../capture-models/types/revision-request';
import { useOptionalApi } from './use-api';
import { useMutation } from 'react-query';
import { createContext, useCallback, useContext } from 'react';
import { useUser } from './use-site';

interface ViewerSavingContextType {
  createRevision?: (req: RevisionRequest, status?: string) => Promise<RevisionRequest> | RevisionRequest;
  updateRevision?: (req: RevisionRequest, status?: string) => Promise<RevisionRequest> | RevisionRequest;
}

export const ViewerSavingContext = createContext<ViewerSavingContextType>({});

ViewerSavingContext.displayName = 'ViewerSaving';

function useViewerSavingContext() {
  return useContext(ViewerSavingContext) || {};
}

export function useViewerSaving(
  afterSave?: (req: RevisionRequest, status: string | undefined) => Promise<void> | void
) {
  const api = useOptionalApi();
  const saveCtx = useViewerSavingContext(); // @todo migrate all API to this.
  const user = useUser();
  const persistRevision = Revisions.useStoreActions(a => a.persistRevision);
  const resetStructure = Revisions.useStoreActions(a => a.resetStructure);

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

      const save = saveCtx?.createRevision || api?.createCaptureModelRevision.bind(api) || null;
      let response = req;

      if (save) {
        response = await save(req, status);
      }
      if (afterSave) {
        await afterSave(response, status);
      }
      if (status === 'submitted') {
        resetStructure();
      }
      return response;
    }
  );
  const [updateRevision] = useMutation(
    async ({ req, status }: { req: RevisionRequest; status?: string }): Promise<RevisionRequest> => {
      let response = req;
      const update = saveCtx?.updateRevision || api?.updateCaptureModelRevision.bind(api) || null;

      if (update) {
        response = await update(req, status);
      }
      if (afterSave) {
        await afterSave(response, status);
      }
      if (status === 'submitted') {
        resetStructure();
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
