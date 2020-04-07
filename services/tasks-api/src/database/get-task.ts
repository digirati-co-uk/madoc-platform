import { DatabasePoolConnectionType, sql } from 'slonik';
import { mapSingleTask } from '../utility/map-single-task';

export async function getTask(
  connection: DatabasePoolConnectionType,
  { id, user, scope, context }: { id: string; scope: string[]; user: { id: string; name: string }; context: string[] }
) {
  if (scope.indexOf('tasks.admin') === -1) {
    const userId = user.id;
    // Not an admin.
    const taskList = await connection.many(
      sql`
        SELECT *
        FROM tasks t 
        WHERE (t.id = ${id} OR t.parent_task = ${id})
        AND (t.creator_id = ${userId} OR t.assignee_id = ${userId})
        AND context ?& ${sql.array(context, 'text')}`
    );

    const actualTask = taskList.find(t => t.id === id);
    const subtasks = taskList.filter(t => t.id !== id);

    return mapSingleTask(actualTask, subtasks);
  }

  const taskList = await connection.many(
    sql`
        SELECT * 
        FROM tasks t
        WHERE (t.id = ${id} OR t.parent_task = ${id})
        AND t.context ?& ${sql.array(context, 'text')}`
  );

  const actualTask = taskList.find(t => t.id === id);
  const subtasks = taskList.filter(t => t.id !== id);

  return mapSingleTask(actualTask, subtasks);
}
