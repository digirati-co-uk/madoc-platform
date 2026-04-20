import { ImportManifestTask } from '../../../../gateway/tasks/import-manifest';
import React, { useState } from 'react';
import { TableContainer } from '../../../shared/layout/Table';
import { Button } from '../../../shared/navigation/Button';
import { useTranslation } from 'react-i18next';
import { useMutation } from 'react-query';
import { useApi } from '../../../shared/hooks/use-api';
import { CollectionSnippet } from '../../../shared/features/CollectionSnippet';
import { CollapsibleTaskList } from '../../molecules/CollapsibleTaskList';
import { WarningMessage } from '../../../shared/callouts/WarningMessage';

export const CollectionImportTask: React.FC<{ task: ImportManifestTask; statusBar?: React.ReactNode }> = ({
  task,
  statusBar,
}) => {
  const { t } = useTranslation();
  const api = useApi();
  const [taskStatusMap, setTaskStatusMap] = useState<any>({});
  const manifestSubtasks = (task.subtasks || []).filter(subtask => subtask.type === 'madoc-manifest-import');
  const manifestTotal = manifestSubtasks.length || (task.state as any)?.manifestIds?.length || 0;
  const importedTotal = manifestSubtasks.filter(subtask => subtask.status === 3 && subtask.state?.resourceId).length;

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
      <WarningMessage $banner $margin style={{ marginTop: '0.75em' }}>
        <strong>Manifests:</strong> {manifestTotal || 0}· <strong>Imported:</strong> {importedTotal}
      </WarningMessage>
      {statusBar}
      <TableContainer>
        <CollapsibleTaskList tasks={task.subtasks || []} trigger={trigger} taskStatusMap={taskStatusMap} />
      </TableContainer>
    </div>
  );
};
