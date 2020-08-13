import { ImportManifestTask } from '../../../../gateway/tasks/import-manifest';
import React, { useState } from 'react';
import { TableActions, TableContainer, TableRow, TableRowLabel } from '../../../shared/atoms/Table';
import { Status } from '../../../shared/atoms/Status';
import { Button, SmallButton } from '../../../shared/atoms/Button';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useMutation } from 'react-query';
import { useApi } from '../../../shared/hooks/use-api';
import { CollectionSnippet } from '../../../shared/components/CollectionSnippet';

export const CollectionImportTask: React.FC<{ task: ImportManifestTask; statusBar?: JSX.Element }> = ({
  task,
  statusBar,
}) => {
  const { t } = useTranslation();
  const api = useApi();
  const [taskStatusMap, setTaskStatusMap] = useState<any>({});

  const [trigger] = useMutation(async (taskId: string) => {
    setTaskStatusMap((m: any) => {
      return { ...m, [taskId]: true };
    });

    await api.updateTaskStatus(taskId, ['waiting'], 'waiting');
    setTaskStatusMap((m: any) => {
      return { ...m, [taskId]: false };
    });
  });

  return (
    <div>
      <h1>{task.name}</h1>

      {task.state.resourceId ? (
        <CollectionSnippet id={task.state.resourceId} />
      ) : (
        <Button disabled>{t('Waiting for resource')}</Button>
      )}
      {statusBar}
      <TableContainer>
        {(task.subtasks || []).map(subtask => (
          <TableRow key={subtask.id}>
            <TableRowLabel>
              <Status status={subtask.status || 0} text={t(subtask.status_text || 'unknown')} />
            </TableRowLabel>
            <TableRowLabel>
              <Link to={`/tasks/${subtask.id}`}>{subtask.name}</Link>
            </TableRowLabel>
            <TableActions>
              <SmallButton
                onClick={() => (subtask.id ? trigger(subtask.id) : null)}
                disabled={subtask.id ? taskStatusMap[subtask.id] : false}
              >
                Retry
              </SmallButton>
            </TableActions>
          </TableRow>
        ))}
      </TableContainer>
    </div>
  );
};
