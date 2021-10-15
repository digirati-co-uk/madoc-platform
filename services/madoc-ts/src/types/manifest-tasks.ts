import { CrowdsourcingManifestTask } from '../gateway/tasks/crowdsourcing-manifest-task';
import { CrowdsourcingTask } from '../gateway/tasks/crowdsourcing-task';

export type ProjectManifestTasks = {
  hasExpired?: boolean;
  canClaimManifest?: boolean;
  userManifestTask?: CrowdsourcingTask;
  isManifestComplete?: boolean;
  isManifestInProgress?: boolean;
  manifestTask?: CrowdsourcingTask | CrowdsourcingManifestTask;
  userTasks?: CrowdsourcingTask[];
  totalContributors?: number;
  maxContributors?: number;
  canUserSubmit?: boolean;
  userManifestStats?: { done: number; progress: number };
};
