export type CreateTask = {
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
   * An optional description of the task.
   */
  description?: string;

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
   * Identifier of the tasks parent, which will appear as it's subtask.
   */
  parent_task?: string;

  /**
   * Identifier of the top level root task.
   */
  root_task?: string;

  /**
   * Custom parameters, cannot be changed after creation.
   */
  parameters?: any[];

  /**
   * Custom state, can change during the tasks lifecycle.
   */
  state?: any;

  /**
   * Events that will be dispatched for this task.
   */
  events?: string[];

  /**
   * Additional context for this task
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
};
