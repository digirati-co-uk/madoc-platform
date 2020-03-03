import { RouterParamContext } from '@koa/router';
import * as Koa from 'koa';
import { router } from './router';
import { DatabasePoolConnectionType } from 'slonik';
import { Ajv } from 'ajv';

export type Scopes = 'tasks.admin' | 'tasks.create' | 'tasks.progress';

export interface ApplicationState {
  // User.
  // JWT.
  // Role.
  // etc...
  jwt: {
    scope: Scopes[];
    user: {
      name: string;
      id: string;
    };
  };
}

export interface ApplicationContext {
  routes: typeof router;
  connection: DatabasePoolConnectionType;
  ajv: Ajv;
}

export type RouteMiddleware<Params = any, Body = any> = Koa.Middleware<
  ApplicationState,
  ApplicationContext &
    Omit<RouterParamContext<ApplicationState, ApplicationContext>, 'params'> & { params: Params } & {
      requestBody: Body;
    }
>;
