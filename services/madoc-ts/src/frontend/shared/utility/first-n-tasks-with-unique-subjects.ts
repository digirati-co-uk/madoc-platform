import { BaseTask } from '../../../gateway/tasks/base-task';

export function firstNTasksWithUniqueSubjects(tasks: BaseTask[], count: number) {
  const toReturn: BaseTask[] = [];
  const subjects: string[] = [];
  for (const task of tasks) {
    if (subjects.indexOf(task.subject) !== -1) {
      continue;
    }

    subjects.push(task.subject);
    toReturn.push(task);

    if (toReturn.length === count) {
      return toReturn;
    }
  }

  return toReturn;
}
