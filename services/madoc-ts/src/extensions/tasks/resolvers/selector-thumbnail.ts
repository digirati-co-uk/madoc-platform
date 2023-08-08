import { ApiClient } from '../../../gateway/api';
import { BaseTask } from '../../../gateway/tasks/base-task';
import { Resolver } from './resolver';

export type SelectorThumbnail = {
  svg: string;
};

export class SelectorThumbnailResolver implements Resolver<'selectorThumbnail', SelectorThumbnail | null> {
  api: ApiClient;
  constructor(api: ApiClient) {
    this.api = api;
  }

  getKey() {
    return 'selectorThumbnail' as const;
  }

  hasMetadata(task: BaseTask) {
    const metadata = task.metadata;

    if (!task.root_task) {
      return true;
    }

    if (task.type !== 'crowdsourcing-task') {
      return true;
    }

    if (task.status !== 3) {
      return true;
    }

    if (!metadata) {
      return false;
    }

    if (typeof metadata.selectorThumbnail === 'undefined' || metadata.selectorThumbnail === null) {
      return false;
    }

    // Otherwise it should be up-to-date.
    return true;
  }

  async resolve(task: BaseTask) {
    try {
      if (!task.id) {
        return null;
      }

      const resp = await this.api.getProjectSVG('any', task.id);

      if (!resp || resp.empty) {
        return null;
      }

      return {
        svg: resp.svg,
      };
    } catch (e) {
      console.log('error', e);
      return null;
    }
  }
}
