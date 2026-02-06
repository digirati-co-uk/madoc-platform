import React from 'react';
import { ImportManifestTask } from '../../../../gateway/tasks/import-manifest';
import { ProjectExportSnippet } from '../../components/ProjectExportSnippet/ProjectExportSnippet';
import { GenericTask } from './generic-task';

export function ExportResourceTask({ task, statusBar }: { task: ImportManifestTask; statusBar?: React.ReactNode }) {
  return (
    <GenericTask
      task={task}
      statusBar={statusBar}
      snippet={<ProjectExportSnippet flex task={task as any} apiDownload />}
    />
  );
}
