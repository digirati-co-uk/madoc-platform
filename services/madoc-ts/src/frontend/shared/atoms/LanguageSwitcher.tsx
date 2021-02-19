import React from 'react';
import useDropdownMenu from 'react-accessible-dropdown-menu-hook';
import { useTranslation } from 'react-i18next';
import { useDetailedSupportLocales } from '../hooks/use-site';
import Cookies from 'js-cookie';
import {
  GlobalHeaderMenuContainer,
  GlobalHeaderMenuItem,
  GlobalHeaderMenuLabel,
  GlobalHeaderMenuList,
} from './GlobalHeader';

export const LanguageSwitcher: React.FC = () => {
  const supported = useDetailedSupportLocales();
  const { i18n } = useTranslation();
  const { buttonProps, itemProps, isOpen, setIsOpen } = useDropdownMenu(supported.length);

  if (supported.length === 1) {
    return null;
  }

  return (
    <GlobalHeaderMenuContainer>
      <GlobalHeaderMenuLabel {...buttonProps}>{i18n.language}</GlobalHeaderMenuLabel>
      <GlobalHeaderMenuList $visible={isOpen} role="menu">
        {supported.map((lng, key) => {
          return (
            <GlobalHeaderMenuItem
              key={lng.code}
              style={{ fontWeight: lng.code === i18n.language ? 'bold' : undefined }}
              onClick={() => {
                localStorage.setItem('i18nextLng', lng.code);
                Cookies.set('i18next', lng.code);
                i18n.changeLanguage(lng.code);
                setIsOpen(false);
              }}
              {...itemProps[key]}
            >
              {lng.label}
            </GlobalHeaderMenuItem>
          );
        })}
      </GlobalHeaderMenuList>
    </GlobalHeaderMenuContainer>
  );
};
