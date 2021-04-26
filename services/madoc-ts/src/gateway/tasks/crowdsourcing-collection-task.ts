import { BaseTask } from './base-task';
import { CrowdsourcingManifestTask } from './crowdsourcing-manifest-task';

/**
 * This task is used to structure the crowdsourcing project subtasks.
 */
export interface CrowdsourcingCollectionTask extends BaseTask {
  type: 'crowdsourcing-collection-task';

  /**
   * Parameters: none
   */
  parameters: [];

  /**
   * Can contain either manifest or collection tasks.
   */
  subtasks?: Array<(CrowdsourcingCollectionTask | CrowdsourcingManifestTask) & { id: string }>;

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
  };
}
