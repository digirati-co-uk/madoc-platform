import { BaseTask } from '../../../gateway/tasks/base-task';

export interface Resolver<Key, T> {
  getKey(): Key;

  hasMetadata(task: BaseTask): boolean;

  resolve(task: BaseTask): Promise<T | undefined>;
}
