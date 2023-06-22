import { BaseTask } from '../gateway/tasks/base-task';
import { CrowdsourcingCanvasTask } from '../gateway/tasks/crowdsourcing-canvas-task';
import { CrowdsourcingCollectionTask } from '../gateway/tasks/crowdsourcing-collection-task';
import { CrowdsourcingManifestTask } from '../gateway/tasks/crowdsourcing-manifest-task';
import { CrowdsourcingTask } from '../gateway/tasks/crowdsourcing-task';
import { ProjectFull } from '../types/project-full';

export function resourceTaskCountsAsContribution(task: BaseTask) {
  return task.type === 'crowdsourcing-task' && task.status !== -1;
}
export function canUserClaimResource(options: {
  task: CrowdsourcingCanvasTask | CrowdsourcingManifestTask | CrowdsourcingCollectionTask;
  manifestClaim?: CrowdsourcingTask | boolean;
  config: ProjectFull['config'];
  userId: number;
  revisionId?: string;
}) {
  // Assumptions
  // - User does not already have manifest claim
  // - User has permission to claim

  if (options.config.claimGranularity === 'manifest' && !options.manifestClaim) {
    return false;
  }

  const maxContributors = options.task.state?.maxContributors || options.config.maxContributionsPerResource;

  const preventContributionAfterRejection = options.config.modelPageOptions?.preventContributionAfterRejection;
  const preventMultipleUserSubmissionsPerResource =
    options.config.modelPageOptions?.preventMultipleUserSubmissionsPerResource;

  // check if max submissions or has been rejected
  let hasUserAlreadyClaimed = false;
  if (preventMultipleUserSubmissionsPerResource || preventContributionAfterRejection) {
    for (const subtask of options.task.subtasks || []) {
      if (
        subtask.type === 'crowdsourcing-task' &&
        subtask.assignee &&
        subtask.assignee.id === `urn:madoc:user:${options.userId}`
      ) {
        if (preventContributionAfterRejection && subtask.status === -1) {
          return false;
        }

        if (
          preventMultipleUserSubmissionsPerResource &&
          (subtask.status === 2 || subtask.status === 3) &&
          options.revisionId !== subtask?.state?.revisionId
        ) {
          return false;
        }

        hasUserAlreadyClaimed = true;
      }
    }
  }

  // No maximum.
  if (maxContributors === false || typeof maxContributors === 'undefined') {
    return true;
  }
  if (hasUserAlreadyClaimed) {
    return true;
  }
  const subtasks = (options.task.subtasks || []).filter(resourceTaskCountsAsContribution);

  // check unique contributors
  const users: string[] = [];
  for (const task of subtasks) {
    if (task.assignee) {
      if (!users.includes(task.assignee.id)) {
        users.push(task.assignee.id);
      }
    }
  }

  return users.length < maxContributors;
}

export function findUseManifestTaskFromList(manifestId: number | string, userId: number | string, tasks: BaseTask[]) {
  if (tasks.length === 0) {
    return undefined;
  }

  const foundActive = tasks.find(task => {
    return (
      task.type === 'crowdsourcing-task' &&
      task.subject === (typeof manifestId === 'string' ? manifestId : `urn:madoc:manifest:${manifestId}`) &&
      task.assignee &&
      task.assignee.id === (typeof userId === 'string' ? userId : `urn:madoc:user:${userId}`) &&
      task.status !== -1
    );
  });

  if (foundActive) {
    return foundActive;
  }

  return tasks.find(task => {
    return (
      task.type === 'crowdsourcing-task' &&
      task.subject === (typeof manifestId === 'string' ? manifestId : `urn:madoc:manifest:${manifestId}`) &&
      task.assignee &&
      task.assignee.id === (typeof userId === 'string' ? userId : `urn:madoc:user:${userId}`)
    );
  });
}

export function findUserManifestTask(manifestId: number | string, userId: number, parent?: BaseTask) {
  if (!parent || !parent.subtasks) {
    return undefined;
  }

  return findUseManifestTaskFromList(manifestId, userId, parent.subtasks);
}
