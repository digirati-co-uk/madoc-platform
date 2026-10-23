import { sql } from 'slonik';
import { config } from '../../config';
import { createPostgresPool } from '../../database/create-postgres-pool';
import { ApiClient } from '../api';
import { BaseTask } from './base-task';
import { restoreIIIFProperties } from './backfill-iiif-properties';
import { systemRedis, IIIF_BACKFILL_LATEST_KEY } from '../../utility/system-redis';

export const type = 'madoc-iiif-properties-backfill-all';

export interface IIIFBackfillTask extends BaseTask {
  parameters: [number];
  state: {
    total: number;
    untilId: number;
    cursor: number;
    processed: number;
    queued: number;
    skipped: number;
    failed: number;
    failures: Array<{ siteId: number; resourceId: number; error: string }>;
    error?: string;
  };
}

export interface BackfillResource {
  id: number;
  site_id: number;
  resource_id: number;
  source: string;
}

export function createTask(userId: number, total: number, untilId: number): IIIFBackfillTask {
  return {
    type,
    name: 'Restore IIIF properties across all sites',
    subject: 'urn:madoc:system:iiif-backfill',
    parameters: [userId],
    events: ['madoc-ts.created'],
    status: 0,
    status_text: 'Pending',
    state: { total, untilId, cursor: 0, processed: 0, queued: 0, skipped: 0, failed: 0, failures: [] },
  };
}

export async function backfillResource(api: ApiClient, resource: BackfillResource, userId: number) {
  if (!/^https?:\/\//i.test(resource.source)) return 'skipped' as const;
  const scoped = api.asUser({ siteId: resource.site_id, userId }, {}, true);
  try {
    await restoreIIIFProperties(scoped, resource.resource_id, resource.source);
    return 'queued' as const;
  } finally {
    scoped.dispose();
  }
}

let postgres: ReturnType<typeof createPostgresPool> | undefined;

export async function jobHandler(name: string, taskId: string, api: ApiClient) {
  if (name !== 'created') return;
  // Generic task creation must not bypass the global-admin-only start endpoint.
  const redis = await systemRedis();
  let authorized = false;
  for (let attempt = 0; attempt < 5; attempt++) {
    const pointer = await redis.get(IIIF_BACKFILL_LATEST_KEY);
    if (pointer && (JSON.parse(pointer) as { taskId: string }).taskId === taskId) {
      authorized = true;
      break;
    }
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  if (!authorized) throw new Error('Bulk backfill must be started by a global administrator from System status');
  const task = await api.acceptTask<IIIFBackfillTask>(taskId);
  if (task.status === 3) return;
  const state = { ...task.state, failures: [...(task.state.failures || [])] };
  postgres ||= createPostgresPool(config.postgres);
  await api.updateTask(taskId, { status: 2, status_text: 'Restoring source properties' });
  while (true) {
    const resources = await postgres.any<BackfillResource>(sql`
      select d.id, d.site_id, d.resource_id, r.source
      from iiif_derived_resource d join iiif_resource r on r.id = d.resource_id
      where d.resource_type = 'manifest' and d.id > ${state.cursor} and d.id <= ${state.untilId}
      order by d.id limit 25
    `);
    if (!resources.length) break;
    for (const resource of resources) {
      try {
        const result = await backfillResource(api, resource, task.parameters[0]);
        state[result]++;
      } catch (error) {
        state.failed++;
        if (state.failures.length < 100)
          state.failures.push({
            siteId: resource.site_id,
            resourceId: resource.resource_id,
            error: error instanceof Error ? error.message : String(error),
          });
      }
      state.processed++;
      state.cursor = resource.id;
      await api.updateTask(taskId, {
        status: 2,
        state,
        status_text: `Restored ${state.processed}/${state.total} manifests; ${state.failed} failed`,
      });
    }
  }
  // Resources removed during the run no longer need restoration.
  state.skipped += Math.max(0, state.total - state.processed);
  state.processed = state.total;
  await api.updateTask(taskId, {
    status: state.failed ? -1 : 3,
    state,
    status_text: `Source restoration finished: ${state.queued} restored, ${state.skipped} skipped, ${state.failed} failed. Annotation downloads queued separately.`,
  });
}
