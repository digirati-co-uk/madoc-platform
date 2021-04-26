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

  const expiryTime = 24 * 60 * 60 * 1000; // 1 day for now..
  const yesterday = new Date(Date.now() - expiryTime);

  for (const project of runningProjects) {
    const localApi = api.asUser({ siteId: project.site_id });
    const config = await localApi.getProjectConfiguration(project.id as any, `urn:madoc:site:${project.site_id}`);
    if (config.contributionMode !== 'transcription') continue;

    const tasks = await localApi.getTasks(0, {
      type: 'crowdsourcing-task',
      status: [0, 1],
      all: true,
      root_task_id: project.task_id,
      created_date_end: yesterday, // exclude recent entries - this is what will be configurable.
    });

    // 1. Check if they are targeting a manifest.
    // 2. Check if they are assigned.
    // 3. Delete the claims! (if status 1, also check created to see if it's expired)
  }

  // Set the previous date.
  previousFireDate = fireDate;
}
