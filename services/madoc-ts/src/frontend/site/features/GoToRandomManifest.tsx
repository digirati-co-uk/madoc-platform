import { InternationalString } from '@hyperion-framework/types/iiif/descriptive';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import { Button } from '../../shared/atoms/Button';
import { LocaleString } from '../../shared/components/LocaleString';
import { useUser } from '../../shared/hooks/use-site';
import { useGetRandomManifest } from '../hooks/use-get-random-manifest';
import { useRelativeLinks } from '../hooks/use-relative-links';
import { useRouteContext } from '../hooks/use-route-context';

export const GoToRandomManifest: React.FC<{
  label?: InternationalString;
  navigateToModel?: boolean;
  $primary?: boolean;
  $large?: boolean;
}> = ({ label, $large, navigateToModel, $primary }) => {
  const { projectId } = useRouteContext();
  const { t } = useTranslation();
  const history = useHistory();
  const createLink = useRelativeLinks();
  const [getRandomManifest] = useGetRandomManifest();
  const user = useUser();
  const [error, setError] = useState(false);

  if (!projectId || !user) {
    return null;
  }

  return (
    <Button
      $primary={$primary}
      $large={$large}
      disabled={error}
      onClick={() => {
        getRandomManifest().then(resp => {
          if (resp && resp.manifest) {
            history.push(
              createLink({
                manifestId: resp.manifest,
                query: navigateToModel ? { firstModel: true } : undefined,
              })
            );
          } else {
            setError(true);
          }
        });
      }}
    >
      {error ? t('No available manifests') : label ? <LocaleString>{label}</LocaleString> : t('Go to random Manifest')}
    </Button>
  );
};
