import React from 'react';
import { useTranslation } from 'react-i18next';
import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-react';
import { parseUrn } from '../../../utility/parse-urn';
import { SmallButton } from '../../shared/navigation/Button';
import { GridContainer, ThirdGrid } from '../../shared/layout/Grid';
import { Heading3 } from '../../shared/typography/Heading3';
import { ContinueTaskDisplay } from '../../shared/components/ContinueTaskDisplay';
import { useContributorTasks } from '../../shared/hooks/use-contributor-tasks';
import { firstNTasksWithUniqueSubjects } from '../../shared/utility/first-n-tasks-with-unique-subjects';
import { HrefLink } from '../../shared/utility/href-link';
import { useProject } from '../hooks/use-project';
import { useProjectStatus } from '../hooks/use-project-status';
import { useRelativeLinks } from '../hooks/use-relative-links';
import { useSiteConfiguration } from './SiteConfigurationContext';

export const ProjectContributionButton: React.FC = () => {
  const { t } = useTranslation();
  const { data: project } = useProject();
  const { isActive } = useProjectStatus();
  const createLink = useRelativeLinks();
  const {
    project: { contributionMode, claimGranularity },
  } = useSiteConfiguration();
  const contributorTasks = useContributorTasks({ rootTaskId: project?.task_id }, !!project);

  const currentTasks = contributorTasks?.drafts.tasks;
  const tasksInReview = contributorTasks?.reviews.tasks;

  if (!project || !isActive) {
    return null;
  }

  const taskComponents = [];

  if (currentTasks && currentTasks.length) {
    const firstThree = firstNTasksWithUniqueSubjects(currentTasks, 3);

    for (const task of firstThree) {
      taskComponents.push(
        <ThirdGrid key={task.id}>
          <ContinueTaskDisplay task={task} />
        </ThirdGrid>
      );
    }
  }

  if (
    contributionMode !== 'transcription' &&
    claimGranularity !== 'manifest' &&
    tasksInReview &&
    tasksInReview.length &&
    taskComponents.length < 3
  ) {
    const firstThree = firstNTasksWithUniqueSubjects(tasksInReview, 3 - taskComponents.length);

    for (const task of firstThree) {
      const parsed = parseUrn(task.subject);
      if (parsed && parsed.type === 'canvas') {
        taskComponents.push(
          <ThirdGrid key={task.id}>
            <ContinueTaskDisplay task={task} next />
          </ThirdGrid>
        );
      }
    }
  }

  if (taskComponents.length === 0) {
    return null;
  }

  return (
    <div>
      <Heading3 $margin>{t('Continue where you left off')}</Heading3>
      <GridContainer>{taskComponents}</GridContainer>
      <SmallButton
        as={HrefLink}
        href={createLink({ projectId: project.id, subRoute: 'tasks', query: { type: 'crowdsourcing-task' } })}
      >
        {t('View all contributions')}
      </SmallButton>
    </div>
  );
};

blockEditorFor(ProjectContributionButton, {
  type: 'default.ProjectContributionButton',
  label: 'Continue where you left off',
  anyContext: ['project'],
  requiredContext: ['project'],
  editor: {},
});
