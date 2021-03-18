import { FullSingleTask } from '../schemas/FullSingleTask';

export function mapSingleTask(singleTask: any, subtasks?: any[], fields?: string[]) {
  const {
    id,
    creator_id,
    parent_task,
    assignee_name,
    assignee_id,
    assignee_is_service,
    creator_name,
    events,
    metadata,
    ...args
  } = singleTask;

  return {
    id: id,
    ...args,
    creator: creator_id
      ? {
          id: creator_id,
          name: creator_name,
        }
      : null,
    assignee: assignee_id
      ? {
          id: assignee_id,
          name: assignee_name,
          is_service: assignee_is_service,
        }
      : null,
    parent_task: parent_task,
    events: events,
    metadata: metadata,
    subtasks: subtasks
      ? subtasks.map(task => {
          const subtask: any = {
            id: task.id,
            type: task.type,
            name: task.name,
            status: task.status,
            subject: task.subject,
            status_text: task.status_text,
            state: task.state,
            metadata: task.metadata,
          };

          if (fields) {
            for (const field of fields) {
              if (field === 'assignee') {
                subtask.assignee = task.assignee_id
                  ? {
                      id: task.assignee_id,
                      name: task.assignee_name,
                    }
                  : undefined;
              } else {
                subtask[field] = task[field];
              }
            }
          }

          return subtask;
        })
      : undefined,
  } as FullSingleTask;
}
