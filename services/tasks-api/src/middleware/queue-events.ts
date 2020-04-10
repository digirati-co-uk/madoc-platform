import { RouteMiddleware } from '../types';

const queueList = process.env.QUEUE_LIST ? process.env.QUEUE_LIST.split(',') : [];

export const queueEvents: RouteMiddleware = async (context, next) => {
  context.state.queue = [];
  context.state.queueList = queueList;
  context.state.dispatch = (
    task: { id: string; type: string; queue_id?: string; events?: string[] },
    eventName: string,
    subject?: string | number,
    state: any = {}
  ) => {
    if (context.state.queueList.length === 0 || !task.queue_id || !task.events || task.events.length === 0) return;
    // Shouldn't be able to happen, but extra check.
    if (context.state.queueList.indexOf(task.queue_id) === -1) {
      return;
    }
    // Push the event.
    const realEvent = `${eventName}${subject ? `.${subject}` : ''}`;
    if (task.events.indexOf(realEvent) !== -1) {
      context.state.queue.push({
        queue_id: task.queue_id,
        event: {
          name: `${eventName}${subject ? `.${subject}` : ''}`,
          data: { subject, state, taskId: task.id, type: task.type },
        },
      });
    }
  };

  await next();

  // Only if there are events, and if there are queues.
  if (context.state.queueList.length && context.state.queue.length) {
    const queues: { [key: string]: Array<{ name: string; data: any }> } = {};

    context.state.queue.forEach(item => {
      if (context.state.queueList.indexOf(item.queue_id) !== -1) {
        queues[item.queue_id] = queues[item.queue_id] ? queues[item.queue_id] : [];
        queues[item.queue_id].push(item.event);
      }
    });

    const queueIds = Object.keys(queues);
    for (const queueId of queueIds) {
      const queue = context.getQueue(queueId);
      await queue.addBulk(queues[queueId]);
      await queue.disconnect();
    }
  }
};
