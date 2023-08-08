import React from 'react';
import { useTranslation } from 'react-i18next';
import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-for';
import { useRecentUserTasks } from '../../shared/hooks/use-recent-user-tasks';
import { CSSThirdGrid, GridButton } from '../../shared/layout/Grid';
import { Heading3 } from '../../shared/typography/Heading3';
import { ContinueTaskDisplay } from '../features/tasks/ContinueTaskDisplay';
import { HrefLink } from '../../shared/utility/href-link';
import { useProject } from '../hooks/use-project';
import { useProjectShadowConfiguration } from '../hooks/use-project-shadow-configuration';
import { useProjectStatus } from '../hooks/use-project-status';
import { useRelativeLinks } from '../hooks/use-relative-links';

export const ProjectContributionButton: React.FC = () => {
  const { t } = useTranslation();
  const { data: project } = useProject();
  const { isActive } = useProjectStatus();
  const createLink = useRelativeLinks();
  const { showCaptureModelOnManifest } = useProjectShadowConfiguration();

  const recentTasks = useRecentUserTasks(3);

  if (!project || !isActive) {
    return null;
  }

  if (!recentTasks.length) {
    return null;
  }

  return (
    <div>
      <Heading3 $margin>{t('Pick up where you left off')}</Heading3>
      <CSSThirdGrid $justify="center">
        {recentTasks.map(task => {
          return (
            <div key={task.task.id}>
              <ContinueTaskDisplay task={task.task} next={task.next} manifestModel={showCaptureModelOnManifest} />
            </div>
          );
        })}
        <GridButton
          as={HrefLink}
          href={createLink({ projectId: project.id, subRoute: 'tasks', query: { type: 'crowdsourcing-task' } })}
        >
          {t('View all contributions')}
        </GridButton>
      </CSSThirdGrid>
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
