import Router from '@koa/router';
import koaBody, { type KoaBodyMiddlewareOptions } from 'koa-body';
import { requestBody } from '../middleware/request-body';
import { parseJwt } from '../middleware/parse-jwt';
import { RouteMiddleware } from '../types/route-middleware';
import { siteState } from '../middleware/site-state';
import { withRequestDebugTiming } from '../middleware/request-debug';

export type RouteWithParams<Props, Body = any> =
  | [string, string, RouteMiddleware<Props, Body> | Array<RouteMiddleware<Props, Body>>]
  | [
      string,
      string,
      RouteMiddleware<Props, Body> | Array<RouteMiddleware<Props, Body>>,
      { schemaName?: string; isPublic?: boolean },
    ];

export type GetRoute<Routes extends { [_key in RouteName]: Value }, RouteName extends string, Value = any> =
  Routes[RouteName] extends RouteWithParams<infer T> ? T : never;

export class TypedRouter<
  Routes extends string,
  MappedRoutes extends { [_key in Routes]: RouteWithParams<GetRoute<MappedRoutes, Routes>> },
> {
  static GET = 'get';
  static POST = 'post';
  static PATCH = 'patch';
  static PUT = 'put';
  static DELETE = 'delete';
  static OPTIONS = 'options';

  private router = new Router();

  private withMiddlewareName(routeName: string, layer: string, middleware: MiddlewareLike): MiddlewareLike {
    return withRequestDebugTiming(`route:${routeName}:${layer}`, middleware);
  }

  constructor(routes: MappedRoutes) {
    const routeNames = Object.keys(routes) as Routes[];
    for (const route of routeNames) {
      const [method, path, func, options = {}] = routes[route];
      const { schemaName, isPublic } = options;

      const funcArray = Array.isArray(func) ? func : [func];
      const wrappedHandlers = funcArray.map((middleware, index) =>
        this.withMiddlewareName(route, this.getHandlerName(middleware, index), middleware)
      );
      const bodyOpts: Partial<KoaBodyMiddlewareOptions> = {
        jsonLimit: '10mb',
      };

      if (path === '/api/madoc/development/dev-bundle') {
        bodyOpts.jsonLimit = '50mb';
      }

      switch (method) {
        case TypedRouter.PUT:
          (this.router as any).put(
            route,
            path,
            this.withMiddlewareName(route, 'koa-body', koaBody(bodyOpts)),
            this.withMiddlewareName(route, 'parse-jwt', parseJwt),
            this.withMiddlewareName(route, 'request-body', requestBody(schemaName)),
            ...wrappedHandlers
          );
          break;
        case TypedRouter.POST:
          (this.router as any).post(
            route,
            path,
            this.withMiddlewareName(route, 'koa-body', koaBody(bodyOpts)),
            this.withMiddlewareName(route, 'parse-jwt', parseJwt),
            this.withMiddlewareName(route, 'request-body', requestBody(schemaName)),
            ...wrappedHandlers
          );
          break;
        case TypedRouter.PATCH:
          (this.router as any).patch(
            route,
            path,
            this.withMiddlewareName(route, 'koa-body', koaBody(bodyOpts)),
            this.withMiddlewareName(route, 'parse-jwt', parseJwt),
            this.withMiddlewareName(route, 'request-body', requestBody(schemaName)),
            ...wrappedHandlers
          );
          break;
        case TypedRouter.GET: {
          if (isPublic) {
            (this.router as any).get(route, path, ...wrappedHandlers);
          } else {
            (this.router as any).get(
              route,
              path,
              this.withMiddlewareName(route, 'parse-jwt', parseJwt),
              this.withMiddlewareName(route, 'site-state', siteState),
              ...wrappedHandlers
            );
          }
          break;
        }
        case TypedRouter.DELETE:
          (this.router as any).delete(
            route,
            path,
            this.withMiddlewareName(route, 'parse-jwt', parseJwt),
            ...wrappedHandlers
          );
          break;
        case TypedRouter.OPTIONS:
          (this.router as any).options(route, path, ...wrappedHandlers);
          break;
      }
    }
  }

  private getHandlerName(middleware: MiddlewareLike, index: number) {
    const fallback = `handler-${index + 1}`;
    return middleware.name ? `handler:${middleware.name}` : fallback;
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

type MiddlewareLike = RouteMiddleware<unknown, unknown>;
