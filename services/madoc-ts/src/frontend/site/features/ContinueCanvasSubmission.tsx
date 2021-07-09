import React from 'react';
import { useTranslation } from 'react-i18next';
import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-react';
import { Button } from '../../shared/atoms/Button';
import { InfoMessage } from '../../shared/atoms/InfoMessage';
import { ProjectListingDescription, ProjectListingItem, ProjectListingTitle } from '../../shared/atoms/ProjectListing';
import { LocaleString } from '../../shared/components/LocaleString';
import { ProjectDetailWrapper } from '../../shared/components/ProjectDetailWrapper';
import { useUser } from '../../shared/hooks/use-site';
import { HrefLink } from '../../shared/utility/href-link';
import { useCanvasUserTasks } from '../hooks/use-canvas-user-tasks';
import { useContinueSubmission } from '../hooks/use-continue-submission';
import { useManifestTask } from '../hooks/use-manifest-task';
import { useProject } from '../hooks/use-project';
import { useProjectStatus } from '../hooks/use-project-status';
import { useRelativeLinks } from '../hooks/use-relative-links';
import { useRouteContext } from '../hooks/use-route-context';
import { useSiteConfiguration } from './SiteConfigurationContext';

export const ContinueCanvasSubmission: React.FC = () => {
  const { t } = useTranslation();
  const { projectId, canvasId } = useRouteContext();
  const { completedAndHide, canClaimCanvas, canUserSubmit, isLoading, canContribute, userTasks } = useCanvasUserTasks();
  const { isManifestComplete, canClaimManifest, userManifestTask } = useManifestTask();
  const config = useSiteConfiguration();
  const allowMultiple = !config.project.modelPageOptions?.preventMultipleUserSubmissionsPerResource;
  const preventFurtherSubmission = !allowMultiple && !!userTasks?.find(task => task.status === 2 || task.status === 3);
  const { tasks: continueSubmission, inProgress: continueCount } = useContinueSubmission();
  const createLink = useRelativeLinks();
  const { data: project } = useProject();
  const user = useUser();
  const { isPreparing, isActive } = useProjectStatus();

  if (!projectId || (!isActive && !isPreparing)) {
    return null;
  }

  if (!user) {
    return <ProjectDetailWrapper />;
  }

  if (project && isPreparing) {
    return (
      <ProjectDetailWrapper>
        <Button
          $primary
          as={HrefLink}
          href={createLink({ canvasId, subRoute: 'model' })}
          style={{ display: 'inline-block' }}
        >
          {t('Prepare model')}
        </Button>
      </ProjectDetailWrapper>
    );
  }

  if (project && (completedAndHide || !canUserSubmit || isManifestComplete)) {
    if (isLoading) {
      return <ProjectDetailWrapper />;
    }

    if (isManifestComplete) {
      return <ProjectDetailWrapper message={<InfoMessage>{t('This manifest is complete')}</InfoMessage>} />;
    }

    if (completedAndHide) {
      return <ProjectDetailWrapper message={<InfoMessage>{t('This page is complete')}</InfoMessage>} />;
    }

    return (
      <ProjectDetailWrapper
        message={<InfoMessage>{t('The maximum number of contributions has been reached')}</InfoMessage>}
      />
    );
  }

  if (project && continueSubmission?.length) {
    const revision = continueSubmission[0].state.revisionId;
    const notStarted = continueSubmission[0].status === 0;
    const started = continueSubmission[0].status === 1;
    const completed = continueSubmission[0].status === 2 || continueSubmission[0].status === 3;

    return (
      <ProjectDetailWrapper>
        {!continueCount && !notStarted && !completed ? (
          <ProjectListingDescription>
            <strong>{started ? t('You have started this item') : t('You have already completed this item')}</strong>
          </ProjectListingDescription>
        ) : null}
        <Button
          $primary
          as={HrefLink}
          href={createLink({
            canvasId,
            subRoute: 'model',
            query: { revision: continueCount ? revision : undefined },
          })}
          style={{ display: 'inline-block' }}
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
      </ProjectDetailWrapper>
    );
  }

  if (canContribute && (canClaimCanvas || canClaimManifest || userManifestTask)) {
    return (
      <ProjectDetailWrapper>
        <Button
          $primary
          as={HrefLink}
          href={createLink({ canvasId, subRoute: 'model' })}
          style={{ display: 'inline-block' }}
        >
          {t('Contribute')}
        </Button>
      </ProjectDetailWrapper>
    );
  }

  return (
    <div>
      <ProjectListingItem>
        <ProjectListingTitle>
          <HrefLink href={`/projects/${projectId}`}>
            <LocaleString>{project ? project.label : { none: ['...'] }}</LocaleString>
          </HrefLink>
        </ProjectListingTitle>
        {project ? (
          <ProjectListingDescription>
            <LocaleString>{project.summary}</LocaleString>
          </ProjectListingDescription>
        ) : null}
        {!isLoading ? (
          canContribute && (canClaimCanvas || canClaimManifest || userManifestTask) ? (
            <Button
              $primary
              as={HrefLink}
              href={createLink({ canvasId, subRoute: 'model' })}
              style={{ display: 'inline-block' }}
            >
              {t('Contribute')}
            </Button>
          ) : (
            <div style={{ height: '2.38em' }} />
          )
        ) : canClaimCanvas ? (
          <Button disabled style={{ minWidth: 100 }}>
            {t('...')}
          </Button>
        ) : (
          <div style={{ height: '2.38em' }} />
        )}
      </ProjectListingItem>
    </div>
  );
};

blockEditorFor(ContinueCanvasSubmission, {
  type: 'default.ContinueCanvasSubmission',
  label: 'Canvas continue submission',
  anyContext: ['canvas'],
  requiredContext: ['project', 'manifest', 'canvas'],
  editor: {},
  defaultProps: {},
});
