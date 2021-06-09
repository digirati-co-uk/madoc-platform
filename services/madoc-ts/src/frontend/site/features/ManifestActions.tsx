import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Button, ButtonRow } from '../../shared/atoms/Button';
import { IIIFDragIcon } from '../../shared/components/IIIFDragIcon';
import { IIIFLogo } from '../../shared/icons/iiif-logo';
import { HrefLink } from '../../shared/utility/href-link';
import { useManifestPageConfiguration } from '../hooks/use-manifest-page-configuration';
import { useManifestTask } from '../hooks/use-manifest-task';
import { useManifestUserTasks } from '../hooks/use-manifest-user-tasks';
import { useProjectStatus } from '../hooks/use-project-status';
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
  const { isActive } = useProjectStatus();
  const {
    project: { claimGranularity, manifestPageOptions },
  } = useSiteConfiguration();
  const { isManifestComplete, userManifestTask, canClaimManifest } = useManifestTask();
  const { doneTasks, inReview, inProgress } = useManifestUserTasks();

  const isInProgress = inProgress.length && !(userManifestTask && userManifestTask.status === 0);

  const showButton =
    isActive &&
    !options.hideStartContributing &&
    !isManifestComplete &&
    (userManifestTask || canClaimManifest) &&
    !inReview.length &&
    !isInProgress;

  const showIIIFLogo = manifestPageOptions?.showIIIFLogo;

  return (
    <>
      {showButton ? (
        <ButtonRow>
          {claimGranularity === 'manifest' ? (
            <GoToFirstCanvas $primary $large navigateToModel>
              {userManifestTask && doneTasks.length ? t('View submission') : t('Start contributing')}
            </GoToFirstCanvas>
          ) : (
            <GoToRandomCanvas $primary $large label={{ none: [t('Start contributing')] }} navigateToModel />
          )}
        </ButtonRow>
      ) : null}
      <ButtonRow>
        {showIIIFLogo ? <IIIFDragIcon /> : null}
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
        {isActive && !options.hideFilterImages ? <ManifestItemFilter /> : null}
        <ManifestTaskProgress />
      </ButtonRow>
    </>
  );
};
