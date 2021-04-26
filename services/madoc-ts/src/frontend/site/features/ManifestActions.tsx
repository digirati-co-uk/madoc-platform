import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Button, ButtonRow } from '../../shared/atoms/Button';
import { HrefLink } from '../../shared/utility/href-link';
import { useManifestPageConfiguration } from '../hooks/use-manifest-page-configuration';
import { useManifestTask } from '../hooks/use-manifest-task';
import { useRelativeLinks } from '../hooks/use-relative-links';
import { GoToRandomCanvas } from './GoToRandomCanvas';
import { ManifestItemFilter } from './ManifestItemFilter';
import { ManifestTaskProgress } from './ManifestTaskProgress';

export const ManifestActions: React.FC = () => {
  const { t } = useTranslation();
  const createLink = useRelativeLinks();
  const options = useManifestPageConfiguration();
  const { isManifestComplete, userManifestTask, canClaimManifest } = useManifestTask();

  return (
    <ButtonRow>
      {!options.hideOpenInMirador ? (
        <Button
          as={HrefLink}
          href={createLink({
            subRoute: 'mirador',
          })}
        >
          {t('Open in mirador')}
        </Button>
      ) : null}

      {!options.hideSearchButton ? (
        <Button as={Link} to={createLink({ subRoute: 'search' })}>
          {t('Search this manifest')}
        </Button>
      ) : null}
      {!options.hideStartContributing && !isManifestComplete && (userManifestTask || canClaimManifest) ? (
        <GoToRandomCanvas $primary label={{ none: [t('Start contributing')] }} navigateToModel />
      ) : null}
      {!options.hideRandomCanvas ? <GoToRandomCanvas /> : null}
      {!options.hideFilterImages ? <ManifestItemFilter /> : null}
      <ManifestTaskProgress />
    </ButtonRow>
  );
};
