import { ImportManifestTask } from '../../../../gateway/tasks/import-manifest';
import React, { useState } from 'react';
import { TableContainer } from '../../../shared/layout/Table';
import { Button } from '../../../shared/navigation/Button';
import { useTranslation } from 'react-i18next';
import { useMutation } from 'react-query';
import { useApi } from '../../../shared/hooks/use-api';
import { CollectionSnippet } from '../../../shared/components/CollectionSnippet';
import { CollapsibleTaskList } from '../../molecules/CollapsibleTaskList';

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
        <CollapsibleTaskList tasks={task.subtasks || []} trigger={trigger} taskStatusMap={taskStatusMap} />
      </TableContainer>
    </div>
  );
};
