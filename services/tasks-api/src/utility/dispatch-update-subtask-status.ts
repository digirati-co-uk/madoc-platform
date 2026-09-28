import { CreateTask } from '../schemas/CreateTask';
import { DatabasePoolConnectionType, sql } from 'slonik';

export async function dispatchUpdateSubtaskStatus(
  task: Partial<CreateTask>,
  connection: DatabasePoolConnectionType,
  state: any
) {
  if (task.parent_task && task.type && typeof task.status !== 'undefined') {
    // Only need to check if its a subtask.
    // Get count of siblings that DON'T have the same type and status
    // If that count is 0, then load the parent – possibly in the same query.
    // Check if the parent has a matching event – also possibly in the same query.
    // This query will look for
    // - The tasks with the same parent id
    // - Where the parent id listens on the event above
    // - and where the type matches the current task
    // And returns a number of rows relative to the amount of different
    // "status" fields matching the criteria.
    const { rowCount, rows } = await connection.query(sql`
      SELECT t.status as all_status, p.* FROM tasks t
      LEFT JOIN tasks p ON t.parent_task = p.id
      WHERE p.id = ${task.parent_task}
          AND t.type = ${task.type}
      GROUP BY t.status, p.id
    `);
    if (rowCount === 1) {
      const { all_status, ...parentTask } = rows[0];
      state.dispatch(parentTask as any, `subtask_type_status`, `${task.type}.${all_status}`);
    }
  }
}
