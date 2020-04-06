import { RouterParamContext } from '@koa/router';
import * as Koa from 'koa';
import { router } from './router';
import { DatabasePoolConnectionType } from 'slonik';
import { Ajv } from 'ajv';
import { Pool } from 'mysql';

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
  authenticatedUser?: {
    name: string;
    id: number;
    sites: Array<{ id: number; slug: string; title: string; role: string }>;
    role: string;
  };
  loggedOut?: boolean;
  jwt?: {
    token: string;
    scope: string[];
    context: string[];
    site: {
      id: number;
      name: string;
    };
    user: {
      name: string;
      id: number;
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
