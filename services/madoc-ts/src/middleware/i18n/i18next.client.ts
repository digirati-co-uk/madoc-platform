import i18next from 'i18next';
import Backend from 'i18next-chained-backend';
import LocalStorageBackend from 'i18next-localstorage-backend'; // primary use cache
import HTTP from 'i18next-http-backend';

export async function createBackend(jwt: string) {
  const t = await i18next.use(Backend).init({
    fallbackLng: 'en',
    lng: 'en',
    ns: 'madoc',
    defaultNS: 'madoc',
    backend: {
      backends: [
        process.env.NODE_ENV === 'production' ? LocalStorageBackend : null, // primary
        HTTP, // fallback
      ].filter(Boolean),
      backendOptions: [
        process.env.NODE_ENV === 'production' ? {} : null, // primary
        {
          loadPath: '/api/madoc/locales/{{lng}}/{{ns}}', // xhr load path for my own fallback
          addPath: '/api/madoc/locales/{{lng}}/{{ns}}', // xhr load path for my own fallback
          customHeaders: {
            Accept: 'application/json',
            Authorization: `Bearer ${jwt}`,
          },
        },
      ].filter(Boolean),
    },
  });

  return [t, i18next] as const;
}
