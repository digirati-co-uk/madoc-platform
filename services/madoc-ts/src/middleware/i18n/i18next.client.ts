import i18next from 'i18next';
import Backend from 'i18next-chained-backend';
import LocalStorageBackend from 'i18next-localstorage-backend'; // primary use cache
import LanguageDetector from 'i18next-browser-languagedetector';
import HTTP from 'i18next-http-backend';

export async function createBackend(slug: string, jwt?: string, languages?: string[], defaultLocale?: string) {
  const t = await i18next
    .use(Backend)
    .use(LanguageDetector)
    .init({
      fallbackLng: 'en',
      // lng: defaultLocale,
      ns: ['madoc', 'capture-models'],
      defaultNS: 'madoc',
      supportedLngs: languages,
      saveMissing: process.env.NODE_ENV !== 'production',
      keySeparator: false,
      detection: {
        order: ['querystring', /* 'cookie', */ 'localStorage', 'sessionStorage', 'navigator', 'htmlTag'],
        lookupQuerystring: 'lng',
        lookupCookie: 'i18next',
        lookupLocalStorage: 'i18nextLng',
        lookupSessionStorage: 'i18nextLng',

        // cache user language
        caches: ['localStorage'],
        excludeCacheFor: ['cimode'],
        cookieMinutes: 60,
        //cookieDomain: 'myDomain'
      },
      backend: {
        allowMultiLoading: false,
        crossDomain: false,
        backends: [
          process.env.NODE_ENV === 'production' ? LocalStorageBackend : null, // primary
          HTTP, // fallback
        ].filter(Boolean),
        backendOptions: [
          process.env.NODE_ENV === 'production' ? {} : null, // primary
          process.env.NODE_ENV !== 'production'
            ? {
                loadPath: `/s/${slug}/madoc/api/locales/{{lng}}/{{ns}}`, // xhr load path for my own fallback
                addPath: `/s/${slug}/madoc/api/locales/{{lng}}/{{ns}}`, // xhr load path for my own fallback
                customHeaders: jwt
                  ? {
                      Accept: 'application/json',
                      Authorization: `Bearer ${jwt}`,
                    }
                  : {
                      Accept: 'application/json',
                    },
              }
            : null,
        ].filter(Boolean),
      },
    });

  return [t, i18next] as const;
}
