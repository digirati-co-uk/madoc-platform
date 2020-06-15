import { BaseTask } from '../../gateway/tasks/base-task';

export interface ProjectTask extends BaseTask {
  type: 'crowdsourcing-project';
  /**
   * Parameters:
   * - Capture model ID
   */
  parameters: [string];

  /**
   * -1 - Error
   *  0 - Not started / paused
   *  1 - Project running
   *  3 - Project complete
   */
  status: -1 | 0 | 1 | 2 | 3 | 4;

  state: {
    // Can start adding to this as we need.
  };
}
