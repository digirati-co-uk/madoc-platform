import { sql } from 'slonik';
import { api } from '../gateway/api.server';
import { ApplicationContext } from '../types/application-context';

let previousFireDate: Date;

export async function checkExpiredManifests(context: ApplicationContext, fireDate: Date) {
  console.log('checking expired manifests', { fireDate, previousFireDate });

  // 1. Loop through each project
  const runningProjects = await context.connection.any(sql<{
    id: number;
    task_id: string;
    collection_id: number;
    slug: string;
    site_id: number;
    capture_model_id: string;
    status: number;
  }>`
    select id, task_id, collection_id, slug, site_id, capture_model_id, status from iiif_project where (iiif_project.status = 1 or iiif_project.status = 2)
  `);

  for (const project of runningProjects) {
    const localApi = api.asUser({ siteId: project.site_id });
    const config = await localApi.getProjectConfiguration(project.id as any, `urn:madoc:site:${project.site_id}`);

    const shortExpiryTimeMins = !Number.isNaN(config.shortExpiryTime) ? Number(config.shortExpiryTime) : 10; // configured value or 10 minutes
    const shortTermExpiry = new Date(Date.now() - shortExpiryTimeMins * 60 * 1000);

    const longExpiryTimeMins = !Number.isNaN(config.longExpiryTime) ? Number(config.shortExpiryTime) : 24 * 60; // configured value or 1 day..
    const longTermExpiry = new Date(Date.now() - longExpiryTimeMins * 60 * 1000);

    if (config.contributionMode !== 'transcription') continue;

    const tasks = await localApi.getTasks(0, {
      type: 'crowdsourcing-task',
      status: [0, 1],
      all: true,
      detail: true,
      root_task_id: project.task_id,
    });

    // 1. Check if they are targeting a manifest.
    const manifestTasks = tasks.tasks.filter(task => {
      return task.subject && task.subject.startsWith('urn:madoc:manifest');
    });

    for (const manifestTask of manifestTasks) {
      if (manifestTask.modified_at) {
        const modified = new Date(manifestTask.modified_at);
        if (manifestTask.status === 0 && modified.getTime() < shortTermExpiry.getTime()) {
          console.log('expire short term', manifestTask.subject);
          await localApi.updateTask(manifestTask.id, {
            status: -1,
            status_text: 'expired',
          });
        }
        if (manifestTask.status === 1 && modified.getTime() < longTermExpiry.getTime()) {
          console.log('expire long term', manifestTask.subject);
          await localApi.updateTask(manifestTask.id, {
            status: -1,
            status_text: 'expired',
          });
        }
      }
    }
  }

  // Set the previous date.
  previousFireDate = fireDate;
}
