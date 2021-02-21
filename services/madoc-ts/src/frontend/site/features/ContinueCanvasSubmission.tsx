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
import { CanvasReviewList } from './CanvasReviewList';

export const ContinueCanvasSubmission: React.FC = () => {
  const { t } = useTranslation();
  const { projectId, canvasId } = useRouteContext();
  const { completedAndHide, canClaimCanvas, canUserSubmit, isLoading, canContribute } = useCanvasUserTasks();
  const [continueSubmission, continueCount] = useContinueSubmission();
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
          </ProjectListingDescription>
        </ProjectListingItem>
        <CanvasReviewList />
        {isLoading ? null : (
          <SuccessMessage>
            {completedAndHide ? t('This page is complete') : t('The maximum number of contributions has been reached')}
          </SuccessMessage>
        )}
      </div>
    );
  }

  if (project && continueSubmission?.length) {
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
            <ProjectListingDescription>{t('You have already completed this item')}</ProjectListingDescription>
          ) : null}
          <Button
            $primary
            as={HrefLink}
            href={createLink({ canvasId, subRoute: 'model' })}
            style={{ display: 'inline-block' }}
          >
            {continueCount ? t('Continue submission ({{count}})', { count: continueCount }) : t('Add new submission')}
          </Button>
        </ProjectListingItem>
        <CanvasReviewList />
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
          ) : null
        ) : canClaimCanvas ? (
          <Button disabled style={{ minWidth: 100 }}>
            {t('...')}
          </Button>
        ) : null}
      </ProjectListingItem>
      <CanvasReviewList />
    </div>
  );
};
