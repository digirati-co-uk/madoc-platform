import { CreateTask } from './CreateTask';

export type FullSingleTask = CreateTask & {
  id: string;
  subtasks: Array<{ name: string; id: string; metadata?: any }>;
  creator: {
    id: string;
    name: string;
  };
  metadata?: any;
  created_at: string;
  modified_at: string;
  context: string[];
  root_task?: string;
  pagination?: {
    page: number;
    total_results: number;
    total_pages: number;
  };
};
