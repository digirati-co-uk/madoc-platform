export type Job = {
  id: number;
  owner_id: number;
  pid: string;
  status: string;
  class: string;
  args: string;
  log: string;
  started: Date;
  ended?: Date;
};
