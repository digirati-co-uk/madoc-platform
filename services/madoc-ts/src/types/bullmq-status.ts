export type BullMqState = 'wait' | 'active' | 'delayed' | 'failed' | 'paused' | 'completed';

export type BullMqJobSummary = {
  id: string;
  name: string;
  type: string;
  taskId: string | null;
  attemptsMade: number;
  attempts: number;
  delay: number;
  priority: number | null;
  progress: number | string | null;
  timestamp: number | null;
  processedOn: number | null;
  finishedOn: number | null;
  failedReason: string | null;
  stacktrace: string[];
  dataSummary: {
    keys: string[];
    context: string[];
    contextSize: number;
    siteId: string | null;
    hasState: boolean;
  };
};

export type BullMqTaskTypeSample = {
  type: string;
  total: number;
  states: Partial<Record<BullMqState, number>>;
};

export type BullMqSnapshot = {
  available: boolean;
  error: string | null;
  queue: {
    name: string;
    fetchedAt: string;
    limitPerState: number;
    includeCompleted: boolean;
    redis: {
      db: number;
      hostConfigured: boolean;
    };
  };
  counts: Record<BullMqState, number>;
  jobs: Partial<Record<BullMqState, BullMqJobSummary[]>>;
  taskTypes: {
    sampledTotal: number;
    byType: BullMqTaskTypeSample[];
  };
};
