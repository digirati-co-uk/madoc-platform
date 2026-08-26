export type Pm2Status = {
  id: number;
  name: string;
  monit: {
    memory: number;
    cpu: number;
  };
  stats: {
    [label: string]: {
      value: string;
      type: string;
      unit: string;
      historic: number;
    };
  };
  max_memory_restart: number;
  instances: number;
  status: string;
  uptime: number;
};

export interface Pm2LogEvent {
  stream: 'stdout' | 'stderr';
  message: string;
}
