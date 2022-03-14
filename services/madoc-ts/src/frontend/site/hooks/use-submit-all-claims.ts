import { useMutation } from 'react-query';
import { useDeselectRevision } from '../../shared/capture-models/new/hooks/use-deselect-revision';
import { useRevisionList } from '../../shared/capture-models/new/hooks/use-revision-list';
import { RevisionRequest } from '../../shared/capture-models/types/revision-request';
import { useApi } from '../../shared/hooks/use-api';
import { useViewerSaving } from '../../shared/hooks/use-viewer-saving';
import { useInvalidateAfterSubmission } from './use-invalidate-after-submission';
import { useRouteContext } from './use-route-context';

export const useSubmitAllClaims = () => {
  const { projectId, manifestId, collectionId, canvasId } = useRouteContext();
  const api = useApi();
  const deselectRevision = useDeselectRevision();
  const invalidate = useInvalidateAfterSubmission();

  const afterSave = async (response: RevisionRequest) => {
    if (projectId) {
      await api.createResourceClaim(projectId, {
        revisionId: response.revision.id,
        manifestId,
        canvasId,
        collectionId,
        status: 2,
      });

      await invalidate();
    }
  };
  const updateFunction = useViewerSaving(afterSave);
  const { myUnpublished } = useRevisionList();
  const [submitAllClaims, { isLoading }] = useMutation(async () => {
    if (projectId && manifestId) {
      for (const response of myUnpublished) {
        await updateFunction(response, 'submitted');
      }
    }
    deselectRevision();
  });

  return {
    submitAllClaims,
    isSubmitting: isLoading,
    canSubmit: myUnpublished.length !== 0,
  };
};
