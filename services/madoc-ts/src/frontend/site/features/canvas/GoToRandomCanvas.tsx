import { InternationalString } from '@iiif/presentation-3';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../shared/navigation/Button';
import { LocaleString } from '../../../shared/components/LocaleString';
import { useUser } from '../../../shared/hooks/use-site';
import { useGetRandomCanvas } from '../../hooks/use-get-random-canvas';
import { useProjectShadowConfiguration } from '../../hooks/use-project-shadow-configuration';
import { useRelativeLinks } from '../../hooks/use-relative-links';
import { useRouteContext } from '../../hooks/use-route-context';

export const GoToRandomCanvas: React.FC<{
  label?: InternationalString;
  navigateToModel?: boolean;
  $primary?: boolean;
  $large?: boolean;
}> = ({ $primary, $large, label, navigateToModel }) => {
  const { projectId } = useRouteContext();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const createLink = useRelativeLinks();
  const { showCaptureModelOnManifest } = useProjectShadowConfiguration();
  const [getRandomCanvas, getRandomCanvasStatus] = useGetRandomCanvas();
  const user = useUser();
  const [error, setError] = useState(false);

  if (!projectId || !user || showCaptureModelOnManifest) {
    return null;
  }

  return (
    <Button
      $primary={$primary}
      $large={$large}
      disabled={error || getRandomCanvasStatus.isLoading}
      onClick={() => {
        getRandomCanvas().then(resp => {
          if (resp && resp.manifest && resp.canvas) {
            navigate(
              createLink({
                manifestId: resp.manifest,
                canvasId: resp.canvas.id,
                subRoute: navigateToModel ? 'model' : undefined,
              })
            );
          } else {
            setError(true);
          }
        });
      }}
    >
      {getRandomCanvasStatus.isLoading ? (
        t('Finding canvas...')
      ) : error ? (
        t('No available canvases')
      ) : label ? (
        <LocaleString>{label}</LocaleString>
      ) : (
        t('Go to random Canvas')
      )}
    </Button>
  );
};
