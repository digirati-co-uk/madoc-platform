import { generateId } from '@capture-models/helpers';
import { stringify } from 'query-string';
import { ApiClient } from '../../gateway/api';
import { BaseTask } from '../../gateway/tasks/base-task';
import { NotificationList, NotificationRequest } from '../../types/notifications';
import { parseUrn } from '../../utility/parse-urn';
import { BaseExtension, defaultDispose } from '../extension-manager';

export class NotificationExtension implements BaseExtension {
  api: ApiClient;

  constructor(api: ApiClient) {
    this.api = api;
  }

  /**
   * NOTE: This extension is run in "light" mode, and cannot have side effects.
   */
  dispose() {
    defaultDispose(this);
  }

  getAllNotifications(page = 0) {
    return this.api.request<NotificationList>(`/api/madoc/notifications?${stringify({ page })}`);
  }

  getNotificationCount() {
    return this.api.request<{ unread: number }>(`/api/madoc/notifications/count`);
  }

  readNotification(id: string) {
    return this.api.request(`/api/madoc/notifications/${id}/read`, {
      method: 'POST',
    });
  }

  createNotification(req: NotificationRequest) {
    try {
      return this.api.request(`/api/madoc/notifications`, {
        method: 'POST',
        body: req,
      });
    } catch (e) {
      // Silent fail.
    }
  }

  async taskAssignmentNotification(message: string, task: BaseTask) {
    if (task.assignee && task.assignee.id) {
      const user = parseUrn(task.assignee.id);
      if (user && user.id) {
        if (task.id && this.api.tasks.requiresUpdate(task)) {
          const newMetadata = await this.api.tasks.remoteMetadata(task, false);
          task = await this.api.tasks.updateTaskMetadata(task.id, newMetadata);
        }

        const subject = task.metadata?.subject;
        await this.createNotification({
          id: generateId(),
          title: message,
          summary: task.name,
          thumbnail: subject?.thumbnail,
          action: {
            id: 'task:assign',
            link: `urn:madoc:task:${task.id}`,
          },
          user: user.id,
          tags: [task.type],
        });
      }
    }
  }

  clearNotification(id: string) {
    return this.api.request(`/api/madoc/notifications/${id}`, {
      method: 'DELETE',
    });
  }

  readAllNotifications() {
    return this.api.request(`/api/madoc/notifications/read-all`, {
      method: 'POST',
    });
  }

  clearAllNotifications() {
    return this.api.request(`/api/madoc/notifications/clear-all`, {
      method: 'POST',
    });
  }
}
