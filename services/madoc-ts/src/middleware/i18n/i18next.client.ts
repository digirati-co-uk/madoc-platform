import i18next from 'i18next';
import Backend from 'i18next-chained-backend';
import LocalStorageBackend from 'i18next-localstorage-backend'; // primary use cache
import HTTP from 'i18next-http-backend';

export async function createBackend(slug: string, jwt?: string) {
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
        },
      ].filter(Boolean),
    },
  });

  return [t, i18next] as const;
}
