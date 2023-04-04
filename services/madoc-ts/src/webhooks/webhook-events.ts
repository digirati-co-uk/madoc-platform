import { WebhookEventType } from './webhook-types';

const testEvent = {
  event_id: 'test-event',
  body_variables: ['hello'] as const,
};

export const webhookEvents: WebhookEventType[] = [testEvent];
