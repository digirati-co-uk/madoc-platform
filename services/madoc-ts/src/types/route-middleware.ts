import { ParameterizedContext } from 'koa';
import * as Koa from 'koa';
import { ApplicationState } from './application-state';
import { RouterParamContext } from '@koa/router';

export type RouteMiddleware<Params = any, Body = any> = Koa.Middleware<
  ApplicationState,
  Koa.Context &
    Omit<RouterParamContext<ApplicationState, Koa.Context>, 'params'> & { params: Params } & {
      requestBody: Body;
      reactFormResponse: any;
    }
>;

export type ServerContext<Params = any, Body = any> = ParameterizedContext<
  ApplicationState,
  Koa.Context &
    Omit<RouterParamContext<ApplicationState, Koa.Context>, 'params'> & { params: Params } & {
      requestBody: Body;
      reactFormResponse: any;
    }
>;
