// /api/madoc/locales/{{lng}}/{{ns}}

import deepmerge from 'deepmerge';
import * as path from 'path';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import send from 'koa-send';
import { TRANSLATIONS_PATH } from '../paths';
import { RouteMiddleware } from '../types/route-middleware';

export const getLocale: RouteMiddleware<{ lng: string; ns: string }> = async context => {
  if (context.params.lng.match(/\.\./) || context.params.ns.match(/\.\./)) {
    context.status = 404;
    return;
  }

  if (context.params.ns === 'madoc') {
    const { siteApi } = context.state;
    const locale = await siteApi.getSiteLocale(context.params.lng);

    if (locale.isStatic || locale.isDynamic) {
      context.response.body = locale.content;
      context.response.status = 200;
    }

    return;
  }

  const bundle = path.resolve(TRANSLATIONS_PATH, context.params.lng, `${context.params.ns}.json`);

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
        const bundle = path.resolve(TRANSLATIONS_PATH, context.params.lng, `${context.params.ns}.json`);
        if (existsSync(bundle)) {
          const file = readFileSync(bundle);
          const bundleJson = JSON.parse(file.toString('utf-8'));
          const newBundle = deepmerge(bundleJson, context.requestBody);
          await writeFileSync(bundle, JSON.stringify(newBundle, Object.keys(newBundle as any).sort(), 2));
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
