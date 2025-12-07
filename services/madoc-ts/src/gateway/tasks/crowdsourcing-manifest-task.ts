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
  parameters: [boolean];

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
  isManifestTask,
}: {
  label: string;
  manifestId: number;
  collectionId?: number;
  maxContributors?: number;
  approvalsRequired?: number;
  warningTime?: number;
  projectId?: number;
  isManifestTask?: boolean;
}): CrowdsourcingManifestTask {
  return {
    name: label,
    type: 'crowdsourcing-manifest-task',
    subject: `urn:madoc:manifest:${manifestId}`,
    subject_parent: collectionId ? `urn:madoc:collection:${collectionId}` : undefined,
    status_text: 'not started',
    status: 0,
    state: {
      maxContributors,
      approvalsRequired,
      warningTime,
    },
    parameters: [isManifestTask || false],
    events: [
      // - Event: onComplete
      //   Description:
      //     When a manifest task is complete, load the parent task. Check how many adjacent manifests are complete versus
      //     Mark the parent task as complete once all resources are also marked as complete.
      'madoc-ts.subtask_created',
      'madoc-ts.status.3',
    ],
    context: projectId ? [`urn:madoc:project:${projectId}`] : undefined,
  };
}

export const syncManifestTaskStatus = async (task: CrowdsourcingManifestTask, api: ApiClient) => {
  // We need to check if this is the maximum.
  const maximum = task.state.maxContributors ? Number(task.state.maxContributors) : undefined;

  // To clarify, these are `crowdsourcing-tasks` that are targetting Manifests.
  const validTasks = task.subtasks?.filter(t => {
    return t.type === 'crowdsourcing-task' && t.status !== -1;
  });

  if (task.type !== 'crowdsourcing-manifest-task') {
    return;
  }

  if (maximum && validTasks && task.status !== 3 && task.status !== -1) {
    // We need to sync the tasks status.
    // Move to in progress (i.e. max contributors) when we are at or over the required.
    if (maximum <= validTasks.length && task.status !== 2) {
      // We are over the amount.
      await api.updateTask(task.id, {
        status: 2,
        status_text: 'max contributors',
      });
    }

    // Make sure we are in accepting
    if (maximum > validTasks.length && task.status !== 1) {
      // We are over the amount.
      await api.updateTask(task.id, {
        status: 1,
        status_text: 'accepting contributions',
      });
    }
  }
};

export const jobHandler = async (name: string, taskId: string, api: ApiClient, data: any) => {
  switch (name) {
    case 'subtask_created': {
      // Subtasks of a manifest task can be either:
      // - Crowdsourcing task
      // - Crowdsourcing manifest task.
      const subtaskId = data?.state?.subtaskId;
      if (!subtaskId) {
        break;
      }

      const [task, subtask] = await Promise.all<BaseTask>([
        api.getTask(taskId, { all: true, detail: true, type: 'crowdsourcing-task' }),
        api.getTask(subtaskId),
      ]);

      if (subtask.type === 'crowdsourcing-task') {
        await syncManifestTaskStatus(task as any, api);
      }

      break;
    }
    case 'status.3': {
      const task = await api.getTask<CrowdsourcingManifestTask>(taskId, {
        all: true,
        detail: true,
      });

      // Also - we want to publish to the activity stream.
      try {
        const projects = await api.getProjects(0, { root_task_id: task.root_task });
        if (projects && projects.pagination.totalResults !== 0) {
          const project = await api.getProject(projects.projects[0].id);
          const activityStreams = {
            published: false,
            canvas: false,
            curated: true,
            manifest: true,
            ...(project?.config?.activityStreams || {}),
          };
          const activated = activityStreams.manifest;
          if (task.subject) {
            const parsedUrn = parseUrn(task.subject);
            if (parsedUrn && parsedUrn.type === 'manifest' && activated) {
              await api.submitToManifestFeed(project.slug, parsedUrn.id);
            } else {
              console.log('Stream: invalid subject', task.subject);
            }
          } else {
            console.log('Stream: missing subject');
          }
        } else {
          console.log('Stream: project not found', task.root_task);
        }
      } catch (e) {
        console.log('error adding to stream', e);
        // no-op.
      }

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
