import { InternationalString } from '@iiif/presentation-3';
import { ApiClient } from '../../../gateway/api';
import { BaseTask } from '../../../gateway/tasks/base-task';
import { Resolver } from './resolver';

export type ProjectTaskMetadata = {
  slug: string;
  label: InternationalString;
};

export class ProjectResolver implements Resolver<'project', ProjectTaskMetadata | null> {
  api: ApiClient;
  constructor(api: ApiClient) {
    this.api = api;
  }

  getKey() {
    return 'project' as const;
  }

  hasMetadata(task: BaseTask) {
    const metadata = task.metadata;

    if (!task.root_task) {
      return true;
    }

    if (task.type !== 'crowdsourcing-task') {
      return true;
    }

    if (!metadata) {
      return false;
    }

    if (typeof metadata.project === 'undefined') {
      return false;
    }

    // Otherwise it should be up-to-date.
    return true;
  }

  async resolve(task: BaseTask) {
    try {
      if (!task.root_task) {
        return null;
      }

      const project = await this.api.getProjectByTaskId(task.root_task);

      if (project.id === -1) {
        return null;
      }

      return {
        id: project.id,
        slug: project.slug,
        label: project.label,
      };
    } catch (e) {
      console.log('error', e);
      return undefined;
    }
  }
}
