import Router from '@koa/router';
import koaBody from 'koa-body';
import { AppConfig, RouteMiddleware } from '../types';
import { parseLimit } from './parse-limit';

export type RouteWithParams<Props, Body = any> =
  | [string, string, RouteMiddleware<Props, Body>]
  | [string, string, RouteMiddleware<Props, Body>, string];

export type GetRoute<
  Routes extends { [key in RouteName]: Value },
  RouteName extends string,
  Value = any
> = Routes[RouteName] extends RouteWithParams<infer T> ? T : never;

export type GetBody<
  Routes extends { [key in RouteName]: Value },
  RouteName extends string,
  Value = any
> = Routes[RouteName] extends RouteWithParams<any, infer T> ? T : never;

export class TypedRouter<
  Routes extends string,
  MappedRoutes extends { [key in Routes]: RouteWithParams<GetRoute<MappedRoutes, Routes>> }
> {
  static GET = 'get';
  static POST = 'post';
  static PATCH = 'patch';
  static PUT = 'put';
  static DELETE = 'delete';

  private router = new Router();

  constructor(routes: MappedRoutes, config: AppConfig) {
    const routeNames = Object.keys(routes) as Routes[];

    const limit = parseLimit(config.sizeLimits.file, '5mb');
    const jsonLimit = parseLimit(config.sizeLimits.json, limit);
    const formLimit = parseLimit(config.sizeLimits.form, limit);
    const textLimit = parseLimit(config.sizeLimits.text, limit);

    for (const route of routeNames) {
      const [method, path, func, schemaName] = routes[route];

      switch (method) {
        case TypedRouter.PUT:
          // @ts-ignore
          this.router.put(
            route,
            path,
            koaBody({
              multipart: true,
              text: true,
              includeUnparsed: true,
              json: true,
              jsonLimit,
              formLimit,
              textLimit,
            }),
            func
          );
          break;
        case TypedRouter.POST:
          // @ts-ignore
          this.router.post(
            route,
            path,
            koaBody({
              multipart: true,
              text: true,
              includeUnparsed: true,
              json: true,
              jsonLimit,
              formLimit,
              textLimit,
            }),
            func
          );
          break;
        case TypedRouter.PATCH:
          // @ts-ignore
          this.router.patch(
            route,
            path,
            koaBody({
              multipart: true,
              text: true,
              includeUnparsed: true,
              json: true,
              jsonLimit,
              formLimit,
              textLimit,
            }),
            func
          );
          break;
        case TypedRouter.GET:
          // @ts-ignore
          this.router.get(route, path, func);
          break;
        case TypedRouter.DELETE:
          // @ts-ignore
          this.router.delete(route, path, func);
          break;
      }
    }
  }

  url<Route extends Routes>(
    name: Route,
    params?: GetRoute<MappedRoutes, Route>,
    options?: Router.UrlOptionsQuery
  ): string {
    return this.router.url(name, params, options);
  }

  routes() {
    return this.router.routes();
  }

  allowedMethods() {
    return this.router.allowedMethods();
  }
}
