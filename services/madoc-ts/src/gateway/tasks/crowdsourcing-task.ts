import { BaseTask } from './base-task';
import { CaptureModel } from '@capture-models/types';
import { ApiClient } from '../api';
import * as reviewTask from './crowdsourcing-review';
import { CaptureModelSnippet } from '../../types/schemas/capture-model-snippet';
import { CrowdsourcingCanvasTask } from './crowdsourcing-canvas-task';

export const type = 'crowdsourcing-task';

export const status = [
  // 0 - not started
  'not started',
  // 1 - accepted
  'accepted',
  // 2 - in progress
  'in review',
  // 3 - done
  'done',
  // 4+ custom
  // ...
] as const;

type CaptureModelId = string;
type StructureId = string | null;
type SubjectType = string;

/**
 * This is the task that gets assigned directly to a user and represents
 * a
 */
export interface CrowdsourcingTask extends BaseTask {
  type: 'crowdsourcing-task';

  /**
   * Parameters:
   * - Capture model ID
   */
  parameters: [CaptureModelId, StructureId, SubjectType];

  /**
   * Status:
   *
   * -1 - Rejected
   *  0 - Not started
   *  1 - In progress
   *  2 - In review
   *  3 - Accepted
   *  4 - Changes requested.
   */
  status: -1 | 0 | 1 | 2 | 3 | 4;
  state: {
    revisionId?: string;
    reviewTask?: string;
    // Can start adding to this as we need.
    changesRequested?: string | null;
    mergeId?: string;
    warningTime?: number;
  };
}

export function createTask({
  siteId,
  projectId,
  userId,
  name,
  taskName,
  subject,
  parentSubject,
  resourceType,
  captureModel,
  structureId,
  reviewId,
  revisionId,
  warningTime,
}: {
  siteId: number;
  projectId: number;
  userId: number;
  name: string;
  taskName: string;
  subject: string;
  parentSubject?: string;
  resourceType: string;
  captureModel: (CaptureModel | CaptureModelSnippet) & { id: string };
  structureId?: string;
  reviewId?: string;
  revisionId?: string;
  warningTime?: number;
}): CrowdsourcingTask {
  return {
    name: `User contributions to "${taskName}"`,
    type,
    subject,
    parent_subject: parentSubject,
    assignee: {
      id: `urn:madoc:user:${userId}`,
      name,
    },
    status: 0,
    status_text: 'not started',
    state: {
      reviewTask: reviewId,
      revisionId,
      warningTime,
    },
    parameters: [captureModel.id, structureId || null, resourceType],
    events: [
      // When the task is marked as error (remove?)
      'madoc-ts.status.-1',
      // When the task is marked as review - response will be to create a review based on config
      'madoc-ts.status.2',
      // When the task is marked as done
      'madoc-ts.status.3',
    ],
  };
}

export const jobHandler = async (name: string, taskId: string, api: ApiClient) => {
  // If you throw an exception here, the crowdsourcing task will be marked as rejected. Need to be careful.

  switch (name) {
    case 'status.-1': {
      try {
        // When a task is abandoned, we should remove or update the review task.
        const task = await api.getTaskById<CrowdsourcingTask>(taskId);
        const revision = task.state.revisionId;
        if (revision) {
          const revisionRequest = await api.getCaptureModelRevision(revision);
          if (revisionRequest) {
            await api.deleteCaptureModelRevision(revisionRequest);
          }
        }
      } catch (err) {
        // likely error if no revision exists.
      }

      break;
    }
    case 'status.2': {
      try {
        const task = await api.getTaskById<CrowdsourcingTask>(taskId);
        if (task.state && task.state.reviewTask) {
          // If the task has already been reviewed, then mark the review task as having new changes.
          await api.updateTask(task.state.reviewTask, { status: 5, status_text: 'new changes' });
        } else if (task.parent_task) {
          // Check if review exists.
          const existingReviews = await api.getTasks(0, {
            parent_task_id: task.parent_task,
            type: 'crowdsourcing-review',
            status: [0, 1, 2, 4],
          });
          if (existingReviews.tasks.length === 0) {
            // If this is the first review, create the new task.
            const response = await api.addSubtasks(reviewTask.createTask(task), task.parent_task);
            await api.updateTask(task.id, { state: { reviewTask: response.id } });
          } else {
            // We'll just use the first available review.
            const firstExisting = existingReviews.tasks[0];
            const id = firstExisting.id;
            if (id) {
              await api.updateTask(task.id, { state: { reviewTask: firstExisting.id } });

              // And then we update the review status.
              if (firstExisting.status === 1) {
                await api.updateTask(firstExisting.id, { status: 2, status_text: 'New submission' });
              }
            }
          }

          const parent = await api.getTaskById<CrowdsourcingCanvasTask>(task.parent_task);
          if (parent.status !== 3 && parent.status !== 2) {
            await api.updateTask(parent.id, {
              status: 2,
              status_text: `In progress`,
            });
          }
        }
      } catch (err) {
        console.log('error during review', err);
      }
      break;
    }
    case 'status.3': {
      // When a task is marked as done, do we need to update any other tasks? Are there any outstanding review tasks we need to close?
      // Load parent id.
      const task = await api.getTaskById(taskId);
      if (task.parent_task) {
        const parent = await api.getTaskById<CrowdsourcingCanvasTask>(
          task.parent_task,
          true,
          undefined,
          undefined,
          undefined,
          true
        );
        const workingReviews = (parent.subtasks || []).filter(review => {
          return review.type === 'crowdsourcing-review' && review.status !== 3;
        });
        const remaining = (parent.subtasks || []).find(subTask => {
          // Remaining tasks that are not rejected or complete.
          return subTask.type === 'crowdsourcing-task' && subTask.status !== -1 && subTask.status !== 3;
        });
        if (!remaining) {
          // Mark review task as complete.
          await Promise.all(
            workingReviews.map(review => api.updateTask(review.id, { status: 3, status_text: 'All reviews completed' }))
          );
        }
        const approvalsRequired = parent.state.approvalsRequired || 1;
        if (approvalsRequired) {
          const assignees: string[] = [];
          for (const subtask of parent.subtasks || []) {
            if (subtask.type !== 'crowdsourcing-task') continue;
            if (subtask.assignee && assignees.indexOf(subtask.assignee.id) === -1) {
              assignees.push(subtask.assignee.id);
            }
            if (assignees.length >= approvalsRequired) {
              await api.updateTask(parent.id, {
                status: 3,
                status_text: `Complete`,
              });
              break;
            }
          }
        }

        if (parent.status !== 3 && parent.status !== 2) {
          await api.updateTask(parent.id, {
            status: 2,
            status_text: `In progress`,
          });
        }
      }
      break;
    }
  }
};
