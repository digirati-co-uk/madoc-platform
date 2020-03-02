import { RouterParamContext } from '@koa/router';
import * as Koa from 'koa';
import { router } from './router';
import { DatabasePoolConnectionType } from 'slonik';
import { sql } from './database/sql';

export interface ApplicationState {
  // User.
  // JWT.
  // Role.
  // etc...
  jwtToken: any;
}

export interface ApplicationContext {
  routes: typeof router;
  connection: DatabasePoolConnectionType;
  sql: typeof sql;
}

export type RouteMiddleware<Params = any, Body = any> = Koa.Middleware<
  ApplicationState,
  ApplicationContext &
    Omit<RouterParamContext<ApplicationState, ApplicationContext>, 'params'> & { params: Params } & {
      requestBody: Body;
    }
>;

export type SingleTaskListing = {
  id: string;
  name: string;
  status: number;
  subtasks: number;
};

export type FullSingleTask = {
  id: string;
  name: string;
  description: string;
  type: string;
  subject: string;
  status: number;
  subtasks: Array<{ name: string; id: string }>;
  creator: {
    id: string;
    name: string;
  };
  parent_task: string;
  parameters: any[];
  state: any;
  created_at: string;
};
