import { RouteMiddleware } from '../types';

const queueList = process.env.QUEUE_LIST ? process.env.QUEUE_LIST.split(',') : [];

export const queueEvents: RouteMiddleware = async (context, next) => {
  context.state.queue = [];
  context.state.queueList = queueList;
  context.state.dispatch = (
    task: { id: string; type: string; events?: string[] },
    eventName: string,
    subject?: string | number,
    state: any = {}
  ) => {
    // Non prefixed.
    const eventsToFire = task.events;

    if (!eventsToFire || eventsToFire.length === 0 || !task.events || task.events.length === 0) {
      return;
    }

    const queueMap: { [ev: string]: string[] } = {};
    const allEvents: string[] = [];
    for (const eventString of task.events) {
      const [queueName, event, ...sub] = eventString.split('.');
      const ev = `${event}${subject ? `.${sub.join('.')}` : ''}`;
      queueMap[ev] = queueMap[ev] ? queueMap[ev] : [];
      queueMap[ev].push(queueName);
      allEvents.push(ev);
    }

    // @todo apply default events from configuration.

    // Push the event.
    const realEvent = `${eventName}${subject ? `.${subject}` : ''}`;
    if (allEvents.indexOf(realEvent) !== -1 && queueMap[realEvent]) {
      for (const queue_id of queueMap[realEvent]) {
        context.state.queue.push({
          queue_id,
          event: {
            name: realEvent,
            data: { subject, state, taskId: task.id, type: task.type },
            opts: {
              lifo: eventName !== 'created',
            },
          },
        });
      }
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
