import { getI18n, I18nextProvider, initReactI18next } from 'react-i18next';
import React from 'react';
import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    debug: false,

    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
  });

export const ModelStorybookProvider = ({ children }: any) => {
  return (
    <React.Suspense fallback={<div>loading...</div>}>
      <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
    </React.Suspense>
  );
};
