export type BaseTask = {
  id?: string;
  subtasks?: Array<{
    name: string;
    id: string;
    type: string;
    status: number;
    state: any;
    status_text?: string;
    subject: string;
    assignee?: {
      id: string;
      name?: string;
    };
  }>;
  creator?: {
    id: string;
    name: string;
  };
  created_at?: string;
  /**
   * The type of the task, this can be used to filter task when querying.
   */
  type: string;

  /**
   * A human-readable name for your task.
   */
  name: string;

  /**
   * The subject of the task (e.g. a resource or a service)
   */
  subject: string;

  /**
   * The parent of the subject of the task (e.g. a resource or a service)
   */
  subject_parent?: string;

  /**
   * An optional description of the task.
   */
  description?: string;

  /**
   * Modified
   */
  modified_at?: number;

  /**
   * A number representing the status of the task. 0 - not started, 1 - accepted, 2 - in progress, 3 - done, -1 - errored, 4+ custom.
   * @default 0
   */
  status?: number;

  /**
   * Short text to describe the status code.
   */
  status_text?: string;

  /**
   * Root task
   */
  root_task?: string;

  /**
   * Identifier of the tasks parent, which will appear as it's subtask.
   */
  parent_task?: string;

  /**
   * Custom parameters, cannot be changed after creation.
   */
  parameters?: any[];

  /**
   * Custom state, can change during the tasks lifecycle.
   */
  state?: any;

  /**
   * Custom metadata, can change during the tasks lifecycle.
   */
  metadata?: any;

  /**
   * Events that will be dispatched for this task.
   */
  events?: string[];

  /**
   * Optional extended context
   */
  context?: string[];

  /**
   * The user who is assigned to this task.
   */
  assignee?: {
    /**
     * Id of the user
     */
    id: string;
    /**
     * Optional flat to indicate that the assignee is a service, not a user. Can be used to prevent the assignee being
     * changed.
     */
    is_service?: boolean;
    /**
     * Optional name of the user assigned, should be added if known.
     */
    name?: string;
  };
  /**
   * Delegated task
   */
  delegated_task?: string;

  /**
   * Statistics optionally added for root tasks.
   */
  root_statistics?: {
    error: number;
    not_started: number;
    accepted: number;
    progress: number;
    done: number;
  };
};
