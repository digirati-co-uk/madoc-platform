import Router from '@koa/router';
import koaBody from 'koa-body';
import { RouteMiddleware } from '../types';

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

  constructor(routes: MappedRoutes) {
    const routeNames = Object.keys(routes) as Routes[];
    for (const route of routeNames) {
      const [method, path, func, schemaName] = routes[route];

      switch (method) {
        case TypedRouter.PUT:
          // @ts-ignore
          this.router.put(
            route,
            path,
            koaBody({ multipart: true, text: true, includeUnparsed: true, json: true }),
            func
          );
          break;
        case TypedRouter.POST:
          // @ts-ignore
          this.router.post(
            route,
            path,
            koaBody({ multipart: true, text: true, includeUnparsed: true, json: true, jsonLimit: '5mb', formLimit: '5mb', textLimit: '5mb' }),
            func
          );
          break;
        case TypedRouter.PATCH:
          // @ts-ignore
          this.router.patch(
            route,
            path,
            koaBody({ multipart: true, text: true, includeUnparsed: true, json: true, jsonLimit: '5mb', formLimit: '5mb', textLimit: '5mb' }),
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
