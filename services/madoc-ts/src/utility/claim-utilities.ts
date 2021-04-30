import { BaseTask } from '../gateway/tasks/base-task';
import { CrowdsourcingCanvasTask } from '../gateway/tasks/crowdsourcing-canvas-task';
import { CrowdsourcingCollectionTask } from '../gateway/tasks/crowdsourcing-collection-task';
import { CrowdsourcingManifestTask } from '../gateway/tasks/crowdsourcing-manifest-task';
import { CrowdsourcingTask } from '../gateway/tasks/crowdsourcing-task';
import { ProjectFull } from '../types/schemas/project-full';

export function manifestTaskCountsAsContribution(task: BaseTask) {
  return task.type === 'crowdsourcing-task' && task.status !== -1;
}

export function canvasTaskCountsAsContribution(task: BaseTask) {
  return task.type === 'crowdsourcing-task' && task.status !== -1;
}

export function canUserClaimManifest(options: { task: CrowdsourcingManifestTask; config: ProjectFull['config'] }) {
  // Assumptions
  // - User does not already have manifest claim

  if (options.task.type !== 'crowdsourcing-manifest-task') {
    return false;
  }

  if (options.config.claimGranularity !== 'manifest') {
    // This might change.
    return true;
  }

  if (options.config.contributionMode === 'transcription') {
    // Anything specific for transcription mode?
  }

  const maxContributors = options.task.state?.maxContributors || options.config.maxContributionsPerResource;

  // No maximum.
  if (maxContributors === false || typeof maxContributors === 'undefined') {
    return true;
  }

  // Has to be less than the stated maximum
  const subtasks = (options.task.subtasks || []).filter(manifestTaskCountsAsContribution);

  return subtasks.length < maxContributors;
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

export function canUserClaimCanvas(options: {
  parentTask: CrowdsourcingCanvasTask | CrowdsourcingManifestTask | CrowdsourcingCollectionTask;
  manifestClaim?: CrowdsourcingTask | boolean;
  config: ProjectFull['config'];
  userId: number;
  revisionId?: string;
}) {
  const maxContributors = options.parentTask.state?.maxContributors || options.config.maxContributionsPerResource;

  const preventContributionAfterRejection = options.config.modelPageOptions?.preventContributionAfterRejection;
  const preventMultipleUserSubmissionsPerResource =
    options.config.modelPageOptions?.preventMultipleUserSubmissionsPerResource;

  if (preventContributionAfterRejection || preventMultipleUserSubmissionsPerResource) {
    for (const subtask of options.parentTask.subtasks || []) {
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
      }
    }
  }

  // This should have been created before this point.
  if (options.config.claimGranularity === 'manifest' && !options.manifestClaim) {
    return false;
  }

  // No maximum.
  if (maxContributors === false || typeof maxContributors === 'undefined') {
    return true;
  }

  // Has to be less than the stated maximum
  const subtasks = (options.parentTask.subtasks || []).filter(canvasTaskCountsAsContribution);

  return subtasks.length < maxContributors;
}
