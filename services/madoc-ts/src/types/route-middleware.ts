import * as Koa from 'koa';
import { ApplicationState } from './application-state';
import { ApplicationContext } from './application-context';
import { RouterParamContext } from '@koa/router';

export type RouteMiddleware<Params = any, Body = any> = Koa.Middleware<
  ApplicationState,
  ApplicationContext &
    Omit<RouterParamContext<ApplicationState, ApplicationContext>, 'params'> & { params: Params } & {
      requestBody: Body;
      reactFormResponse: any;
    }
>;
