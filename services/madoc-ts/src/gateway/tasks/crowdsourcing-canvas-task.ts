import { BaseTask } from './base-task';
import { ApiClient } from '../api';
import { CrowdsourcingTask } from './crowdsourcing-task';
import { parseUrn } from '../../utility/parse-urn';

export const type = 'crowdsourcing-canvas-task';
/**
 * This task is used to structure the crowdsourcing project subtasks.
 */
export interface CrowdsourcingCanvasTask extends BaseTask {
  type: 'crowdsourcing-canvas-task';

  /**
   * Parameters: none
   */
  parameters: [];

  /**
   * Status:
   *
   * -1 - Error
   *  0 - Not started
   *  1 - In progress
   *  2 - In review
   *  3 - Accepted
   */
  status: -1 | 0 | 1 | 2 | 3;
  state: {
    // Can start adding to this as we need.
    maxContributors?: number;
    approvalsRequired?: number;
  };
}

export function createTask({
  label,
  parentTaskName,
  canvasId,
  maxContributors,
  approvalsRequired,
}: {
  parentTaskName: string;
  label: string;
  canvasId: number;
  maxContributors?: number;
  approvalsRequired?: number;
}): CrowdsourcingCanvasTask {
  return {
    name: `${parentTaskName} - ${label}`,
    type: 'crowdsourcing-canvas-task',
    subject: `urn:madoc:canvas:${canvasId}`,
    status_text: 'accepted',
    status: 1,
    state: {
      maxContributors,
      approvalsRequired,
    },
    parameters: [],
    events: [
      // - Event: onComplete
      //   Description:
      //     When a canvas task is complete, load the parent task. Check how many adjacent canvases are complete versus
      //     the amount of canvases it should have (new API query for resource counts will do the trick!)
      //     Mark the parent task as complete once all resources are also marked as complete.
      'madoc-ts.status.3',
    ],
  };
}

export const jobHandler = async (name: string, taskId: string, api: ApiClient) => {
  switch (name) {
    case 'status.3': {
      const task = await api.getTaskById<CrowdsourcingTask>(taskId);
      if (!task.parent_task) return;

      const parent = await api.getTaskById(task.parent_task, true, undefined, undefined, undefined, true);
      if (!parent.subject || !parent.subtasks) return;

      const parsedUrn = parseUrn(parent.subject);
      if (!parsedUrn || parsedUrn.type !== 'manifest') return;

      // Structure of the target.
      const manifestStructure = await api.getManifestStructure(parsedUrn.id);
      const totalItems = manifestStructure.items.length;

      if (parent.subtasks.length < totalItems) return; // Early return.

      const subtaskTargets = parent.subtasks
        .filter(t => t.status === 3 && t.type === 'crowdsourcing-canvas-task')
        .map(t => t.subject);

      for (const canvas of manifestStructure.items) {
        if (subtaskTargets.indexOf(`urn:madoc:canvas:${canvas.id}`) === -1) {
          return;
        }
      }

      // If we get here, the parent task is complete.
      await api.updateTask(parent.id, {
        status: 3,
        status_text: 'Complete',
      });

      break;
    }
  }
};
