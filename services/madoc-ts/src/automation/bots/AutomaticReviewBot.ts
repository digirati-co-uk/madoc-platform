import { getValue } from '@iiif/helpers/i18n';
import { SiteUser } from '../../extensions/site-manager/types';
import { ApiClient } from '../../gateway/api';
import { CrowdsourcingReview } from '../../gateway/tasks/crowdsourcing-review';
import { CrowdsourcingTask } from '../../gateway/tasks/crowdsourcing-task';
import { getSiteFromTask } from '../../utility/get-site-from-task';
import { BaseAutomation } from '../utils/BaseAutomation';
import { ManualAction, ManualActions } from '../utils/ManualActions';
import { TaskAutomation } from '../utils/TaskAutomation';

export class AutomaticReviewBot extends BaseAutomation implements ManualActions, TaskAutomation {
  static type = 'automatic-review-bot';

  constructor(user: SiteUser, api: ApiClient) {
    super(AutomaticReviewBot.type, user, api);
  }

  static getTaskEvents(): Record<string, string[]> {
    return {
      'crowdsourcing-review': ['created', 'assigned'],
    };
  }

  async handleTaskEvent(task: CrowdsourcingReview, event: string): Promise<void> {
    if (task.type === 'crowdsourcing-review' && (event === 'created' || event === 'assigned')) {
      await this.autoReviewTask(task);
    }
  }

  static getManualActions(): ManualAction[] {
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
    if (task.status === -1 || task.status === 3 || !task.root_task) {
      return;
    }

    function log(data: string) {
      console.log(`[auto-review] [${task.id}] ${data}`);
    }

    // 1. Load project.
    const { projects } = await this.api.getProjects(0, { root_task_id: task.root_task });
    const project = await this.api.getProject(projects[0].id);
    log(`Detected project "${getValue(project.label)}"`);

    // 2. Check configuration, see if auto-review is enabled.
    const config = project.config;
    if (!config.reviewOptions?.enableAutoReview) {
      log(`Skipping... enableAutoReview is not enabled `);
      return;
    }

    // 3. Get all submissions in review
    const crowdsourcingTasks = await this.api.getTasks<CrowdsourcingTask>(0, {
      all: true,
      parent_task_id: task.parent_task,
      type: 'crowdsourcing-task',
      detail: true,
    });

    const ready = crowdsourcingTasks.tasks.filter(
      t => t.status > 1 && t.status !== 4 && t.status !== 3 && t.state.reviewTask === task.id
    );
    log(`Found ${ready.length} task(s) to approve`);
    for (const item of ready) {
      // 4. Mark each as approved
      log(`Approving [${item.id}] `);

      const revisionId = item.state.revisionId;
      if (!revisionId || !item.id) {
        log(`No revision Id found on task<${item.id}> - skipping...`);
        continue;
      }

      const siteId = getSiteFromTask(task);
      const template = (project as any).template;
      const definition =
        siteId && project && template ? this.api.projectTemplates.getDefinition(template, siteId) : null;

      const acceptedRevision = await this.api.crowdsourcing.getCaptureModelRevision(revisionId);
      await this.api.reviewApproveSubmission({
        revisionRequest: acceptedRevision,
        userTaskId: item.id,
        projectTemplate:
          definition && project
            ? {
                template: definition,
                config: project.template_config,
              }
            : undefined,
      });

      log(`Approved task<${item.id}>`);
    }
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
