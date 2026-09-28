import { RouterParamContext } from '@koa/router';
import * as Koa from 'koa';
import { StorageManager } from '@slynova/flydrive';
import { StorageManagerConfig } from '@slynova/flydrive/build/types';
import { TypedRouter } from './utility/typed-router';

export type Scopes = 'site.admin' | 'files.read' | 'files.write' | 'files.update';

export type AppConfig = {
  env: string;
  localDisk: string;
  storageManager: StorageManagerConfig;
  gatewayHost: string;
  sizeLimits: {
    file: string | null;
    json: string | null;
    text: string | null;
    form: string | null;
  };
  defaultDisk?: string;
  enableIIIF?: boolean;
};

export interface ApplicationState {
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
  routes: TypedRouter<any, any>;
  storage: StorageManager;
  localDisk: string;
  gatewayHost: string;
  sizeLimits: AppConfig['sizeLimits'];
  defaultDisk: string;
  enableIIIF: boolean;
}

export type RouteMiddleware<Params = any, Body = any> = Koa.Middleware<
  ApplicationState,
  ApplicationContext &
    Omit<RouterParamContext<ApplicationState, ApplicationContext>, 'params'> & { params: Params } & {
      requestBody: Body;
    }
>;
