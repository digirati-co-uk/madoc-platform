import { InternationalString } from '@hyperion-framework/types/iiif/descriptive';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import { Button } from '../../shared/atoms/Button';
import { LocaleString } from '../../shared/components/LocaleString';
import { useUser } from '../../shared/hooks/use-site';
import { useGetRandomCanvas } from '../hooks/use-get-random-canvas';
import { useRelativeLinks } from '../hooks/use-relative-links';
import { useRouteContext } from '../hooks/use-route-context';

export const GoToRandomCanvas: React.FC<{
  label?: InternationalString;
  navigateToModel?: boolean;
  $primary?: boolean;
}> = ({ $primary, label, navigateToModel }) => {
  const { projectId } = useRouteContext();
  const { t } = useTranslation();
  const history = useHistory();
  const createLink = useRelativeLinks();
  const [getRandomCanvas] = useGetRandomCanvas();
  const user = useUser();
  const [error, setError] = useState(false);

  if (!projectId || !user) {
    return null;
  }

  return (
    <Button
      $primary={$primary}
      disabled={error}
      onClick={() => {
        getRandomCanvas().then(resp => {
          if (resp) {
            history.push(
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
      {error ? t('No available canvases') : label ? <LocaleString>{label}</LocaleString> : t('Go to random Canvas')}
    </Button>
  );
};
