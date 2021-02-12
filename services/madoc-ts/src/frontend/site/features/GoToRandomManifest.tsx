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

export const GoToRandomManifest: React.FC<{ label?: InternationalString }> = ({ label }) => {
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
      disabled={error}
      onClick={() => {
        getRandomManifest().then(resp => {
          if (resp) {
            history.push(createLink({ manifestId: resp.manifest }));
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
