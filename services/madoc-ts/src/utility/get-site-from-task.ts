import { BaseTask } from '../gateway/tasks/base-task';
import { parseUrn } from './parse-urn';

export function getSiteFromTask(task: BaseTask) {
  const ctx = task.context || [];

  for (const contextUrn of ctx) {
    try {
      const { id, type } = parseUrn(contextUrn) || {};
      if (type === 'site') {
        return id;
      }
    } catch (e) {
      //
    }
  }

  return undefined;
}
