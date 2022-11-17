import { CrowdsourcingReview } from '../../gateway/tasks/crowdsourcing-review';
import { BaseAutomation } from '../utils/BaseAutomation';
import { ManualAction, ManualActions } from '../utils/ManualActions';
import { TaskAutomation } from '../utils/TaskAutomation';

export class AutomaticReviewBot extends BaseAutomation implements ManualActions, TaskAutomation {
  async getTaskEvents(): Promise<Record<string, string[]>> {
    return {
      'crowdsourcing-review': ['created', 'assigned'],
    };
  }

  async handleTaskEvent(task: CrowdsourcingReview, event: string): Promise<void> {
    if (task.type === 'crowdsourcing-review' && (event === 'created' || event === 'assigned')) {
      await this.autoReviewTask(task);
    }
  }

  async getManualActions(): Promise<ManualAction[]> {
    return [
      {
        label: 'Review all assigned',
        action: 'review-all-assigned',
      },
    ];
  }

  async handleManualAction(action: 'review-all-assigned', data?: any) {
    switch (action) {
      case 'review-all-assigned':
        return this.reviewAllAssigned();
    }
  }

  async autoReviewTask(task: CrowdsourcingReview) {
    if (task.status === -1 || task.status === 3) {
      return;
    }

    // 1. Load project.
    // 2. Check configuration, see if auto-review is enabled.
    // 3. Get all submissions in review
    // 4. Mark each as approved
    // 5. Mark the review as done (or is this automatic?)
  }

  async reviewAllAssigned() {
    const userId = `urn:madoc:user:${this.user.id}`;

    // 1. Find all tasks assigned to the user
    const all = await this.api.getTasks<CrowdsourcingReview>(0, {
      all: true,
      all_tasks: true,
      assignee: userId,
      type: 'crowdsourcing-review',
      status: [0, 1, 2],
    });

    // 2. manually trigger "handleTaskEvent"
    for (const task of all.tasks) {
      await this.autoReviewTask(task);
    }
  }
}
