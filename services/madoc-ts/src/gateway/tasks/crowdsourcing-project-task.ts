import { BaseTask } from './base-task';

export interface CrowdsourcingProjectTask extends BaseTask {
  type: 'crowdsourcing-project';
  /**
   * Parameters:
   * - Capture model ID
   * - Project template
   */
  parameters: [string, string?];

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
