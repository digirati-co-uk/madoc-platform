import { InternationalString } from '@iiif/presentation-3';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../shared/navigation/Button';
import { LocaleString } from '../../../shared/components/LocaleString';
import { useUser } from '../../../shared/hooks/use-site';
import { useGetRandomManifest } from '../../hooks/use-get-random-manifest';
import { useRelativeLinks } from '../../hooks/use-relative-links';
import { useRouteContext } from '../../hooks/use-route-context';

export const GoToRandomManifest: React.FC<{
  label?: InternationalString;
  navigateToModel?: boolean;
  manifestModel?: boolean;
  $primary?: boolean;
  $large?: boolean;
  notCurrentManifest?: boolean;
}> = ({ label, $large, navigateToModel, manifestModel, $primary, notCurrentManifest }) => {
  const { projectId } = useRouteContext();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const createLink = useRelativeLinks();
  const [getRandomManifest] = useGetRandomManifest();
  const user = useUser();
  const [error, setError] = useState(false);
  const { manifestId } = useRouteContext();

  if (!projectId || !user) {
    return null;
  }

  return (
    <Button
      $primary={$primary}
      $large={$large}
      disabled={error}
      onClick={async () => {
        let resp = await getRandomManifest();
        let tries = 1;
        while (resp && notCurrentManifest && manifestId && resp.manifest === manifestId && tries < 5) {
          resp = await getRandomManifest();
          tries++;
        }
        if (resp && resp.manifest) {
          navigate(
            createLink({
              canvasId: undefined,
              manifestId: resp.manifest,
              query: navigateToModel && !manifestModel ? { firstModel: true } : undefined,
              subRoute: navigateToModel && manifestModel ? 'model' : '',
            })
          );
        } else {
          setError(true);
        }
      }}
    >
      {error ? t('No available manifests') : label ? <LocaleString>{label}</LocaleString> : t('Go to random Manifest')}
    </Button>
  );
};
