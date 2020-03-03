import { FullSingleTask } from '../schemas/FullSingleTask';

export function mapSingleTask(singleTask: any) {
  const { id, creator_id, parent_task, creator_name, ...args } = singleTask;

  return {
    id: id,
    ...args,
    creator: {
      id: creator_id,
      name: creator_name,
    },
    parent_task: parent_task,
    subtasks: [],
  } as FullSingleTask;
}
