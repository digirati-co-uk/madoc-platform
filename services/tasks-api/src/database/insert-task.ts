import { DatabasePoolConnectionType, sql } from 'slonik';
import { CreateTask } from '../schemas/CreateTask';

export function insertTask(
  connection: DatabasePoolConnectionType,
  { id, task, user }: { id: string; task: CreateTask; user: { id: string; name: string } }
) {
  return connection.query(
    sql`INSERT INTO tasks (
       id, 
       name, 
       description, 
       type, 
       subject, 
       status, 
       state, 
       parent_task, 
       parameters, 
       creator_id, 
       creator_name, 
       assignee_id, 
       assignee_name, 
       status_text
    ) VALUES (
      ${id},
      ${task.name},
      ${task.description || ''},
      ${task.type},
      ${task.subject},
      ${(task.status || 0).toString()},
      ${JSON.stringify(task.state) || '{}'},
      ${task.parent_task || null},
      ${JSON.stringify(task.parameters) || '[]'},
      ${user.id},
      ${user.name},
      ${task.assignee ? task.assignee.id : null},
      ${task.assignee ? task.assignee.name || null : null},
      ${task.status_text || 'no status'}
    )`
  );
}
