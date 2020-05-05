import { RouterParamContext } from '@koa/router';
import * as Koa from 'koa';
import { router } from './router';
import { DatabasePoolConnectionType } from 'slonik';
import { Ajv } from 'ajv';
import { JobsOptions, Queue } from 'bullmq';
import { EventPrefix } from './utility/events';

export type Scopes = 'tasks.admin' | 'tasks.create' | 'tasks.progress';

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
  connection: DatabasePoolConnectionType;
  getQueue: (name: string) => Queue;
  ajv: Ajv;
}

export type RouteMiddleware<Params = any, Body = any> = Koa.Middleware<
  ApplicationState,
  ApplicationContext &
    Omit<RouterParamContext<ApplicationState, ApplicationContext>, 'params'> & { params: Params } & {
      requestBody: Body;
    }
>;
