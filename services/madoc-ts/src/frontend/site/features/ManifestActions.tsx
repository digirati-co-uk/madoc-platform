import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-for';
import { Button, ButtonRow } from '../../shared/navigation/Button';
import { IIIFDragIcon } from '../../shared/components/IIIFDragIcon';
import { HrefLink } from '../../shared/utility/href-link';
import { useManifestPageConfiguration } from '../hooks/use-manifest-page-configuration';
import { useManifestTask } from '../hooks/use-manifest-task';
import { useProjectShadowConfiguration } from '../hooks/use-project-shadow-configuration';
import { useProjectStatus } from '../hooks/use-project-status';
import { useRelativeLinks } from '../hooks/use-relative-links';
import { AssignManifestToUser } from './AssignManifestToUser';
import { GoToFirstCanvas } from './GoToFirstCanvas';
import { GoToRandomCanvas } from './GoToRandomCanvas';
import { ManifestItemFilter } from './ManifestItemFilter';
import { ManifestTaskProgress } from './ManifestTaskProgress';
import { usePreventCanvasNavigation } from './PreventUsersNavigatingCanvases';
import { useSiteConfiguration } from './SiteConfigurationContext';
import { GenerateManifestPdf } from './GenerateManifestPdf';
import { ProjectDetailWrapper } from '../../shared/components/ProjectDetailWrapper';
import { ProjectListingDescription } from '../../shared/atoms/ProjectListing';
import { useContinueSubmission } from '../hooks/use-continue-submission';
import { useProject } from '../hooks/use-project';
import { useManifestUserTasks } from '../hooks/use-manifest-user-tasks';

export type props = {
  alignment?: string;
};
export const ManifestActions: React.FC<props> = ({ alignment }) => {
  const { t } = useTranslation();
  const createLink = useRelativeLinks();
  const options = useManifestPageConfiguration();
  const { showNavigationContent } = usePreventCanvasNavigation();
  const { canUserSubmit, userTasks } = useManifestUserTasks();
  const { isActive, isPreparing } = useProjectStatus();
  const { data: project } = useProject();
  const { tasks: continueSubmission, inProgress: continueCount } = useContinueSubmission();
  const config = useSiteConfiguration();
  const allowMultiple = !config.project.modelPageOptions?.preventMultipleUserSubmissionsPerResource;
  const preventFurtherSubmission = !allowMultiple && !!userTasks?.find(task => task.status === 2 || task.status === 3);
  const {
    project: { claimGranularity, manifestPageOptions },
  } = useSiteConfiguration();
  const { showCaptureModelOnManifest } = useProjectShadowConfiguration();
  const {
    isManifestComplete,
    userManifestTask,
    canClaimManifest,
    filteredTasks,
    isManifestInProgress,
  } = useManifestTask();
  const { done, inReview } = filteredTasks;

  const showButton =
    isActive &&
    !options.hideStartContributing &&
    !isManifestComplete &&
    (userManifestTask || canClaimManifest) &&
    !inReview.length &&
    !isManifestInProgress;

  const showIIIFLogo = manifestPageOptions?.showIIIFLogo;

  if (!showNavigationContent) {
    return null;
  }

  const ContinueButtons = () => {
    if (project && continueSubmission?.length) {
      const revision = continueSubmission[0].state.revisionId;
      const notStarted = continueSubmission[0].status === 0;
      const started = continueSubmission[0].status === 1;
      const isCompleted = continueSubmission[0].status === 2 || continueSubmission[0].status === 3;

      return (
        <>
          {!continueCount && !notStarted && !isCompleted ? (
            <ProjectListingDescription>
              <strong>{started ? t('You have started this item') : t('You have already completed this item')}</strong>
            </ProjectListingDescription>
          ) : null}
          <Button
            $primary
            as={HrefLink}
            href={createLink({
              subRoute: 'model',
              query: { revision: continueCount ? revision : undefined },
            })}
            style={{ display: 'inline-block', whiteSpace: 'nowrap' }}
          >
            {continueCount
              ? t('Continue submission ({{count}})', { count: continueCount || 1 })
              : notStarted
              ? t('Contribute')
              : started
              ? t('Continue submission')
              : canUserSubmit && !preventFurtherSubmission
              ? t('Add new submission')
              : t('View submissions')}
          </Button>
        </>
      );
    }
    return (
      <Button as={HrefLink} href={createLink({ subRoute: 'model' })} $primary $large>
        {userManifestTask && done.length ? t('View submission') : t('View submission')}
      </Button>
    );
  };
  return (
    <>
      <ButtonRow $center={alignment === 'center'} $right={alignment === 'right'}>
        {showCaptureModelOnManifest ? (
          <ContinueButtons />
        ) : claimGranularity === 'manifest' && showButton ? (
          <GoToFirstCanvas $primary $large navigateToModel>
            {userManifestTask && done.length ? t('View submission') : t('View submission')}
          </GoToFirstCanvas>
        ) : showButton ? (
          <GoToRandomCanvas $primary $large label={{ none: [t('Start contributing')] }} navigateToModel />
        ) : null}
      </ButtonRow>

      <ButtonRow $center={alignment === 'center'} $right={alignment === 'right'}>
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
        {(isActive || isPreparing) && !options.hideFilterImages && !showCaptureModelOnManifest ? (
          <ManifestItemFilter />
        ) : null}

        {options.generatePDF ? <GenerateManifestPdf /> : null}

        <ManifestTaskProgress />
        {!showCaptureModelOnManifest ? <AssignManifestToUser /> : null}
      </ButtonRow>
    </>
  );
};

blockEditorFor(ManifestActions, {
  type: 'default.ManifestActions',
  label: 'Manifest actions',
  anyContext: ['manifest'],
  requiredContext: ['manifest'],
  defaultProps: {
    alignment: '',
  },
  editor: {
    alignment: {
      label: 'alignment',
      type: 'dropdown-field',
      options: [
        { value: 'left', text: 'Left aligned' },
        { value: 'center', text: 'Center aligned' },
        { value: 'right', text: 'Right aligned' },
      ],
    },
  },
});
