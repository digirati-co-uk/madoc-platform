import { RouterParamContext } from '@koa/router';
import * as Koa from 'koa';
import { router } from './router';
import { DatabasePoolConnectionType } from 'slonik';
import { Ajv } from 'ajv';
import { Pool } from 'mysql';

export type Scopes = 'tasks.admin' | 'tasks.create' | 'tasks.progress';
export type ExternalConfig = {
  cookieName?: string;
  tokenExpires?: number;
  permissions: {
    [role: string]: string[];
  };
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
  };
}

export interface ApplicationContext {
  externalConfig: ExternalConfig;
  routes: typeof router;
  mysql: Pool;
  connection: DatabasePoolConnectionType;
  ajv: Ajv;
  omekaPage?: string;
}

export type RouteMiddleware<Params = any, Body = any> = Koa.Middleware<
  ApplicationState,
  ApplicationContext &
    Omit<RouterParamContext<ApplicationState, ApplicationContext>, 'params'> & { params: Params } & {
      requestBody: Body;
    }
>;
