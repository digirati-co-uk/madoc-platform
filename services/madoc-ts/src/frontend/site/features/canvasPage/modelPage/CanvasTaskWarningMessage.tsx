import React from 'react';
import { useTranslation } from 'react-i18next';
import { blockEditorFor } from '../../../../../extensions/page-blocks/block-editor-for';
import { WarningMessage } from '../../../../shared/callouts/WarningMessage';
import { useCanvasUserTasks } from '../../../hooks/use-canvas-user-tasks';
import { useProjectStatus } from '../../../hooks/use-project-status';

export const CanvasTaskWarningMessage: React.FC = () => {
  const { t } = useTranslation();
  const { isPreparing } = useProjectStatus();
  const { userTasks } = useCanvasUserTasks();
  const date = new Date().getTime();
  const tasksWithWarning = userTasks
    ? userTasks.find(task => {
        if (!task.state.warningTime || !task.modified_at) return;
        return date - task.modified_at > task.state.warningTime && task.status === 1;
      })
    : undefined;

  if (tasksWithWarning && !isPreparing) {
    return (
      <WarningMessage>
        {userTasks?.length ? t('Your contribution may expire') : t('Some of your contributions may expire')}
      </WarningMessage>
    );
  }

  return null;
};

blockEditorFor(CanvasTaskWarningMessage, {
  type: 'default.CanvasTaskWarningMessage',
  label: 'Canvas task warning message',
  editor: {},
  requiredContext: ['project', 'manifest', 'canvas'],
  anyContext: ['canvas'],
});
