// /api/madoc/locales/{{lng}}/{{ns}}

import deepmerge from 'deepmerge';
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
    // During development we want to add missing translations to the local file to commit.
    if (process.env.NODE_ENV !== 'production') {
      try {
        const bundle = path.resolve(
          __dirname,
          '..',
          '..',
          'translations',
          context.params.lng,
          `${context.params.ns}.json`
        );
        if (existsSync(bundle)) {
          const bundleJson = JSON.parse(readFileSync(bundle).toString('utf-8'));
          const newBundle = deepmerge(bundleJson, context.requestBody);
          writeFileSync(bundle, JSON.stringify(newBundle, Object.keys(newBundle as any).sort(), 2));
        }
      } catch (e) {
        console.log(e);
        // fail silently.
      }
    } else {
      // @todo store dynamic translations in a table.
    }
  }

  context.status = 200;
};
