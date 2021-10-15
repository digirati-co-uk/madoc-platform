import { useMutation } from 'react-query';
import { useHistory } from 'react-router-dom';
import { useApi } from '../../shared/hooks/use-api';
import { useManifestTask } from './use-manifest-task';
import { useRelativeLinks } from './use-relative-links';
import { useRouteContext } from './use-route-context';

export function useAssignRandomCanvas() {
  const createLink = useRelativeLinks();
  const { refetch } = useManifestTask();
  const { projectId, manifestId, collectionId } = useRouteContext();
  const api = useApi();
  const history = useHistory();

  // Mutations.
  const [getRandomCanvas, randomCanvas] = useMutation(async () => {
    if (projectId && manifestId) {
      return await api.randomlyAssignedCanvas(projectId, {
        manifestId,
        type: 'canvas',
        collectionId,
        claim: true,
      });
    }
  });

  const [onContribute, { status: contributeStatus }] = useMutation(async (pid: number | string) => {
    if (manifestId) {
      return api
        .createResourceClaim(pid, {
          collectionId,
          manifestId,
        })
        .then(async resp => {
          await refetch();
          history.push(
            createLink({
              taskId: resp.claim.id,
            })
          );
        });
    }
  });

  return {
    getRandomCanvas,
    randomCanvas,
    onContribute,
    contributeStatus,
  };
}
