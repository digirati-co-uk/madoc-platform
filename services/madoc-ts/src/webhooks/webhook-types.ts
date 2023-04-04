export interface WebhookRow {
  id: string;
  event_id: string;
  url: string;
  scope?: string[];
  site_id: number;
  creator: number;
  created_at: string;
  body_template: string; // JSON
}

export interface WebhookCallRow {
  id: string;
  time: string;
  is_outgoing: boolean;
  request: any;
  response: any;
  success: boolean;
  status_code: number;
  site_id: number;
  webhook_id?: string;
  static_id?: string;
  event_id: string;
  call_id: string;
}

export interface WebhookEventType {
  event_id: string;
  body_variables: ReadonlyArray<string>;
}

export interface OutgoingWebhook {
  is_outgoing: true;
  type: string;
  is_database: boolean;
  event_id: string;
  url: string;
  body_template: string;
  source?: { type: string; id?: string; name: string };
}

export interface IncomingWebhook {
  is_outgoing: false;
  type: string;
  event_id: string;
  execute: (request: any) => any | Promise<any>;
  source?: { type: string; id?: string; name: string };
}
