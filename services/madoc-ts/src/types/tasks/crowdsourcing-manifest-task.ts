import { BaseTask } from '../../gateway/tasks/base-task';
import { CrowdsourcingCanvasTask } from '../../gateway/tasks/crowdsourcing-canvas-task';
import { CrowdsourcingTask } from './crowdsourcing-task';

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
    totalResources?: number;
  };
}
