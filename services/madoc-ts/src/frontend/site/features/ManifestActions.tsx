import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Button, ButtonRow } from '../../shared/atoms/Button';
import { HrefLink } from '../../shared/utility/href-link';
import { useManifestPageConfiguration } from '../hooks/use-manifest-page-configuration';
import { useManifestTask } from '../hooks/use-manifest-task';
import { useRelativeLinks } from '../hooks/use-relative-links';
import { GoToFirstCanvas } from './GoToFirstCanvas';
import { GoToRandomCanvas } from './GoToRandomCanvas';
import { ManifestItemFilter } from './ManifestItemFilter';
import { ManifestTaskProgress } from './ManifestTaskProgress';
import { useSiteConfiguration } from './SiteConfigurationContext';

export const ManifestActions: React.FC = () => {
  const { t } = useTranslation();
  const createLink = useRelativeLinks();
  const options = useManifestPageConfiguration();
  const {
    project: { claimGranularity },
  } = useSiteConfiguration();
  const { isManifestComplete, userManifestTask, canClaimManifest } = useManifestTask();

  return (
    <>
      {!options.hideStartContributing && !isManifestComplete && (userManifestTask || canClaimManifest) ? (
        <ButtonRow>
          {claimGranularity === 'manifest' ? (
            <GoToFirstCanvas $primary $large navigateToModel>
              {t('Start contributing')}
            </GoToFirstCanvas>
          ) : (
            <GoToRandomCanvas $primary $large label={{ none: [t('Start contributing')] }} navigateToModel />
          )}
        </ButtonRow>
      ) : null}
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
        {!options.hideRandomCanvas ? <GoToRandomCanvas /> : null}
        {!options.hideFilterImages ? <ManifestItemFilter /> : null}
        <ManifestTaskProgress />
      </ButtonRow>
    </>
  );
};
