import { FullSingleTask } from '../schemas/FullSingleTask';

export function mapSingleTask(singleTask: any, subtasks?: any[]) {
  const {
    id,
    creator_id,
    parent_task,
    assignee_name,
    assignee_id,
    assignee_is_service,
    creator_name,
    events,
    ...args
  } = singleTask;

  return {
    id: id,
    ...args,
    creator: {
      id: creator_id,
      name: creator_name,
    },
    assignee: assignee_id
      ? {
          id: assignee_id,
          name: assignee_name,
          is_service: assignee_is_service,
        }
      : null,
    parent_task: parent_task,
    events: events,
    subtasks: subtasks
      ? subtasks.map(task => {
          return {
            id: task.id,
            type: task.type,
            name: task.name,
            status: task.status,
            status_text: task.status_text,
            state: task.state,
          };
        })
      : undefined,
  } as FullSingleTask;
}
