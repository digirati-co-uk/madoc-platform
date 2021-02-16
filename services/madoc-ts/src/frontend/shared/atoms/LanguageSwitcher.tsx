import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSupportedLocales } from '../hooks/use-site';
import Cookies from 'js-cookie';

export const LanguageSwitcher: React.FC = () => {
  const supported = useSupportedLocales();
  const { i18n } = useTranslation();

  if (supported.length === 1) {
    return null;
  }

  return (
    <div style={{ display: 'flex', color: '#fff' }}>
      {supported.map(lng => {
        return (
          <div
            key={lng}
            style={{ padding: '0.3em', fontWeight: i18n.language === lng ? 'bold' : undefined }}
            onClick={() => {
              localStorage.setItem('i18nextLng', lng);
              Cookies.set('i18next', lng);
              i18n.changeLanguage(lng);
            }}
          >
            {lng}
          </div>
        );
      })}
    </div>
  );
};
