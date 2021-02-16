import i18next from 'i18next';
// @ts-ignore
import Backend from 'i18next-fs-backend';
import * as path from 'path';
// @ts-ignore
import KoaI18nextDetector from 'koa-i18next-detector';

// File structure
// /locales/{language}/{ns}.json

const localFolder = path.resolve(__dirname, '..', '..', 'translations');

const lngDetector = new KoaI18nextDetector();

export async function createBackend() {
  const t = await i18next
    .use(lngDetector)
    .use(Backend)
    .init({
      fallbackLng: 'en',
      lng: 'en',
      backend: {
        loadPath: path.join(localFolder, '{{lng}}/{{ns}}.json'),
        addPath: path.join(localFolder, '{{lng}}/{{ns}}.missing.json'),
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
