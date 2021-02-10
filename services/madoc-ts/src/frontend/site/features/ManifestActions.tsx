import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Button, ButtonRow } from '../../shared/atoms/Button';
import { usePaginatedData } from '../../shared/hooks/use-data';
import { useLocationQuery } from '../../shared/hooks/use-location-query';
import { useSubjectMap } from '../../shared/hooks/use-subject-map';
import { HrefLink } from '../../shared/utility/href-link';
import { useRelativeLinks } from '../hooks/use-relative-links';
import { useRouteContext } from '../hooks/use-route-context';
import { ManifestLoader } from '../pages/loaders/manifest-loader';

export const ManifestActions: React.FC = () => {
  const { resolvedData: data } = usePaginatedData(ManifestLoader, [], {
    cacheTime: 3600,
  });
  const { t } = useTranslation();
  const { manifestId } = useRouteContext();
  const { filter, page } = useLocationQuery();
  const createLink = useRelativeLinks();
  const [, showDoneButton] = useSubjectMap(data?.subjects);

  return (
    <ButtonRow>
      <Button
        as={HrefLink}
        href={createLink({
          subRoute: 'mirador',
        })}
      >
        {t('Open in mirador')}
      </Button>

      {showDoneButton || filter ? (
        <Button
          as={HrefLink}
          href={createLink({
            query: { filter: filter ? undefined : 3, page },
          })}
        >
          {filter ? t('Show completed') : t('Hide completed')}
        </Button>
      ) : null}

      <Button as={Link} to={createLink({ subRoute: 'search' })}>
        {t('Search this manifest')}
      </Button>
    </ButtonRow>
  );
};
