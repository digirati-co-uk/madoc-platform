// /api/madoc/locales/{{lng}}/{{ns}}

import * as path from 'path';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import send from 'koa-send';
import { RouteMiddleware } from '../types/route-middleware';

export const getLocale: RouteMiddleware<{ lng: string; ns: string }> = async context => {
  if (context.params.lng.match(/\.\./) || context.params.ns.match(/\.\./)) {
    context.status = 404;
    return;
  }

  const bundle = path.resolve(__dirname, '..', '..', 'translations', context.params.lng, `${context.params.ns}.json`);

  if (existsSync(bundle)) {
    await send(context, bundle, { root: '/' });
    return;
  }

  context.status = 404;
};

export const saveMissingLocale: RouteMiddleware<{ lng: string; ns: string }> = async context => {
  if (context.params.lng.match(/\.\./) || context.params.ns.match(/\.\./)) {
    context.status = 404;
    return;
  }

  if (context.state.jwt && context.state.jwt.scope.indexOf('site.admin') !== -1) {
    const bundle = path.resolve(__dirname, '..', '..', 'translations', context.params.lng, `${context.params.ns}.json`);
    if (existsSync(bundle)) {
      const bundleJson = JSON.parse(readFileSync(bundle).toString('utf-8'));
      writeFileSync(bundle, JSON.stringify(bundleJson, null, 2));
    }
  }

  context.status = 200;
};
