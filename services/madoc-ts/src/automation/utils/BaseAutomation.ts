import { SiteUser } from '../../extensions/site-manager/types';
import { ApiClient } from '../../gateway/api';
import { BaseTask } from '../../gateway/tasks/base-task';
import { ManualAction, ManualActions } from './ManualActions';
import { TaskAutomation } from './TaskAutomation';

export class BaseAutomation<T = any> implements TaskAutomation, ManualActions {
  user: SiteUser;
  api: ApiClient;
  config: T | null;

  constructor(type: string, user: SiteUser, api: ApiClient) {
    if (!type) {
      throw new Error('Invalid automation');
    }
    if (!user.automated) {
      throw new Error('Cannot automated normal user');
    }

    this.user = user;
    this.api = api;

    const config = user.config || {};
    this.config = config[type] || null;
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

  static getTaskEvents(): Record<string, string[]> {
    return {
      // e.g. {
      //   'crowdsourcing-task': ['status.3', 'assigned'],
      // }
    };
  }

  static getManualActions(): ManualAction[] {
    return [];
  }

  async handleManualAction(action: string, data?: any) {
    // no-op by default.
  }
}
