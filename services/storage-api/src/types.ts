import { RouterParamContext } from '@koa/router';
import * as Koa from 'koa';
import { router } from './router';
import { StorageManager } from '@slynova/flydrive';

export type Scopes = 'site.admin' | 'files.read' | 'files.write' | 'files.update';

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
}

export interface ApplicationContext {
  routes: typeof router;
  storage: StorageManager;
  localDisk: string;
}

export type RouteMiddleware<Params = any, Body = any> = Koa.Middleware<
  ApplicationState,
  ApplicationContext &
    Omit<RouterParamContext<ApplicationState, ApplicationContext>, 'params'> & { params: Params } & {
      requestBody: Body;
    }
>;
