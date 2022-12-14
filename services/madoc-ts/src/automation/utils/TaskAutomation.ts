import { BaseTask } from '../../gateway/tasks/base-task';

export interface TaskAutomation {
  handleTaskEvent(task: BaseTask, event: string): Promise<void>;
}
