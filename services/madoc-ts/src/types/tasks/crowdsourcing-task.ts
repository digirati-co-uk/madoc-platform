import { BaseTask } from '../../gateway/tasks/base-task';

type CaptureModelId = string;
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
   */
  status: -1 | 0 | 1 | 2 | 3 | 4;
  state: {
    revisionId?: string;
    reviewTask?: string;
    // Can start adding to this as we need.
    changesRequested?: string;
  };
}
