import { SiteUser } from '../../extensions/site-manager/types';
import { ApiClient } from '../../gateway/api';
import { BaseTask } from '../../gateway/tasks/base-task';
import { ManualAction, ManualActions } from './ManualActions';
import { TaskAutomation } from './TaskAutomation';

export class BaseAutomation<T = any> implements TaskAutomation, ManualActions {
  user: SiteUser;
  api: ApiClient;
  config: T | null;

  constructor(user: SiteUser, api: ApiClient) {
    if (!user.automated) {
      throw new Error('Cannot automated normal user');
    }

    this.user = user;
    this.api = api;
    this.config = user.config || null;
  }

  async getConfig(): Promise<T | null> {
    throw new Error('Not yet implemented');
  }

  async updateConfig(newConfig: T) {
    throw new Error('Not yet implemented');
  }

  async handleTaskEvent(task: BaseTask, event: string): Promise<void> {
    // no-op by default.
  }

  async getTaskEvents(): Promise<Record<string, string[]>> {
    return {
      // e.g. {
      //   'crowdsourcing-task': ['status.3', 'assigned'],
      // }
    };
  }

  async getManualActions(): Promise<ManualAction[]> {
    return [];
  }

  async handleManualAction(action: string, data?: any) {
    // no-op by default.
  }
}
