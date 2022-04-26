import { BaseTask } from './base-task';
import { ApiClient } from '../api';
import { CrowdsourcingTask } from './crowdsourcing-task';

export const type = 'crowdsourcing-review';

export const status = [
  // 0 - not started
  'not started',
  // 1 - accepted
  'accepted',
  // 2 - in progress
  'reviewing',
  // 3 - done
  'done',
  // 4+ custom
  'changes requested',
  // ...
] as const;

type TaskSubject = string;
type ResourceType = string;

/**
 * This is the task that gets assigned directly to a user and represents
 * a
 */
export interface CrowdsourcingReview extends BaseTask {
  type: 'crowdsourcing-review';

  /**
   * Parameters:
   * - Capture model ID
   */
  parameters: [TaskSubject, ResourceType];

  /**
   * Status:
   *
   * -1 - Rejected
   *  0 - Not started
   *  1 - In progress
   *  2 - In review
   *  3 - Accepted
   *
   *  4 - changes requested
   *  5 - requested changes submitted
   */
  status: -1 | 0 | 1 | 2 | 3 | 4 | 5;
  state: {
    // Can start adding to this as we need.
    changesRequested?: string;
    internalNotes?: string;
    baseRevisionId?: string;
    currentMerge?: CrowdsourcingReviewMerge | null;
    merges?: Array<CrowdsourcingReviewMergeComplete>;
  };
}

export type CrowdsourcingReviewMerge = {
  revisionId: string; // Original model revision from base
  revisionTaskId: string; // Original task id from base
  mergeId: string; // New merge revision
  toMerge: string[]; // Other user task ids
};

export type CrowdsourcingReviewMergeComplete = CrowdsourcingReviewMerge & {
  status: 'MERGED' | 'DISCARDED';
};

export function createTask(task: CrowdsourcingTask): CrowdsourcingReview {
  if (!task.id) {
    throw new Error('Task to be reviewed requires ID');
  }

  return {
    name: `Review of "${task.name}"`,
    type,
    subject: task.subject,
    subject_parent: task.subject_parent || undefined,
    status: 0,
    status_text: 'not started',
    parameters: [task.id, task.parameters[2]],
    state: {},
    events: ['madoc-ts.created'],
  };
}

export const jobHandler = async (name: string, taskId: string, api: ApiClient) => {
  // If you throw an exception here, the crowdsourcing task will be marked as rejected. Need to be careful.
  switch (name) {
    case 'created': {
      // When review task is created, assign to correct user.
      const task = await api.getTaskById<CrowdsourcingReview>(taskId);
      if (task.root_task) {
        const projects = await api.getProjects(0, { root_task_id: task.root_task });
        if (projects.projects.length) {
          const project = projects.projects[0];
          if (project) {
            try {
              await api.assignUserToReview(project.id, task.id);
            } catch (e) {
              // Only possible when the project is broken (collection removed)
              console.log(e);
            }
          }
        }
      }
      break;
    }

    case 'assigned': {
      const task = await api.getTask<CrowdsourcingReview>(taskId);

      await api.notifications.taskAssignmentNotification('You have been assigned a review', task);

      break;
    }
  }
};
