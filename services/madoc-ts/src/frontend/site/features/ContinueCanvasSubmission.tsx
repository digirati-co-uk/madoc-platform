import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../shared/atoms/Button';
import { ProjectListingDescription, ProjectListingItem, ProjectListingTitle } from '../../shared/atoms/ProjectListing';
import { SuccessMessage } from '../../shared/atoms/SuccessMessage';
import { LocaleString } from '../../shared/components/LocaleString';
import { HrefLink } from '../../shared/utility/href-link';
import { useCanvasUserTasks } from '../hooks/use-canvas-user-tasks';
import { useContinueSubmission } from '../hooks/use-continue-submission';
import { useProject } from '../hooks/use-project';
import { useRelativeLinks } from '../hooks/use-relative-links';
import { useRouteContext } from '../hooks/use-route-context';

export const ContinueCanvasSubmission: React.FC = () => {
  const { t } = useTranslation();
  const { projectId, canvasId } = useRouteContext();
  const { completedAndHide, canClaimCanvas, canUserSubmit, isLoading, canContribute } = useCanvasUserTasks();
  const { tasks: continueSubmission, inProgress: continueCount } = useContinueSubmission();
  const createLink = useRelativeLinks();
  const { data: project } = useProject();

  if (!projectId) {
    return null;
  }

  if (project && (completedAndHide || !canUserSubmit)) {
    return (
      <div>
        <ProjectListingItem key={project.id}>
          <ProjectListingTitle>
            <HrefLink href={`/projects/${project.id}`}>
              <LocaleString>{project.label}</LocaleString>
            </HrefLink>
          </ProjectListingTitle>
          <ProjectListingDescription>
            <LocaleString>{project.summary}</LocaleString>
            <div style={{ height: '2.38em' }} />
          </ProjectListingDescription>
        </ProjectListingItem>
        {isLoading ? null : (
          <SuccessMessage>
            {completedAndHide ? t('This page is complete') : t('The maximum number of contributions has been reached')}
          </SuccessMessage>
        )}
      </div>
    );
  }

  if (project && continueSubmission?.length) {
    const revision = continueSubmission[0].state.revisionId;

    return (
      <div>
        <ProjectListingItem key={project.id}>
          <ProjectListingTitle>
            <HrefLink href={`/projects/${project.id}`}>
              <LocaleString>{project.label}</LocaleString>
            </HrefLink>
          </ProjectListingTitle>
          <ProjectListingDescription>
            <LocaleString>{project.summary}</LocaleString>
          </ProjectListingDescription>
          {!continueCount ? (
            <ProjectListingDescription>
              <strong>{t('You have already completed this item')}</strong>
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
            {continueCount ? t('Continue submission ({{count}})', { count: continueCount }) : t('Add new submission')}
          </Button>
        </ProjectListingItem>
      </div>
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
          canContribute && canClaimCanvas ? (
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
