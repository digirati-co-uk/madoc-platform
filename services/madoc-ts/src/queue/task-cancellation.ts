export const QUEUE_CANCEL_TTL_SECONDS = 60 * 60 * 24;

const TASK_KEY_PREFIX = 'madoc-ts:cancelled-task';
const ROOT_KEY_PREFIX = 'madoc-ts:cancelled-root-task';
const DELETED_TOKENS = ['delete', 'deleted', 'cancel', 'cancelled', 'canceled'];

type RedisLike = {
  get: (key: string) => Promise<string | null>;
  set: (
    key: string,
    value: string,
    mode: 'EX',
    duration: number,
    condition: 'NX'
  ) => Promise<'OK' | null | unknown>;
};

function toTaskId(value: unknown): string | null {
  if (typeof value === 'string' || typeof value === 'number') {
    const id = `${value}`.trim();
    return id ? id : null;
  }
  return null;
}

function normalizeText(value: unknown): string {
  return typeof value === 'string' ? value.toLowerCase() : '';
}

function containsDeletedToken(value: unknown): boolean {
  const text = normalizeText(value);
  if (!text) {
    return false;
  }
  return DELETED_TOKENS.some(token => text.indexOf(token) !== -1);
}

function isTruthyFlag(value: unknown): boolean {
  return value === true || value === 1 || value === '1' || value === 'true';
}

export function getTaskCancellationKey(taskId: string): string {
  return `${TASK_KEY_PREFIX}:${taskId}`;
}

export function getRootTaskCancellationKey(rootTaskId: string): string {
  return `${ROOT_KEY_PREFIX}:${rootTaskId}`;
}

async function markCancellation(redis: RedisLike | undefined, key: string): Promise<boolean> {
  if (!redis) {
    return false;
  }
  try {
    const result = await redis.set(key, '1', 'EX', QUEUE_CANCEL_TTL_SECONDS, 'NX');
    return result === 'OK';
  } catch {
    return false;
  }
}

async function hasCancellation(redis: RedisLike | undefined, key: string): Promise<boolean> {
  if (!redis) {
    return false;
  }
  try {
    const response = await redis.get(key);
    return !!response;
  } catch {
    return false;
  }
}

export async function markTaskCancelled(redis: RedisLike | undefined, taskIdLike: unknown): Promise<boolean> {
  const taskId = toTaskId(taskIdLike);
  if (!taskId) {
    return false;
  }
  return markCancellation(redis, getTaskCancellationKey(taskId));
}

export async function markRootCancelled(redis: RedisLike | undefined, rootTaskIdLike: unknown): Promise<boolean> {
  const rootTaskId = toTaskId(rootTaskIdLike);
  if (!rootTaskId) {
    return false;
  }
  return markCancellation(redis, getRootTaskCancellationKey(rootTaskId));
}

export async function isTaskCancelled(redis: RedisLike | undefined, taskIdLike: unknown): Promise<boolean> {
  const taskId = toTaskId(taskIdLike);
  if (!taskId) {
    return false;
  }
  return hasCancellation(redis, getTaskCancellationKey(taskId));
}

export async function isRootCancelled(redis: RedisLike | undefined, rootTaskIdLike: unknown): Promise<boolean> {
  const rootTaskId = toTaskId(rootTaskIdLike);
  if (!rootTaskId) {
    return false;
  }
  return hasCancellation(redis, getRootTaskCancellationKey(rootTaskId));
}

export function getRootTaskId(task: any, fallbackTaskId?: unknown): string | null {
  return toTaskId(task?.root_task) || toTaskId(task?.rootTask) || toTaskId(task?.id) || toTaskId(fallbackTaskId);
}

export function isDeletedTask(task: any): boolean {
  if (!task || typeof task !== 'object') {
    return false;
  }

  if (
    isTruthyFlag(task.deleted) ||
    isTruthyFlag(task.is_deleted) ||
    isTruthyFlag(task.cancelled) ||
    isTruthyFlag(task.canceled)
  ) {
    return true;
  }

  if (task.deleted_at || task.cancelled_at || task.canceled_at) {
    return true;
  }

  return (
    containsDeletedToken(task.status_text) ||
    containsDeletedToken(task.statusText) ||
    containsDeletedToken(task.status)
  );
}

export function isDeletedTaskError(error: any): boolean {
  const status = Number(error?.status || error?.statusCode || error?.response?.status || 0);
  if (status === 404) {
    return true;
  }

  return (
    containsDeletedToken(error?.message) ||
    containsDeletedToken(error?.statusText) ||
    containsDeletedToken(error?.response?.statusText)
  );
}
