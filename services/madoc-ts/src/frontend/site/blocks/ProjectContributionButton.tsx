import React from 'react';
import { useTranslation } from 'react-i18next';
import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-for';
import { useRecentUserTasks } from '../../shared/hooks/use-recent-user-tasks';
import { CSSThirdGrid } from '../../shared/layout/Grid';
import { Heading3 } from '../../shared/typography/Heading3';
import { ContinueTaskDisplay } from '../features/tasks/ContinueTaskDisplay';
import { useProject } from '../hooks/use-project';
import { useProjectShadowConfiguration } from '../hooks/use-project-shadow-configuration';
import { useProjectStatus } from '../hooks/use-project-status';

export const ProjectContributionButton: React.FC = () => {
  const { t } = useTranslation();
  const { data: project } = useProject();
  const { isActive } = useProjectStatus();
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
      </CSSThirdGrid>
    </div>
  );
};

blockEditorFor(ProjectContributionButton, {
  type: 'default.ProjectContributionButton',
  label: 'Continue where you left off (LEGACY)',
  anyContext: ['project'],
  requiredContext: ['project'],
  editor: {},
});
