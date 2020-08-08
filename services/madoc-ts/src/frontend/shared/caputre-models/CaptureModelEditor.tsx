import React from 'react';
import { CaptureModel, RevisionRequest } from '@capture-models/types';
import { useApi } from '../hooks/use-api';
import { Revisions } from '@capture-models/editor';
import { useMutation } from 'react-query';
import { RevisionNavigation } from './RevisionNavigation';

export const CaptureModelEditor: React.FC<{
  captureModel: CaptureModel;
  onSave: (req: RevisionRequest, status?: string) => void;
}> = ({ captureModel, onSave }) => {
  const api = useApi();
  const persistRevision = Revisions.useStoreActions(a => a.persistRevision);

  const [createRevision] = useMutation(
    async ({ req, status }: { req: RevisionRequest; status?: string }): Promise<RevisionRequest> => {
      const response = await api.createCaptureModelRevision(req, status);
      onSave(response, status);
      return response;
    }
  );
  const [updateRevision] = useMutation(
    async ({ req, status }: { req: RevisionRequest; status?: string }): Promise<RevisionRequest> => {
      const response = await api.updateCaptureModelRevision(req, status);
      onSave(response, status);
      return response;
    }
  );

  return (
    <RevisionNavigation
      structure={captureModel.structure}
      onSaveRevision={(rev, status) => {
        return persistRevision({
          createRevision: (req, s) => {
            return createRevision({ req, status: s });
          },
          updateRevision: (req, s) => {
            return updateRevision({ req, status: s });
          },
          revisionId: rev.revision.id,
          status,
        });
      }}
    />
  );
};
