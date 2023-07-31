import { ImportManifestTask } from '../../../../gateway/tasks/import-manifest';
import React from 'react';
import { Button } from '../../../shared/navigation/Button';
import { useTranslation } from 'react-i18next';
import { ManifestSnippet } from '../../../shared/features/ManifestSnippet';
import { GenericTask } from './generic-task';

export const ManifestImportTask: React.FC<{ task: ImportManifestTask; statusBar?: JSX.Element }> = ({
  task,
  statusBar,
}) => {
  const { t } = useTranslation();

  return (
    <GenericTask
      task={task}
      statusBar={statusBar}
      snippet={
        task.state.resourceId ? (
          <ManifestSnippet id={task.state.resourceId} />
        ) : (
          <Button disabled>{t('Waiting for resource')}</Button>
        )
      }
    />
  );
};
