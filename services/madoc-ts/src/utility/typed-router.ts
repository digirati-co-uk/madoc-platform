import Router from '@koa/router';
import koaBody from 'koa-body';
import { requestBody } from '../middleware/request-body';
import { parseJwt } from '../middleware/parse-jwt';
import { RouteMiddleware } from '../types/route-middleware';
import { siteState } from '../middleware/site-state';

export type RouteWithParams<Props, Body = any> =
  | [string, string, RouteMiddleware<Props, Body> | Array<RouteMiddleware<Props, Body>>]
  | [
      string,
      string,
      RouteMiddleware<Props, Body> | Array<RouteMiddleware<Props, Body>>,
      { schemaName?: string; isPublic?: boolean }
    ];

export type GetRoute<
  Routes extends { [key in RouteName]: Value },
  RouteName extends string,
  Value = any
> = Routes[RouteName] extends RouteWithParams<infer T> ? T : never;

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
      const [method, path, func, options = {}] = routes[route];
      const { schemaName, isPublic } = options;

      const funcArray = Array.isArray(func) ? func : [func];

      switch (method) {
        case TypedRouter.PUT:
          (this.router as any).put(route, path, koaBody(), parseJwt, requestBody(schemaName), ...funcArray);
          break;
        case TypedRouter.POST:
          (this.router as any).post(route, path, koaBody(), parseJwt, requestBody(schemaName), ...funcArray);
          break;
        case TypedRouter.PATCH:
          (this.router as any).patch(route, path, koaBody(), parseJwt, requestBody(schemaName), ...funcArray);
          break;
        case TypedRouter.GET: {
          if (isPublic) {
            (this.router as any).get(route, path, ...funcArray);
          } else {
            (this.router as any).get(route, path, parseJwt, siteState, ...funcArray);
          }
          break;
        }
        case TypedRouter.DELETE:
          (this.router as any).delete(route, path, parseJwt, ...funcArray);
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

  getRouter() {
    return this.router;
  }

  routes() {
    return this.router.routes();
  }

  allowedMethods() {
    return this.router.allowedMethods();
  }
}
