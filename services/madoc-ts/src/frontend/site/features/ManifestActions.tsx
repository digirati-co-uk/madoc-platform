import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Button, ButtonRow } from '../../shared/atoms/Button';
import { HrefLink } from '../../shared/utility/href-link';
import { useRelativeLinks } from '../hooks/use-relative-links';
import { GoToRandomCanvas } from './GoToRandomCanvas';
import { ManifestItemFilter } from './ManifestItemFilter';
import { ManifestTaskProgress } from './ManifestTaskProgress';

export const ManifestActions: React.FC = () => {
  const { t } = useTranslation();
  const createLink = useRelativeLinks();

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

      <Button as={Link} to={createLink({ subRoute: 'search' })}>
        {t('Search this manifest')}
      </Button>
      <GoToRandomCanvas label={{ none: [t('Start contributing')] }} navigateToModel />
      <GoToRandomCanvas />
      <ManifestItemFilter />
      <ManifestTaskProgress />
    </ButtonRow>
  );
};
