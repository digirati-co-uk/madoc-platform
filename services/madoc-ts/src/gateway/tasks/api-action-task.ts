import { ApiClient } from '../api';
import { apiDefinitionIndex } from '../api-definitions/_index';
import { ApiRequest } from '../api-definitions/_meta';
import { BaseTask } from './base-task';

export const type = 'madoc-api-action-task';

export const status = [
  // 0 - not started
  'requested',
  // 1 - accepted
  'action scheduled',
  // 2 - in progress
  'action running',
  // 3 - done
  'success',
] as const;

export interface GenericApiTaskDefinition<Body = any, Params = any> {
  request: ApiRequest<any, any>;
  userId: number;
  siteId: number;
}

export interface ApiActionTask<Body = any, Params = any> extends BaseTask {
  type: 'madoc-api-action-task';
  parameters: [GenericApiTaskDefinition<Body, Params>];
  status: -1 | 0 | 1 | 2 | 3;
  state: {
    rejectionMessage?: string;
    didError?: boolean;
    errorMessage?: string;
  };
}

export function createTask(
  request: ApiRequest<any, any>,
  userId: number,
  siteId: number,
  subject?: string,
  summary?: string
): ApiActionTask {
  const definition = apiDefinitionIndex[request.id];
  if (!definition) {
    throw new Error('Invalid definition');
  }

  // @todo It would be nice to do more validation, but that would involve bundling ajv.
  //   It will still be validated before being run.

  return {
    name: definition.name,
    description: summary || definition.description.join(''),
    type,
    subject: subject || 'none',
    status: 0,
    status_text: status[0],
    parameters: [
      {
        request,
        userId: userId,
        siteId: siteId,
      },
    ],
    state: {},
    events: ['madoc-ts.created'],
  };
}

// @todo When created, we could in future assign to either admin or reviewer based on scope required.
//   For now always assign to admin.

export const jobHandler = async (name: string, taskId: string, api: ApiClient) => {
  switch (name) {
    case 'created': {
      const task = await api.getTask<ApiActionTask>(taskId, { detail: true });
      const [{ siteId }] = task.parameters;
      // @todo Find all admins and assign to random admin.
      if (!task.assignee && siteId) {
        try {
          const siteApi = api.asUser({ siteId });
          await siteApi.assignDelegatedRequest(task.id);
        } catch (e) {
          //...
        }
      }

      break;
    }
    case 'assigned': {
      const task = await api.getTask<ApiActionTask>(taskId);
      const [{ siteId }] = task.parameters;
      if (siteId) {
        const siteApi = api.asUser({ siteId });
        await siteApi.notifications.taskAssignmentNotification('You have been assigned a task', task);
      }

      break;
    }
  }
};
