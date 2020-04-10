import { CreateTask } from './CreateTask';

export type FullSingleTask = CreateTask & {
  id: string;
  subtasks: Array<{ name: string; id: string }>;
  creator: {
    id: string;
    name: string;
  };
  created_at: string;
  modified_at: string;
  context: string[];
};
