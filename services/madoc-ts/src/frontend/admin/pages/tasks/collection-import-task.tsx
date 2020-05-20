import { ImportManifestTask } from '../../../../gateway/tasks/import-manifest';
import React, { useState } from 'react';
import { TableActions, TableContainer, TableRow, TableRowLabel } from '../../atoms/Table';
import { Status } from '../../atoms/Status';
import { Button, TinyButton } from '../../atoms/Button';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useMutation } from 'react-query';
import { useApi } from '../../hooks/use-api';

export const CollectionImportTask: React.FC<{ task: ImportManifestTask }> = ({ task }) => {
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
        <Button as={Link} to={`/collections/${task.state.resourceId}`}>
          {t('Go to resource')}
        </Button>
      ) : (
        <Button disabled>{t('Waiting for resource')}</Button>
      )}
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
              <TinyButton
                onClick={() => (subtask.id ? trigger(subtask.id) : null)}
                disabled={subtask.id ? taskStatusMap[subtask.id] : false}
              >
                Retry
              </TinyButton>
            </TableActions>
          </TableRow>
        ))}
      </TableContainer>
    </div>
  );
};
