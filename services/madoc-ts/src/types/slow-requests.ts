export interface SlowRequest {
  key: string;
  count: number;
  avg: number;
  slowest: number;
}

export type SlowRequests = Record<string, SlowRequest>;

export interface SlowRequestInstance {
  id: string;
  startedAt: string;
  observedAt: string;
}

export interface SlowRequestSnapshot extends SlowRequestInstance {
  requests: SlowRequests;
}
