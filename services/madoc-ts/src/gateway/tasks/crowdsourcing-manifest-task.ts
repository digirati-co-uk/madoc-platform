import { BaseTask } from './base-task';
import { CrowdsourcingCanvasTask } from './crowdsourcing-canvas-task';
import { CrowdsourcingTask } from './crowdsourcing-task';
import { ApiClient } from '../api';
import { parseUrn } from '../../utility/parse-urn';

export const type = 'crowdsourcing-manifest-task';
/**
 * This task is used to structure the crowdsourcing project subtasks.
 */
export interface CrowdsourcingManifestTask extends BaseTask {
  type: 'crowdsourcing-manifest-task';

  /**
   * Parameters: none
   */
  parameters: [];

  /**
   * Can contain either manifest or collection tasks.
   */
  subtasks?: Array<(CrowdsourcingCanvasTask | CrowdsourcingTask) & { id: string }>;

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
    warningTime?: number;
  };
}

export function createTask({
  label,
  manifestId,
  collectionId,
  maxContributors,
  approvalsRequired,
  warningTime,
  projectId,
}: {
  label: string;
  manifestId: number;
  collectionId?: number;
  maxContributors?: number;
  approvalsRequired?: number;
  warningTime?: number;
  projectId?: number;
}): CrowdsourcingManifestTask {
  return {
    name: label,
    type: 'crowdsourcing-manifest-task',
    subject: `urn:madoc:manifest:${manifestId}`,
    subject_parent: collectionId ? `urn:madoc:collection:${collectionId}` : undefined,
    status_text: 'accepted',
    status: 1,
    state: {
      maxContributors,
      approvalsRequired,
      warningTime,
    },
    parameters: [],
    events: [
      // - Event: onComplete
      //   Description:
      //     When a manifest task is complete, load the parent task. Check how many adjacent manifests are complete versus
      //     Mark the parent task as complete once all resources are also marked as complete.
      'madoc-ts.status.3',
    ],
    context: projectId ? [`urn:madoc:project:${projectId}`] : undefined,
  };
}

export const jobHandler = async (name: string, taskId: string, api: ApiClient) => {
  switch (name) {
    case 'status.3': {
      const task = await api.getTaskById<CrowdsourcingManifestTask>(taskId);
      if (!task.parent_task) return;

      const parent = await api.getTaskById(task.parent_task, true, undefined, undefined, undefined, true);
      if (!parent.subject || !parent.subtasks) return;

      const parsedUrn = parseUrn(parent.subject);
      if (!parsedUrn || parsedUrn.type !== 'collection') return;

      // Structure of the target.
      const collectionStructure = await api.getCollectionStructure(parsedUrn.id);
      const totalItems = collectionStructure.items.length;

      if (parent.subtasks.length < totalItems) return; // Early return.

      const subtaskTargets = parent.subtasks
        .filter(
          t =>
            t.status === 3 && (t.type === 'crowdsourcing-manifest-task' || t.type === 'crowdsourcing-collection-task')
        )
        .map(t => t.subject);

      for (const member of collectionStructure.items) {
        if (
          subtaskTargets.indexOf(`urn:madoc:manifest:${member.id}`) === -1 ||
          subtaskTargets.indexOf(`urn:madoc:collection:${member.id}`) === -1
        ) {
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
