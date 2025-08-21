import { generateId } from '../../frontend/shared/capture-models/helpers/generate-id';
import { CaptureModel } from '../../frontend/shared/capture-models/types/capture-model';
import { findUseManifestTaskFromList } from '../../utility/claim-utilities';
import { parseUrn } from '../../utility/parse-urn';
import { BaseTask } from './base-task';
import { ApiClient } from '../api';
import { CrowdsourcingManifestTask, syncManifestTaskStatus } from './crowdsourcing-manifest-task';
import { CrowdsourcingReview } from './crowdsourcing-review';
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

type CaptureModelId = string | null;
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
    rejectedMessage?: string | null;
    mergeId?: string;
    warningTime?: number;
    userManifestTask?: string | null;
  };
}

async function propogateRejectedCrowdsourcingTask(task: CrowdsourcingTask, api: ApiClient) {
  const assigneeId = task.assignee?.id;

  // Here we check if its a manifest task.
  const subject = parseUrn(task.subject);
  if (subject?.type.toLowerCase() !== 'manifest') {
    // This could indicate its a Canvas task thats been unassigned.
    // We will ignore it, although in the future this could be a good place
    // to check the Capture Model and update it.
    return;
  }

  // Ignore if we don't have a parent or assignee.
  if (!task.parent_task || !assigneeId) return;

  // This is the crowdsourcing-manifest-task
  // const crowdsourcingManifestTask = await api.getTask(task.parent_task, { all: true });
  //
  // This will have a list of crowdsourcing-canvas-task, but we can query them directly I think.
  const crowdsourcingTasks = await api.getTask(task.parent_task, {
    all: true,
    detail: true,
    type: 'crowdsourcing-canvas-task',
  });

  // Also reject reviews.
  if (task.state.reviewTask) {
    await api.updateTask(task.state.reviewTask, { status: -1, status_text: 'rejected' }).catch(() => {
      // Ignore.
    });
  }

  for (const crowdsourcingCanvasTask of crowdsourcingTasks.subtasks || []) {
    // Now the user may have created `crowdsourcing-task` instances.
    // "assignee": {
    //   "id": "urn:madoc:user:404",
    //   "name": "nan lloyd williams",
    //   "is_service": false
    // },
    if (crowdsourcingCanvasTask?.assignee?.id) {
      const crowdsourcingCanvasTaskAssigneeId = crowdsourcingCanvasTask.assignee.id;
      // Now we can compare
      if (crowdsourcingCanvasTaskAssigneeId === assigneeId) {
        // This is a task that the user was assigned to, but since they are rejecting the
        // Manifest task they are also rejecting the canvas ones.
        await api.updateTask(crowdsourcingCanvasTask.id, { status: -1, status_text: 'unassigned ' });

        if (crowdsourcingCanvasTask.state.reviewTask) {
          console.log('REJECTING CANVAS REVIEW TASK', crowdsourcingCanvasTask.state.reviewTask);
          await api
            .updateTask(crowdsourcingCanvasTask.state.reviewTask, { status: -1, status_text: 'rejected' })
            .catch(() => {
              // Ignore.
            });
        }
      }
    }
  }
}

export function createTask({
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
  userManifestTask,
}: {
  projectId: number;
  userId: number;
  name: string;
  taskName: string;
  subject: string;
  parentSubject?: string;
  resourceType: string;
  captureModel?: (CaptureModel | CaptureModelSnippet) & { id: string };
  structureId?: string;
  reviewId?: string;
  revisionId?: string;
  userManifestTask?: string;
  warningTime?: number;
}): CrowdsourcingTask {
  return {
    name: `${name || 'User'}: submission ${taskName}`,
    type,
    subject,
    subject_parent: parentSubject,
    assignee: {
      id: `urn:madoc:user:${userId}`,
      name,
    },
    status: 0,
    status_text: revisionId || reviewId ? 'not started' : 'assigned',
    state: {
      reviewTask: reviewId,
      revisionId,
      warningTime,
      userManifestTask,
    },
    context: projectId ? [`urn:madoc:project:${projectId}`] : undefined,
    parameters: [captureModel ? captureModel.id : null, structureId || null, resourceType],
    delegated_task: reviewId,
    events: [
      // When the task is marked as error (remove?)
      'madoc-ts.status.-1',
      // When the task is marked as review - response will be to create a review based on config
      'madoc-ts.status.2',
      // When the task is marked as done
      'madoc-ts.status.3',
      // Changes requested.
      'madoc-ts.status.4',
    ],
  };
}

