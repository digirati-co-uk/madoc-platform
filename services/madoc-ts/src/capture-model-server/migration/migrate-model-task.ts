import { ApiClient } from '../../gateway/api';
import { BaseTask } from '../../gateway/tasks/base-task';

export const type = 'migrate-capture-model-task';

export interface MigrateModelTask extends BaseTask {
  type: 'migrate-capture-model-task';

  /**
   * Parameters:
   *   - Model ID
   *   - Site ID
   */
  parameters: [string | null, number];

  status: -1 | 0 | 1 | 2 | 3 | 4;
}

export function createTask(modelId: string, siteId: number): MigrateModelTask {
  return {
    type: 'migrate-capture-model-task',
    name: `Migrate capture model ${modelId}`,
    parameters: [modelId, siteId],
    state: {},
    events: ['madoc-ts.created'],
    subject: `none`,
    status: 0,
    status_text: 'pending',
  };
}

export function createContainerTask(siteId: number): MigrateModelTask {
  return {
    type: 'migrate-capture-model-task',
    name: `Migrating list of capture models`,
    parameters: [null, siteId],
    state: {},
    events: ['madoc-ts.created', 'madoc-ts.subtask_type_status.migrate-capture-model-task.3'],
    subject: `none`,
    status: 0,
    status_text: 'pending',
  };
}

export const jobHandler = async (name: string, taskId: string, api: ApiClient) => {
  switch (name) {
    case 'created': {
      const task = await api.acceptTask<MigrateModelTask>(taskId);
      console.log('Starting task..');
      const [modelId, siteId] = task.parameters;

      console.log('PARAMS ->', modelId, siteId);
      const siteApi = api.asUser({ siteId });
      if (modelId) {
        try {
          // Call migrate API
          await siteApi.request(`/api/madoc/crowdsourcing/model/migrate/${modelId}`, {
            method: 'POST',
          });

          console.log('FINISHED?');

          // Mark as done.
          await api.updateTask(taskId, { status: 3 });

          console.log('MARKED AS DONE');
        } catch (e) {
          await api.updateTask(taskId, { status: -1 });
        }
      }
      break;
    }
    case 'subtask_type_status.migrate-capture-model-task.3': {
      await api.updateTask(taskId, { status: 3 });
      break;
    }
  }
};
