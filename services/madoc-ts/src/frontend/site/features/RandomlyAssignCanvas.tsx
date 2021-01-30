import React from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation } from 'react-query';
import { useHistory } from 'react-router-dom';
import { Button } from '../../shared/atoms/Button';
import { ErrorMessage } from '../../shared/atoms/ErrorMessage';
import { Heading3, Subheading3 } from '../../shared/atoms/Heading3';
import { LocaleString } from '../../shared/components/LocaleString';
import { useApi } from '../../shared/hooks/use-api';
import { HrefLink } from '../../shared/utility/href-link';
import { useManifestUserTasks } from '../hooks/use-manifest-user-tasks';
import { useRelativeLinks } from '../hooks/use-relative-links';
import { useRouteContext } from '../hooks/use-route-context';
import { usePreventCanvasNavigation } from './PreventUsersNavigatingCanvases';

export function useAssignRandomCanvas() {
  const createLink = useRelativeLinks();
  const { refetch } = useManifestUserTasks();
  const { projectId, manifestId, collectionId } = useRouteContext();
  const api = useApi();
  const history = useHistory();

  // Mutations.
  const [getRandomCanvas, randomCanvas] = useMutation(async () => {
    if (projectId && manifestId) {
      return await api.randomlyAssignedCanvas(projectId, manifestId, {
        type: 'canvas',
        collectionId,
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

export const RandomlyAssignCanvas: React.FC = () => {
  const { t } = useTranslation();
  const { projectId } = useRouteContext();
  const createLink = useRelativeLinks();
  const { claimManifest, userCanSubmit, randomlyAssignCanvas } = usePreventCanvasNavigation();
  const { onContribute, getRandomCanvas, contributeStatus, randomCanvas } = useAssignRandomCanvas();

  if (claimManifest && userCanSubmit && projectId) {
    return (
      <>
        <Subheading3>Click below if you want to claim this manifest to contribute to.</Subheading3>
        <Button disabled={contributeStatus === 'loading'} onClick={() => onContribute(projectId)}>
          {t('Claim manifest')}
        </Button>
      </>
    );
  }

  if (randomlyAssignCanvas && userCanSubmit) {
    return (
      <>
        <Subheading3>{t('Click below if you want to contribute to a random image.')}</Subheading3>
        {!randomCanvas.data ? (
          <Button disabled={randomCanvas.status === 'loading'} onClick={() => getRandomCanvas()}>
            {t('Contribute to random canvas')}
          </Button>
        ) : (
          <div>
            {randomCanvas.data.remainingTasks === 0 ? (
              <ErrorMessage>{t('Sorry no canvases are available at the moment')}</ErrorMessage>
            ) : (
              <>
                <div>
                  <img src={randomCanvas.data.canvas.thumbnail} alt="thumbnail" />
                </div>
                <Heading3 $margin>
                  <LocaleString>{randomCanvas.data.canvas.label}</LocaleString>
                </Heading3>
                <Button as={HrefLink} href={createLink({ taskId: randomCanvas.data.claim.id })}>
                  {t('Go to resource')}
                </Button>
              </>
            )}
          </div>
        )}
      </>
    );
  }

  return null;
};