export const jobHandler = async (name: string, taskId: string, api: ApiClient) => {
  // If you throw an exception here, the crowdsourcing task will be marked as rejected. Need to be careful.

  switch (name) {
    case 'status.-1': {
      try {
        const task = await api.getTask<CrowdsourcingTask>(taskId);
        const userId = task.assignee?.id;
        const revision = task.state.revisionId;
        if (revision) {
          const revisionRequest = await api.crowdsourcing.getCaptureModelRevision(revision);
          if (revisionRequest) {
            // @todo mark revision _request_ as rejected.
            // await api.deleteCaptureModelRevision(revisionRequest);
            // await api.updateTask(task.id, {
            //   status: -1,
            //   status_text: `rejected`,
            // });
          }
        }
        if (task.parent_task) {
          const parent = await api.getTask(task.parent_task, { detail: true, all: true, type: 'crowdsourcing-task' });
          if (parent.type === 'crowdsourcing-manifest-task') {
            // We have just rejected a manifest task.
            await syncManifestTaskStatus(parent as any, api).catch(err => {
              // Also ignore any errors with sycning.
              console.log(err);
            });
          }
        }

        // Propogate the -1 to canvas tasks.
        await propogateRejectedCrowdsourcingTask(task, api).catch(err => {
          // We will ignore if this errors, since some of the data may be in an undefined
          // state from previous fixes.
          console.log(err);
        });

        if (userId) {
          const user = parseUrn(userId);
          if (user && user.id) {
            const subject = task.metadata?.subject;
            await api.notifications.createNotification({
              id: generateId(),
              title: 'Your submission was rejected.',
              summary: task.name,
              thumbnail: subject?.thumbnail,
              action: {
                id: 'crowdsourcing-task:changes',
                link: `urn:madoc:task:${task.id}`,
              },
              user: user.id,
            });
          }
        }
      } catch (err) {
        // likely error if no revision exists.
      }

      break;
    }
    case 'status.2': {
      try {
        const task = await api.getTask<CrowdsourcingTask>(taskId);

        if (task.root_task && task.subject_parent && task.assignee) {
          const projects = await api.getProjects(0, { root_task_id: task.root_task });
          if (projects.projects.length) {
            const project = projects.projects[0] ? await api.getProject(projects.projects[0].id) : undefined;
            if (project) {
              // We have the ful project here.
              const manifestClaims = project.config.claimGranularity === 'manifest';
              const onlyManifest = project.config.shadow?.showCaptureModelOnManifest || false;

              if (manifestClaims && !onlyManifest) {
                const manifestTasks = await api.getTasks(0, {
                  subject: task.subject_parent,
                  root_task_id: task.root_task,
                  detail: true,
                });
                const realManifestTask = manifestTasks.tasks.find(
                  t => t.status !== -1 && t.type === 'crowdsourcing-manifest-task'
                );
                if (realManifestTask && realManifestTask.id) {
                  // We have a real task.
                  const parsedManifest = parseUrn(realManifestTask.subject);
                  if (parsedManifest) {
                    const manifestStructure = await api.getManifestStructure(parsedManifest.id);
                    const subjects = manifestStructure.items.map(item => `urn:madoc:canvas:${item.id}`);
                    const statuses = await api.getTaskSubjects(task.root_task, subjects, {
                      type: 'crowdsourcing-task',
                      assigned_to: task.assignee.id,
                    });

                    const ids = statuses.subjects
                      .filter(s => s.status === 2 || s.status === 3)
                      .map(s => s.subject)
                      .filter(s => s.startsWith('urn:madoc:canvas:'));

                    const found = manifestStructure.items.find(item => {
                      return ids.indexOf(`urn:madoc:canvas:${item.id}`) === -1;
                    });
                    if (!found) {
                      // The manifest task is done!
                      const userManifestTask = await api.getTasks(0, {
                        parent_task_id: realManifestTask.id,
                        type: 'crowdsourcing-task',
                        subject: realManifestTask.subject,
                        detail: true,
                      });
                      const foundManifestTask = findUseManifestTaskFromList(
                        parsedManifest.id,
                        task.assignee.id,
                        userManifestTask.tasks
                      );
                      if (foundManifestTask) {
                        await api.updateTask(foundManifestTask.id, {
                          status: 2,
                          status_text: 'in review',
                        });
                      } else {
                        console.log('not found manifest task');
                      }
                    } else {
                      console.log('not found manifest iiif');
                    }
                  } else {
                    console.log('parsed manifest not found');
                  }
                } else {
                  console.log('real manifest task not found');
                }
              } else if (onlyManifest) {
                // @todo At this point we are editing a manifest task, maybe?
              } else {
                console.log('manifest claim not valid');
              }
            } else {
              console.log('project not found');
            }
          } else {
            console.log('project not found');
          }
        }

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
            await api.updateTask(task.id, { state: { reviewTask: response.id }, delegated_task: response.id });
          } else {
            // We'll just use the first available review.
            const firstExisting = existingReviews.tasks[0];
            const id = firstExisting.id;
            if (id) {
              await api.updateTask(task.id, {
                state: { reviewTask: firstExisting.id },
                delegated_task: firstExisting.id,
              });

              // And then we update the review status.
              if (firstExisting.status === 1) {
                await api.updateTask(firstExisting.id, { status: 2, status_text: 'New submission' });
              }
            }
          }

          const parent = await api.getTask<CrowdsourcingCanvasTask>(task.parent_task);
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
      const task = await api.getTask(taskId);
      if (task.parent_task) {
        const parent = await api.getTask<CrowdsourcingCanvasTask | CrowdsourcingManifestTask>(task.parent_task, {
          detail: true,
          all: true,
          assignee: true,
        });
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
        if (parent.type === 'crowdsourcing-canvas-task' || parent.type === 'crowdsourcing-manifest-task') {
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
        }

        if (parent.status !== 3 && parent.status !== 2) {
          await api.updateTask(parent.id, {
            status: 2,
            status_text: `In progress`,
          });
        }
      }

      // Notify user
      const userId = task.assignee?.id;
      if (userId) {
        const user = parseUrn(userId);
        if (user && user.id) {
          const subject = task.metadata?.subject;
          await api.notifications.createNotification({
            id: generateId(),
            title: 'Your contribution has been accepted',
            summary: task.name,
            thumbnail: subject?.thumbnail,
            action: {
              id: 'crowdsourcing-task:complete',
              link: `urn:madoc:task:${task.id}`,
            },
            user: user.id,
          });

          const projects = await api.getProjects(0, { root_task_id: task.root_task });
          if (projects.projects.length) {
            const project = projects.projects[0] ? await api.getProject(projects.projects[0].id) : undefined;
            if (project) {
              // Add user to project
              await api.addProjectMember(project.id, user.id);
            }
          }
        }
      }

      // Reindex resource after annotating is complete.
      try {
        const parsed = parseUrn(task.subject);
        if (parsed) {
          switch (parsed.type) {
            case 'canvas':
              await api.indexCanvas(parsed.id);
              break;
            case 'manifest':
              await api.indexManifest(parsed.id);
              break;
          }
        }
      } catch (err) {
        // Non-fatal error here.
        console.log('error while re-indexing', err);
      }

      break;
    }

    case 'status.4': {
      // Changes requested.
      const task = await api.getTask(taskId);
      if (task) {
        const userId = task.assignee?.id;
        if (userId) {
          const user = parseUrn(userId);
          if (user && user.id) {
            const subject = task.metadata?.subject;
            await api.notifications.createNotification({
              id: generateId(),
              title: 'Changes requested on your submission',
              summary: task.name,
              thumbnail: subject?.thumbnail,
              action: {
                id: 'crowdsourcing-task:changes',
                link: `urn:madoc:task:${task.id}`,
              },
              user: user.id,
            });
          }
        }
      }
      break;
    }

    case 'assigned': {
      const task = await api.getTask<CrowdsourcingReview>(taskId);

      let message = 'You have been assigned a task';
      const subject = task.subject ? parseUrn(task.subject) : undefined;
      if (subject && subject.type === 'manifest') {
        message = 'You have been assigned a manifest';
      }
      if (subject && subject.type === 'canvas') {
        message = 'You have been assigned an image';
      }

      await api.notifications.taskAssignmentNotification(message, task);

      break;
    }
  }
};
