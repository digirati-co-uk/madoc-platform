export type UpdateTask = {
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
   * Custom state, can change during the tasks lifecycle.
   */
  state?: any;

  /**
   * The user who is assigned to this task.
   */
  assignee?: {
    /**
     * Id of the user
     */
    id: string;
    /**
     * Optional name of the user assigned, should be added if known.
     */
    name?: string;
  };
};
