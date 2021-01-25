import React from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation } from 'react-query';
import { CrowdsourcingTask } from '../../../gateway/tasks/crowdsourcing-task';
import { SmallButton } from '../../shared/atoms/Button';
import { Status } from '../../shared/atoms/Status';
import { TableActions, TableContainer, TableRow, TableRowLabel } from '../../shared/atoms/Table';
import { useApi } from '../../shared/hooks/use-api';
import { useCanvasUserTasks } from '../hooks/use-canvas-user-tasks';
import { useRouteContext } from '../hooks/use-route-context';

export const ReviewerSubmissionOverview: React.FC = () => {
  const { canvasId, projectId } = useRouteContext();
  const { t } = useTranslation();
  const { userTasks, refetch } = useCanvasUserTasks();
  const api = useApi();
  const date = new Date().getTime();

  const [abandonTask, abandonResponse] = useMutation(async (task: CrowdsourcingTask) => {
    if (task.status !== 3 && task.status !== 2 && task.status !== -1) {
      await api.updateTask(task.id, {
        status: -1,
        status_text: t('Abandoned'),
      });
      await refetch();
    }
  });

  if (!userTasks || !userTasks.length || !canvasId || !projectId) {
    return null;
  }

  return (
    <>
      {userTasks && userTasks.length ? (
        <TableContainer>
          {userTasks.map(task => (
            <TableRow key={task.id}>
              <TableRowLabel>
                <Status status={task.status} text={task.status_text} />
              </TableRowLabel>
              <TableRowLabel>{task.name}</TableRowLabel>
              <TableRowLabel>{task.state.changesRequested}</TableRowLabel>
              <TableRowLabel>{task.state.changesRequested}</TableRowLabel>
              <TableRowLabel>
                <strong>
                  {task.modified_at && task.state.warningTime && date - task.modified_at > task.state.warningTime
                    ? t('expires soon')
                    : null}
                </strong>
              </TableRowLabel>
              <TableActions>
                {task.status !== 3 && task.status !== 2 && task.status !== -1 && task.type === 'crowdsourcing-task' ? (
                  <SmallButton disabled={abandonResponse.status === 'loading'} onClick={() => abandonTask(task)}>
                    {t('Abandon')}
                  </SmallButton>
                ) : null}
              </TableActions>
            </TableRow>
          ))}
        </TableContainer>
      ) : null}
    </>
  );
};
