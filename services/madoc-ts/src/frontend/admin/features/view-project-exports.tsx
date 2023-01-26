import React from 'react';
import { useParams } from 'react-router';
import { apiHooks } from '../../shared/hooks/use-api-query';
import { Button, ButtonRow } from '../../shared/navigation/Button';
import { HrefLink } from '../../shared/utility/href-link';
import { ProjectExportSnippet } from '../components/ProjectExportSnippet/ProjectExportSnippet';

export function ViewProjectExports() {
  const { id } = useParams<{ id: string }>();

  const { data } = apiHooks.getTasks(() => [
    0,
    { all: true, type: 'export-resource-task', subject: `urn:madoc:project:${id}`, detail: true },
  ]);

  return (
    <div>
      <h4>Project exports</h4>
      {(data?.tasks || []).map(task => (
        <ProjectExportSnippet key={task.id} taskLink={`/tasks/${task.id}`} task={task as any} apiDownload flex />
      ))}
      <ButtonRow>
        <Button $primary as={HrefLink} href={`export`}>
          Create new export
        </Button>
      </ButtonRow>
    </div>
  );
}
