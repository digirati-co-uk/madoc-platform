import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HTTP from 'i18next-http-backend';

export async function createBackend(slug: string, jwt?: string, languages?: string[], defaultLocale?: string) {
  const t = await i18next
    .use(HTTP)
    .use(LanguageDetector)
    .init({
      fallbackLng: defaultLocale || 'en',
      ns: ['madoc', 'capture-models'],
      defaultNS: 'madoc',
      supportedLngs: languages,
      saveMissing: process.env.NODE_ENV !== 'production',
      keySeparator: false,
      detection: {
        order: ['querystring', 'cookie', 'localStorage', 'sessionStorage'],
        lookupQuerystring: 'lng',
        lookupCookie: 'i18next',
        lookupLocalStorage: 'i18nextLng',
        lookupSessionStorage: 'i18nextLng',

        // cache user language
        caches: ['cookie', 'localStorage'],
        excludeCacheFor: ['cimode'],
        cookieMinutes: 60,
        //cookieDomain: 'myDomain'
      },
      backend: {
        allowMultiLoading: false,
        crossDomain: false,
        loadPath: `/s/${slug}/madoc/api/locales/{{lng}}/{{ns}}`,
        addPath: `/s/${slug}/madoc/api/locales/{{lng}}/{{ns}}`,
        customHeaders: jwt
          ? {
              Accept: 'application/json',
              Authorization: `Bearer ${jwt}`,
            }
          : {
              Accept: 'application/json',
            },
      },
    });

  return [t, i18next] as const;
}
