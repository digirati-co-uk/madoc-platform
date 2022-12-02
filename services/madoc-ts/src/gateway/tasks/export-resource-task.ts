import { ExportResourceRequest } from '../../extensions/project-export/types';
import { ApiClient } from '../api';
import { BaseTask } from './base-task';

export const type = 'export-resource-task';

export const status = [
  // 0 - not started
  'requested',
  // 1 - accepted
  'export scheduled',
  // 2 - in progress
  'export running',
  // 3 - done
  'success',
] as const;

export interface ExportResourceTask extends BaseTask {
  type: 'export-resource-task';
  parameters: [ExportResourceRequest, { siteId: number; userId: number }];
  status: -1 | 0 | 1 | 2 | 3;
  state: {
    output?: any;
    didError?: boolean;
    errorMessage?: string;
  };
}

export function createTask(
  request: ExportResourceRequest,
  userId: number,
  siteId: number,
  // Other Misc
  {
    label,
    summary,
  }: {
    label?: string;
    summary?: string;
  } = {}
): ExportResourceTask {
  const subject = `urn:madoc:${request.subject.type}:${request.subject.id}`;
  const subject_parent = request.subjectParent
    ? `urn:madoc:${request.subjectParent.type}:${request.subjectParent.id}`
    : 'none';

  return {
    name: label || `Export task`,
    description: summary || '',
    type,
    subject,
    subject_parent,
    status: 0,
    status_text: status[0],
    parameters: [
      request,
      {
        userId: userId,
        siteId: siteId,
      },
    ],
    state: {},
    events: [
      // To set up the export.
      'madoc-ts.created',

      // For sub-tasks.
      'madoc-ts.subtask_type_status.export-resource-task.3',

      // When it's complete
      'madoc-ts.status.3',
    ],
  };
}

export const jobHandler = async (name: string, taskId: string, api: ApiClient) => {
  switch (name) {
    case 'created': {
      const task = await api.getTask<ExportResourceTask>(taskId, { detail: true });
      const [request, { siteId }] = task.parameters;
      if (siteId) {
        const siteApi = api.asUser({ siteId });
        // @todo do something...
      }

      return;
    }
    case 'status.3': {
      const task = await api.getTask<ExportResourceTask>(taskId);
      const [request, { siteId }] = task.parameters;
      if (siteId) {
        const siteApi = api.asUser({ siteId });

        // @todo compile all things!
        // Notify that export complete.
        // await siteApi.notifications.taskAssignmentNotification('You have been assigned a task', task);
      }

      break;
    }
  }
};
