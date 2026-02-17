import { Job, Queue } from 'bullmq';
import { api } from '../../gateway/api.server';
import { BullMqCancelSearchIndexResult } from '../../types/bullmq-status';
import { RouteMiddleware } from '../../types/route-middleware';
import { onlyGlobalAdmin } from '../../utility/user-with-scope';
import { isDeletedTaskError } from '../../queue/task-cancellation';

const QUEUE_NAME = 'madoc-ts';
const REDIS_DB = 2;
const STATES_TO_SCAN = ['wait', 'active', 'delayed', 'paused'] as const;
const SEARCH_INDEX_TASK_TYPE = 'search-index-task';
const FETCH_CHUNK_SIZE = 200;
const MAX_WARNINGS = 25;
const TASK_LIST_PAGE_SIZE = 200;
const MAX_TASK_LIST_PAGES = 100;
const FORCE_REMOVE_KEY_COUNT = 11;
const FORCE_REMOVE_JOB_LUA = `
local jobId = ARGV[1]
local jobKey = ARGV[2] .. jobId
local removed = 0

removed = removed + redis.call("LREM", KEYS[1], 0, jobId)
removed = removed + redis.call("LREM", KEYS[2], 0, jobId)
removed = removed + redis.call("LREM", KEYS[3], 0, jobId)
removed = removed + redis.call("ZREM", KEYS[4], jobId)
removed = removed + redis.call("ZREM", KEYS[5], jobId)
removed = removed + redis.call("ZREM", KEYS[6], jobId)
removed = removed + redis.call("ZREM", KEYS[7], jobId)
removed = removed + redis.call("ZREM", KEYS[8], jobId)
removed = removed + redis.call("ZREM", KEYS[9], jobId)
removed = removed + redis.call("SREM", KEYS[10], jobId)
removed = removed + redis.call("DEL", jobKey, jobKey .. ":logs", jobKey .. ":dependencies", jobKey .. ":processed", jobKey .. ":lock")

if removed > 0 then
  redis.call("XADD", KEYS[11], "*", "event", "removed", "jobId", jobId, "prev", "force")
end

return removed
`;

type RedisEvalClient = {
  eval: (...args: any[]) => Promise<number | string>;
};

function toTaskId(value: unknown): string | null {
  if (typeof value === 'string' || typeof value === 'number') {
    const id = `${value}`.trim();
    return id ? id : null;
  }
  return null;
}

function addWarning(summary: BullMqCancelSearchIndexResult, warning: string) {
  if (summary.warnings.length < MAX_WARNINGS) {
    summary.warnings.push(warning);
  }
}

function getJobTaskType(job: Job): string | null {
  const data = job.data;
  if (!data || typeof data !== 'object') {
    return null;
  }
  return typeof (data as any).type === 'string' ? (data as any).type : null;
}

function getJobTaskId(job: Job): string | null {
  const data = job.data;
  if (!data || typeof data !== 'object') {
    return null;
  }
  return toTaskId((data as any).taskId);
}

async function collectStateJobs(queue: Queue, state: (typeof STATES_TO_SCAN)[number]): Promise<Job[]> {
  let start = 0;
  const allJobs: Job[] = [];

  while (true) {
    const jobs = await queue.getJobs([state], start, start + FETCH_CHUNK_SIZE - 1, false);
    if (!jobs.length) {
      break;
    }

    allJobs.push(...jobs);

    if (jobs.length < FETCH_CHUNK_SIZE) {
      break;
    }

    start += FETCH_CHUNK_SIZE;
  }

  return allJobs;
}

async function collectSearchTaskIdsFromApi(summary: BullMqCancelSearchIndexResult): Promise<string[]> {
  const taskIds = new Set<string>();
  let page = 1;

  while (page <= MAX_TASK_LIST_PAGES) {
    try {
      const response = await api.getTasks<any>(page, {
        all_tasks: true,
        type: SEARCH_INDEX_TASK_TYPE,
        status: [0, 1, 2, 4],
        per_page: TASK_LIST_PAGE_SIZE,
      });

      for (const task of response.tasks || []) {
        const taskId = toTaskId(task?.id);
        if (taskId) {
          taskIds.add(taskId);
        }
      }

      const totalPages = Number(response.pagination?.totalPages || page);
      if (page >= totalPages) {
        break;
      }

      page += 1;
    } catch (error: any) {
      addWarning(summary, `Unable to list search index tasks: ${error?.message || 'unknown error'}`);
      break;
    }
  }

  if (page > MAX_TASK_LIST_PAGES) {
    addWarning(summary, `Task listing stopped after ${MAX_TASK_LIST_PAGES} pages.`);
  }

  return [...taskIds];
}

