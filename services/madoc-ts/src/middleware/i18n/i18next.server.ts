import i18next from 'i18next';
// @ts-ignore
import Backend from 'i18next-fs-backend';
import * as path from 'path';

// File structure
// /locales/{language}/{ns}.json

const localFolder = path.resolve(__dirname, '..', '..', 'translations');

export async function createBackend() {
  const t = await i18next.use(Backend).init({
    fallbackLng: 'en',
    lng: 'en',
    backend: {
      loadPath: path.join(localFolder, '{{lng}}/{{ns}}.json'),
      addPath: path.join(localFolder, '{{lng}}/{{ns}}.missing.json'),
    },
    ns: 'madoc',
    defaultNS: 'madoc',
  });

  return [t, i18next] as const;
}
