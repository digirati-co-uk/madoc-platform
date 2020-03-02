import { FullSingleTask, RouteMiddleware } from '../types';

export const getSingleTask: RouteMiddleware<{ id: string }> = async ({ params, connection, sql, response }) => {
  const singleTask = await connection.one(sql.SingleTask`SELECT * FROM tasks WHERE id = ${params.id}`);

  const { id, creator_id, parent_task, creator_name, ...args } = singleTask;

  response.body = {
    id: id,
    ...args,
    creator: {
      id: creator_id,
      name: creator_name,
    },
    parent_task: parent_task,
    subtasks: [],
  } as FullSingleTask;
};
