import { BaseTask } from '../../gateway/tasks/base-task';

/**
 * This task is used to structure the crowdsourcing project subtasks.
 */
export interface CrowdsourcingCanvasTask extends BaseTask {
  type: 'crowdsourcing-canvas-task';

  /**
   * Parameters: none
   */
  parameters: [];

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
  };
}
