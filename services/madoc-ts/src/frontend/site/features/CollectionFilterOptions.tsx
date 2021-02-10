import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Button, ButtonRow, MediumRoundedButton } from '../../shared/atoms/Button';
import { usePaginatedData } from '../../shared/hooks/use-data';
import { useLocationQuery } from '../../shared/hooks/use-location-query';
import { useSubjectMap } from '../../shared/hooks/use-subject-map';
import { HrefLink } from '../../shared/utility/href-link';
import { useRelativeLinks } from '../hooks/use-relative-links';
import { CollectionLoader } from '../pages/loaders/collection-loader';

export const CollectionFilterOptions: React.FC = () => {
  const { t } = useTranslation();
  const { data } = usePaginatedData(CollectionLoader);
  const createLink = useRelativeLinks();
  const { filter, page } = useLocationQuery();
  const [, showDoneButton] = useSubjectMap(data ? data.subjects : []);

  if (!data) {
    return null;
  }

  const collection = data.collection;

  return (
    <ButtonRow>
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
        {t('Search this collection')}
      </Button>
    </ButtonRow>
  );
};
