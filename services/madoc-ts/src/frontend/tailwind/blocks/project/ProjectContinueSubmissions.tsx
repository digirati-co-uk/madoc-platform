import { useTranslation } from 'react-i18next';
import { blockEditorFor } from '../../../../extensions/page-blocks/block-editor-for';
import { useRecentUserTasks } from '../../../shared/hooks/use-recent-user-tasks';
import { ContinueSubmission } from '../../components/ContinueSubmission';
import { GridButton } from '../../../shared/layout/Grid';
import { HrefLink } from '../../../shared/utility/href-link';
import React from 'react';
import { createLink } from '../../../shared/utility/create-link';
import { useRouteContext } from '../../../site/hooks/use-route-context';
import { ContinueTaskDisplay } from '../../../site/features/tasks/ContinueTaskDisplay';
import { useProjectShadowConfiguration } from '../../../site/hooks/use-project-shadow-configuration';

type ProjectContinueSubmissionsProps = {
  items?: string;
  showViewAll?: boolean;
  horizontal?: boolean;
};

export function ProjectContinueSubmissions(props: ProjectContinueSubmissionsProps) {
  const { t } = useTranslation();
  const { projectId } = useRouteContext();
  const { showCaptureModelOnManifest } = useProjectShadowConfiguration();

  const requested = Number(props.items) || 2;
  const recentTasks = useRecentUserTasks(requested, true);

  if (!recentTasks || !recentTasks.length) {
    return null;
  }

  return (
    <div className="my-5">
      <h3 className="text-xl font-semibold mb-4">{t('Continue where you left off!')}</h3>
      <div className="grid grid-cols-2 gap-4">
        {recentTasks.map((task, idx) =>
          !props.horizontal ? (
            <ContinueSubmission key={idx} task={task.task} next={task.next} />
          ) : (
            <ContinueTaskDisplay task={task.task} next={task.next} manifestModel={showCaptureModelOnManifest} />
          )
        )}
        <GridButton
          style={{ width: props.horizontal ? '191px' : 'auto' }}
          as={HrefLink}
          href={createLink({ projectId: projectId, subRoute: 'tasks', query: { type: 'crowdsourcing-task' } })}
        >
          {t('View all contributions')}
        </GridButton>
      </div>
    </div>
  );
}

blockEditorFor(ProjectContinueSubmissions, {
  type: 'default.ProjectContinueSubmissions',
  label: 'Project continue submissions',
  anyContext: ['project'],
  requiredContext: ['project'],
  defaultProps: {
    items: '2',
    showViewAll: true,
    horizontal: false,
  },
  editor: {
    items: { label: 'Number of items shown', type: 'text-field' },
    showViewAll: { label: 'Show view all button', type: 'checkbox-field' },
    horizontal: { label: 'Horizontal cards', type: 'checkbox-field' },
  },
});
