import i18next from 'i18next';
import * as path from 'path';
// @ts-ignore
import * as KoaI18nextDetector from 'koa-i18next-detector';
import { TRANSLATIONS_PATH } from '../../paths';
import { LanguageCache } from '../../utility/language-cache';

const lngDetector = new (KoaI18nextDetector.default || KoaI18nextDetector)();

export async function createBackend(lng?: string, siteId?: number) {
  const t = await i18next
    .use(lngDetector)
    // .use(Backend)
    .use(LanguageCache)
    .init({
      fallbackLng: 'en',
      lng: lng || 'en',
      backend: {
        loadPath: path.join(TRANSLATIONS_PATH, '{{lng}}/{{ns}}.json'),
        addPath: path.join(TRANSLATIONS_PATH, '{{lng}}/{{ns}}.missing.json'),
        siteUrn: siteId ? `urn:madoc:site:${siteId}` : undefined,
      },
      ns: 'madoc',
      defaultNS: 'madoc',
      detection: {
        order: ['querystring', 'path', 'cookie', 'header', 'session'],

        lookupQuerystring: 'lng',
        lookupParam: 'lng', // for route like: 'path1/:lng/result'
        lookupFromPathIndex: 0,

        // currently using ctx.cookies
        lookupCookie: 'i18next',
        // cookieExpirationDate: new Date(), // default: +1 year
        // cookieDomain: '', // default: current domain.

        // currently using ctx.session
        lookupSession: 'lng',

        // other options
        lookupMySession: 'lang',

        // cache user language
        caches: ['cookie', 'mySessionDetector'],
      },
    });

  return [t, i18next] as const;
}
