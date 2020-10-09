import { sql, ValueExpressionType } from 'slonik';
import { NotFound } from '../errors/not-found';
import { DatabaseTaskType, RouteMiddleware } from '../types';

export const importTasks: RouteMiddleware = async context => {
  const isAdmin = context.state.jwt.scope.indexOf('tasks.admin') !== -1;

  if (!isAdmin) {
    throw new NotFound();
  }

  const clearContext = context.query.clear_context;
  const { tasks } = context.request.body as { tasks: DatabaseTaskType[] };

  const insertTask = (task: DatabaseTaskType) => {
    return sql.join(
      [
        task.id || null,
        task.name || null,
        task.description || null,
        task.type || null,
        task.subject || null,
        (task.status || 0).toString(),
        task.status_text || null,
        JSON.stringify(task.state) || '{}',
        new Date(task.created_at)
          .toISOString()
          .replace('T', ' ')
          .replace('Z', ''),
        task.parent_task || null,
        JSON.stringify(task.parameters) || '[]',
        task.creator_id || null,
        task.creator_name || null,
        task.assignee_id || null,
        task.assignee_is_service || null,
        task.assignee_name || null,
        JSON.stringify(task.context),
        task.events ? sql.array(task.events, 'text') : null,
        new Date(task.modified_at)
          .toISOString()
          .replace('T', ' ')
          .replace('Z', ''),
        task.root_task || null,
        task.subject_parent || null,
      ],
      sql`,`
    );
  };

  const inserts = (rows: ValueExpressionType[]) => {
    // Produces:
    // ( rows[0] ),
    // ( rows[1] ),
    // ...
    // ( rows[n] )
    return sql.join(
      rows.map(row => sql`(${row})`),
      sql`,`
    );
  };

  await context.connection.query(
    sql`
        insert into tasks (id, name, description, type, subject, status, status_text, state, created_at, parent_task,
                           parameters, creator_id, creator_name, assignee_id, assignee_is_service, assignee_name,
                           context, events, modified_at, root_task, subject_parent)
        values ${inserts(tasks.map(insertTask))}
        on conflict (id) do update
            set name=excluded.name,
                description=excluded.description,
                type=excluded.type,
                subject=excluded.subject,
                status=excluded.status,
                status_text=excluded.status_text,
                state=excluded.state,
                created_at=excluded.created_at,
                parent_task=excluded.parent_task,
                parameters=excluded.parameters,
                creator_id=excluded.creator_id,
                creator_name=excluded.creator_name,
                assignee_id=excluded.assignee_id,
                assignee_is_service=excluded.assignee_is_service,
                assignee_name=excluded.assignee_name,
                context=excluded.context,
                events=excluded.events,
                modified_at=excluded.modified_at,
                root_task=excluded.root_task,
                subject_parent=excluded.subject_parent;
    `
  );

  if (clearContext) {
    await context.connection.query(
      sql`delete from tasks where context ?& ${sql.array(
        context.state.jwt.context,
        'text'
      )} and not (id = any (${sql.array(
        tasks.map(task => task.id),
        'uuid'
      )}))`
    );
  }

  context.response.status = 200;
};
