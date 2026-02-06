import { Queue } from 'bullmq';
import { BullMqResumeQueueResult } from '../../types/bullmq-status';
import { RouteMiddleware } from '../../types/route-middleware';
import { onlyGlobalAdmin } from '../../utility/user-with-scope';

const QUEUE_NAME = 'madoc-ts';
const REDIS_DB = 2;

function addWarning(summary: BullMqResumeQueueResult, warning: string) {
  summary.warnings.push(warning);
}

export const resumeQueue: RouteMiddleware = async context => {
  await onlyGlobalAdmin(context);

  const summary: BullMqResumeQueueResult = {
    queueWasPaused: false,
    queueResumed: false,
    warnings: [],
  };

  let queue: Queue | undefined;

  try {
    queue = new Queue(QUEUE_NAME, {
      connection: {
        host: process.env.REDIS_HOST,
        db: REDIS_DB,
      },
    });

    summary.queueWasPaused = await queue.isPaused();
    if (summary.queueWasPaused) {
      await queue.resume();
      summary.queueResumed = true;
    }
  } catch (error: any) {
    addWarning(summary, `Unable to resume queue: ${error?.message || 'unknown error'}`);
  } finally {
    if (queue) {
      await queue.close().catch(() => undefined);
    }
  }

  context.response.body = summary;
};
