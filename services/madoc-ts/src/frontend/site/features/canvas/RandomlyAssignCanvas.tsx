import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../../shared/navigation/Button';
import { ErrorMessage } from '../../../shared/callouts/ErrorMessage';
import { Heading3, Subheading3 } from '../../../shared/typography/Heading3';
import { LocaleString, useCreateLocaleString } from '../../../shared/components/LocaleString';
import { HrefLink } from '../../../shared/utility/href-link';
import { useAssignRandomCanvas } from '../../hooks/use-assign-random-canvas';
import { useRelativeLinks } from '../../hooks/use-relative-links';
import { useRouteContext } from '../../hooks/use-route-context';
import { usePreventCanvasNavigation } from '../../hooks/use-prevent-canvas-navigation';

export const RandomlyAssignCanvas: React.FC = () => {
  const { t } = useTranslation();
  const { projectId } = useRouteContext();
  const createLink = useRelativeLinks();
  const { claimManifest, userCanSubmit, randomlyAssignCanvas } = usePreventCanvasNavigation();
  const { onContribute, getRandomCanvas, contributeStatus, randomCanvas } = useAssignRandomCanvas();
  const createLocaleString = useCreateLocaleString();

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
                  <img
                    src={randomCanvas.data.canvas.thumbnail}
                    alt={createLocaleString(randomCanvas.data.canvas.label, t('Untitled canvas'))}
                  />
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
