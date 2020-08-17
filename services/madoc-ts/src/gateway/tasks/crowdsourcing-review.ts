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
  parameters: [TaskSubject];

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
    currentMerge?: {
      revisionId: string;
      mergeId: string;
      toMerge: string[];
    };
  };
}

export function createTask(task: CrowdsourcingTask): CrowdsourcingReview {
  if (!task.id) {
    throw new Error('Task to be reviewed requires ID');
  }

  return {
    name: `Review of "${task.name}"`,
    type,
    subject: task.subject,
    status: 0,
    status_text: 'not started',
    parameters: [task.id],
    state: {

    },
    events: [
      'madoc-ts.created',
      // When a review is rejected.
      'madoc-ts.status.-1',
      // When a review is approved.
      'madoc-ts.status.3',
      // When a review requests changes
      'madoc-ts.status.4',
      // When a review requests changes
      'madoc-ts.status.5',
    ],
  };
}

export const jobHandler = async (name: string, taskId: string, api: ApiClient) => {
  // If you throw an exception here, the crowdsourcing task will be marked as rejected. Need to be careful.
  switch (name) {
    case 'created':
      // @todo what is the strategy for assigning to a reviewer:
      //    - Check if reviewer is assigned to parent task?
      //    - Check if "random" site setting assigned
      //    - Check if project has default reviewer
      //    - Fallback to admin?
      console.log('Review task was created, find a user to assign it to.');
      break;
    case 'status.-1': {
      const task = await api.getTaskById<CrowdsourcingReview>(taskId);
      const subjectTaskId = task.parameters[0];
      const subTask = await api.getTaskById(subjectTaskId);
      if (subTask.status !== -1) {
        await api.updateTask(subjectTaskId, { status: -1, status_text: task.status_text });
      }
      break;
    }
    case 'status.3': {
      const task = await api.getTaskById<CrowdsourcingReview>(taskId);
      const subjectTaskId = task.parameters[0];
      const subTask = await api.getTaskById(subjectTaskId);
      if (subTask.status !== 3) {
        await api.updateTask(subjectTaskId, { status: 3, status_text: 'accepted' });
      }
      break;
    }
    case 'status.4': {
      // @todo sync up the change request into state.
      const task = await api.getTaskById<CrowdsourcingReview>(taskId);
      const subjectTaskId = task.parameters[0];
      const subTask = await api.getTaskById<CrowdsourcingTask>(subjectTaskId);
      if (subTask.status !== 4) {
        await api.updateTask(subjectTaskId, {
          status: 4,
          status_text: 'changes requested',
          state: {
            changesRequested: task.state.changesRequested,
          },
        });
      }
      break;
    }
    case 'status.5':
      // on status moved to 5, move the target task to 5 (requested changes submitted by user)
      console.log('changes from user accepted.', taskId, name);
      break;
  }
};
