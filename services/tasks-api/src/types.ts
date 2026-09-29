import { RouterParamContext } from '@koa/router';
import * as Koa from 'koa';
import { router } from './router';
import { DatabasePoolType } from 'slonik';
import { Ajv } from 'ajv';
import { JobsOptions, ConnectionOptions, Queue, QueueOptions } from 'bullmq';
import { EventPrefix } from './utility/events';

export type Scopes = 'tasks.admin' | 'tasks.create' | 'tasks.progress';

export type AppConfig = {
  postgres: DBConfig;
  queue?: BaseQueueConfig;
  bullmq?: QueueOptions;
  env: string;
  queueList: string[];
  redis?: ConnectionOptions;
  enableQueue?: boolean;
  jwt?: JWTConfig;
  log?: boolean;
} & (
  | {
      migrate: false | undefined;
    }
  | {
      migrate: true;
      migrationsPath: string;
    }
);

export type BaseQueueConfig = {
  dispatch: {
    assigned: string[];
    created: string[];
    modified: string[];
    subtask_created: string[];
    deleted: string[];
  };
};

export type JWTConfig = {
  siteIdHeader?: string;
  userIdHeader?: string;
  userNameHeader?: string;
  userUrnPrefix?: string;
  siteUrnPrefix?: string;
};

export interface ApplicationState {
  // User.
  // JWT.
  // Role.
  // etc...
  jwt: {
    scope: Scopes[];
    context: string[];
    user: {
      name: string;
      id: string;
    };
    site?: {
      id: string;
      name?: string;
    };
  };
  queueList: string[];
  queue: Array<{ queue_id: string; event: { name: string; data: any; opts?: JobsOptions } }>;
  dispatch: (
    task: { id: string; type: string; events?: string[] },
    eventName: EventPrefix,
    subject?: string | number,
    state?: any
  ) => void;
}

export interface ApplicationContext {
  routes: typeof router;
  connection: DatabasePoolType;
  getQueue?: (name: string) => Queue;
  ajv: Ajv;
}

export type RouteMiddleware<Params = any, Body = any> = Koa.Middleware<
  ApplicationState,
  ApplicationContext &
    Omit<RouterParamContext<ApplicationState, ApplicationContext>, 'params'> & { params: Params } & {
      requestBody: Body;
    }
>;

export type DBConfig =
  | string
  | {
      username: string;
      password: string;
      host: string;
      port: string | number;
      database: string;
    };

export type DatabaseTaskType = {
  id: string;
  name: string;
  description: string;
  type: string;
  subject: string;
  status: number;
  status_text: string;
  state: any;
  created_at: number;
  parent_task: string;
  parameters: any[];
  creator_id: string;
  creator_name: string;
  assignee_id: string;
  assignee_is_service: boolean;
  assignee_name: string;
  context: any[];
  events: string[];
  modified_at: number;
  root_task: string;
  subject_parent: string;
  delegated_owners: string[] | null;
  delegated_task: string;
};
