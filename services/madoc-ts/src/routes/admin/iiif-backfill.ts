import { sql } from 'slonik';
import { api } from '../../gateway/api.server';
import { createTask, IIIFBackfillTask } from '../../gateway/tasks/backfill-all-iiif-properties';
import { RouteMiddleware } from '../../types/route-middleware';
import { onlyGlobalAdmin } from '../../utility/user-with-scope';
import { systemRedis, IIIF_BACKFILL_LATEST_KEY } from '../../utility/system-redis';

async function latestTask() {
  const stored = await (await systemRedis()).get(IIIF_BACKFILL_LATEST_KEY);
  if (!stored) return;
  const pointer = JSON.parse(stored) as { taskId: string; siteId: number };
  const scoped = api.asUser({ siteId: pointer.siteId }, {}, true);
  try {
    return await scoped.getTask<IIIFBackfillTask>(pointer.taskId);
  } catch (error) {
    if ((error as { status?: number }).status !== 404) throw error;
  } finally {
    scoped.dispose();
  }
}

export const iiifBackfillStatus: RouteMiddleware = async context => {
  await onlyGlobalAdmin(context);
  context.body = { task: await latestTask() };
};

export const startIIIFBackfill: RouteMiddleware = async context => {
  const { siteId, id: userId } = await onlyGlobalAdmin(context);
  const redis = await systemRedis();
  context.body = await context.connection.transaction(async connection => {
    // Serialize starts across server instances and sites, including the task creation request.
    await connection.query(sql`select pg_advisory_xact_lock(1527, 1528)`);
    const previous = await latestTask();
    if (previous && [0, 1, 2].includes(previous.status ?? 0)) return previous;
    const { total, until_id } = await connection.one<{ total: number; until_id: number }>(sql`
      select count(*)::int as total, coalesce(max(id), 0)::int as until_id
      from iiif_derived_resource where resource_type = 'manifest'
    `);
    const scoped = api.asUser({ siteId, userId }, {}, true);
    context.disposableApis.push(scoped);
    const task = await scoped.newTask(createTask(userId, total, until_id));
    await redis.set(IIIF_BACKFILL_LATEST_KEY, JSON.stringify({ taskId: task.id, siteId }));
    return task;
  });
  context.status = 202;
};