function getForceRemoveKeys(queue: Queue): string[] {
  return [
    queue.toKey('wait'),
    queue.toKey('paused'),
    queue.toKey('active'),
    queue.toKey('waiting-children'),
    queue.toKey('delayed'),
    queue.toKey('completed'),
    queue.toKey('failed'),
    queue.toKey('priority'),
    queue.toKey('prioritized'),
    queue.toKey('stalled'),
    queue.toKey('events'),
  ];
}

async function forceRemoveJob(
  queue: Queue,
  redisClient: RedisEvalClient | undefined,
  jobId: string,
  summary: BullMqCancelSearchIndexResult
): Promise<boolean> {
  if (!redisClient) {
    return false;
  }

  try {
    const removed = Number(
      await redisClient.eval(
        FORCE_REMOVE_JOB_LUA,
        FORCE_REMOVE_KEY_COUNT,
        ...getForceRemoveKeys(queue),
        jobId,
        queue.toKey('')
      )
    );
    return removed > 0;
  } catch (error: any) {
    addWarning(summary, `Unable to force-remove queue job ${jobId}: ${error?.message || 'unknown error'}`);
    return false;
  }
}

export const cancelSearchIndex: RouteMiddleware = async context => {
  await onlyGlobalAdmin(context);

  const summary: BullMqCancelSearchIndexResult = {
    queueWasPaused: false,
    queuePausedByAction: false,
    queueResumedByAction: false,
    sampledJobs: 0,
    matchedSearchJobs: 0,
    removedJobs: 0,
    lockedOrUnremovableJobs: 0,
    markedTaskCancels: 0,
    markedRootCancels: 0,
    warnings: [],
  };

  const matchedTaskIds = new Set<string>();
  let queue: Queue | undefined;
  let redisClient: RedisEvalClient | undefined;

  try {
    queue = new Queue(QUEUE_NAME, {
      connection: {
        host: process.env.REDIS_HOST,
        db: REDIS_DB,
      },
    });

    summary.queueWasPaused = await queue.isPaused();
    try {
      redisClient = (await queue.client) as RedisEvalClient;
    } catch (error: any) {
      addWarning(summary, `Unable to access queue Redis client: ${error?.message || 'unknown error'}`);
    }

    for (const state of STATES_TO_SCAN) {
      const jobs = await collectStateJobs(queue, state);
      for (const job of jobs) {
        summary.sampledJobs += 1;

        if (getJobTaskType(job) !== SEARCH_INDEX_TASK_TYPE) {
          continue;
        }

        summary.matchedSearchJobs += 1;

        const taskId = getJobTaskId(job);
        if (taskId) {
          matchedTaskIds.add(taskId);
        }

        if (typeof job.id === 'undefined' || job.id === null) {
          summary.lockedOrUnremovableJobs += 1;
          continue;
        }

        const queueJobId = `${job.id}`;
        let removed = false;
        let removeErrorMessage: string | null = null;

        try {
          removed = (await queue!.remove(queueJobId)) === 1;
        } catch (error: any) {
          removeErrorMessage = error?.message || 'unknown error';
        }

        if (!removed) {
          removed = await forceRemoveJob(queue, redisClient, queueJobId, summary);
        }

        if (removed) {
          summary.removedJobs += 1;
        } else {
          if (removeErrorMessage) {
            addWarning(summary, `Unable to remove queue job ${job.id}: ${removeErrorMessage}`);
          }
          summary.lockedOrUnremovableJobs += 1;
        }
      }
    }

    const persistedTaskIds = await collectSearchTaskIdsFromApi(summary);
    for (const taskId of persistedTaskIds) {
      matchedTaskIds.add(taskId);
    }

    let deletedTaskCount = 0;
    for (const taskId of matchedTaskIds) {
      try {
        await api.deleteTask(taskId);
        deletedTaskCount += 1;
      } catch (error: any) {
        if (!isDeletedTaskError(error)) {
          addWarning(summary, `Unable to delete task ${taskId}: ${error?.message || 'unknown error'}`);
        }
      }
    }

    if (deletedTaskCount > 0) {
      addWarning(summary, `Deleted ${deletedTaskCount} search index task records.`);
    }
  } catch (error: any) {
    addWarning(summary, `Cancellation failed: ${error?.message || 'unknown error'}`);
  } finally {
    if (queue) {
      await queue.close().catch(() => undefined);
    }
  }

  context.response.body = summary;
};
