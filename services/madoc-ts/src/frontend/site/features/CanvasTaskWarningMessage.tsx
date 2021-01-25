import React from 'react';
import { useTranslation } from 'react-i18next';
import { WarningMessage } from '../../shared/atoms/WarningMessage';
import { useCanvasUserTasks } from '../hooks/use-canvas-user-tasks';

export const CanvasTaskWarningMessage: React.FC = () => {
  const { t } = useTranslation();
  const { userTasks } = useCanvasUserTasks();
  const date = new Date().getTime();
  const tasksWithWarning = userTasks
    ? userTasks.find(task => {
        if (!task.state.warningTime || !task.modified_at) return;
        return date - task.modified_at > task.state.warningTime && task.status === 1;
      })
    : undefined;

  if (tasksWithWarning) {
    return (
      <WarningMessage>
        {userTasks?.length ? t('Your contribution may expire') : t('Some of your contributions may expire')}
      </WarningMessage>
    );
  }

  return null;
};
