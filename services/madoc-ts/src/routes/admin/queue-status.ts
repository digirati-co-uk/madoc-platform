import { Job, Queue } from 'bullmq';
import { BullMqJobSummary, BullMqSnapshot, BullMqState, BullMqTaskTypeSample } from '../../types/bullmq-status';
import { RouteMiddleware } from '../../types/route-middleware';
import { castBool } from '../../utility/cast-bool';
import { onlyGlobalAdmin } from '../../utility/user-with-scope';

const QUEUE_NAME = 'madoc-ts';
const REDIS_DB = 2;
const DEFAULT_LIMIT = 25;
const MAX_LIMIT = 100;
const COUNT_STATES: BullMqState[] = ['wait', 'active', 'delayed', 'failed', 'paused', 'completed'];

function getNumberQuery(value: string | string[] | undefined, defaultValue: number, min: number, max: number) {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) {
    return defaultValue;
  }
  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) {
    return defaultValue;
  }
  return Math.max(min, Math.min(max, Math.round(parsed)));
}

function getSiteIdFromContext(context: string[]) {
  for (const urn of context) {
    const match = urn.match(/^urn:madoc:site:(\d+)$/);
    if (match) {
      return match[1];
    }
  }
  return null;
}

function getProgress(progress: unknown): number | string | null {
  if (typeof progress === 'number' || typeof progress === 'string') {
    return progress;
  }
  if (progress === null || typeof progress === 'undefined') {
    return null;
  }
  return '[complex]';
}

function truncate(value: unknown, max = 500): string | null {
  if (typeof value !== 'string' || !value) {
    return null;
  }
  return value.length > max ? `${value.slice(0, max)}...` : value;
}

function summarizeJob(job: Job): BullMqJobSummary {
  const data = job.data && typeof job.data === 'object' ? job.data : {};
  const context = Array.isArray((data as any).context)
    ? (data as any).context.filter((ctx: unknown) => typeof ctx === 'string')
    : [];

  return {
    id: typeof job.id === 'undefined' || job.id === null ? 'unknown' : `${job.id}`,
    name: job.name,
    type: typeof (data as any).type === 'string' ? (data as any).type : 'unknown',
    taskId: typeof (data as any).taskId === 'string' ? (data as any).taskId : null,
    attemptsMade: Number(job.attemptsMade || 0),
    attempts: Number(job.opts?.attempts || 0),
    delay: Number(job.delay || 0),
    priority: typeof job.opts?.priority === 'number' ? job.opts.priority : null,
    progress: getProgress(job.progress),
    timestamp: typeof job.timestamp === 'number' ? job.timestamp : null,
    processedOn: typeof job.processedOn === 'number' ? job.processedOn : null,
    finishedOn: typeof job.finishedOn === 'number' ? job.finishedOn : null,
    failedReason: truncate(job.failedReason),
    stacktrace: Array.isArray(job.stacktrace)
      ? job.stacktrace
          .map(line => truncate(line, 350))
          .filter((line): line is string => !!line)
          .slice(0, 3)
      : [],
    dataSummary: {
      keys: Object.keys(data).slice(0, 15),
      context: context.slice(0, 5),
      contextSize: context.length,
      siteId: getSiteIdFromContext(context),
      hasState: typeof (data as any).state !== 'undefined',
    },
  };
}

function getCounts(jobCounts: { [index: string]: number }): Record<BullMqState, number> {
  return {
    wait: Number(jobCounts.wait || 0),
    active: Number(jobCounts.active || 0),
    delayed: Number(jobCounts.delayed || 0),
    failed: Number(jobCounts.failed || 0),
    paused: Number(jobCounts.paused || 0),
    completed: Number(jobCounts.completed || 0),
  };
}

function createEmptySnapshot(limitPerState: number, includeCompleted: boolean): BullMqSnapshot {
  return {
    available: false,
    error: null,
    queue: {
      name: QUEUE_NAME,
      fetchedAt: new Date().toISOString(),
      limitPerState,
      includeCompleted,
      redis: {
        db: REDIS_DB,
        hostConfigured: !!process.env.REDIS_HOST,
      },
    },
    counts: {
      wait: 0,
      active: 0,
      delayed: 0,
      failed: 0,
      paused: 0,
      completed: 0,
    },
    jobs: {
      active: [],
      wait: [],
      delayed: [],
      failed: [],
      paused: [],
      ...(includeCompleted ? { completed: [] } : {}),
    },
    taskTypes: {
      sampledTotal: 0,
      byType: [],
    },
  };
}

export const queueStatus: RouteMiddleware = async context => {
  await onlyGlobalAdmin(context);

  const limit = getNumberQuery(context.query.limit, DEFAULT_LIMIT, 1, MAX_LIMIT);
  const includeCompleted = castBool(context.query.include_completed, false);
  const statesToSample: BullMqState[] = ['active', 'wait', 'delayed', 'failed', 'paused'];

  if (includeCompleted) {
    statesToSample.push('completed');
  }

  let queue: Queue | undefined;

  try {
    const snapshot = createEmptySnapshot(limit, includeCompleted);
    queue = new Queue(QUEUE_NAME, {
      connection: {
        host: process.env.REDIS_HOST,
        db: REDIS_DB,
      },
    });

    const [jobCounts, jobMap] = await Promise.all([
      queue.getJobCounts(...COUNT_STATES),
      Promise.all(
        statesToSample.map(async state => {
          const jobs = await queue.getJobs([state], 0, limit - 1, false);
          return [state, jobs] as const;
        })
      ),
    ]);

    const jobs: Partial<Record<BullMqState, BullMqJobSummary[]>> = {};
    for (const [state, jobList] of jobMap) {
      jobs[state] = jobList.map(summarizeJob);
    }

    const sampledTaskTypes = new Map<string, BullMqTaskTypeSample>();
    let sampledTotal = 0;
    for (const state of statesToSample) {
      for (const job of jobs[state] || []) {
        sampledTotal += 1;
        const current = sampledTaskTypes.get(job.type) || { type: job.type, total: 0, states: {} };
        current.total += 1;
        current.states[state] = (current.states[state] || 0) + 1;
        sampledTaskTypes.set(job.type, current);
      }
    }

    context.response.body = {
      ...snapshot,
      available: true,
      counts: getCounts(jobCounts),
      jobs,
      taskTypes: {
        sampledTotal,
        byType: [...sampledTaskTypes.values()].sort((a, b) => b.total - a.total),
      },
    };
  } catch (error: any) {
    const snapshot = createEmptySnapshot(limit, includeCompleted);
    context.response.body = {
      ...snapshot,
      error: error?.message || 'Unable to retrieve queue status',
    };
  } finally {
    if (queue) {
      await queue.close().catch(() => undefined);
    }
  }
};
