import { DatabasePoolConnectionType, sql } from 'slonik';
import { CreateTask } from '../schemas/CreateTask';

export function insertTask(
  connection: DatabasePoolConnectionType,
  { id, task, user, context }: { id: string; task: CreateTask; user: { id: string; name: string }; context: string[] }
) {
  return connection.one<any>(
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
       assignee_is_service,
       status_text,
       context,
       events,
       queue_id
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
      ${task.assignee ? task.assignee.is_service || false : false},
      ${task.status_text || 'no status'},
      ${JSON.stringify(context)},
      ${task.events ? sql.array(task.events, 'text') : null},
      ${task.queue_id || null}
    ) RETURNING  *`
  );
}
