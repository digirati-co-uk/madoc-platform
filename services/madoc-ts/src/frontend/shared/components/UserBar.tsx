import { stringify } from 'query-string';
import React, { useEffect } from 'react';
import useDropdownMenu from 'react-accessible-dropdown-menu-hook';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';
import { PublicSite } from '../../../utility/omeka-api';
import {
  GlobalHeaderMenuContainer,
  GlobalHeaderMenuItem,
  GlobalHeaderMenuLabel,
  GlobalHeaderMenuList,
} from '../atoms/GlobalHeader';
import { LanguageSwitcher } from '../atoms/LanguageSwitcher';
import { useStaticData } from '../hooks/use-data';
import { useLocationQuery } from '../hooks/use-location-query';
import { useUser } from '../hooks/use-site';
import { HrefLink } from '../utility/href-link';
import { isAdmin } from '../utility/user-roles';

const UserBarContainer = styled.div`
  position: absolute;
  height: 36px;
  background: #333;
  left: 0;
  right: 0;
  top: 0;
  color: #fff;
  display: flex;
  flex-direction: row;
  align-items: center;
  z-index: 10;
  padding: 0 18px;
`;

const UserBarAdminButton = styled.a`
  text-decoration: none;
  color: #fff;
  &:hover {
    text-decoration: underline;
  }
`;

const UserBarExpander = styled.div`
  flex: 1 1 0px;
`;

const UserBarSpacer = styled.div`
  position: relative;
  height: 36px;
  display: block;
`;

const UserBarUserDetails = styled.span`
  font-size: 13px;
  margin-right: 10px;
  color: rgba(255, 255, 255, 0.5);
  a {
    color: #fff;
    text-decoration: underline;
  }
`;

const UserBarLogout = styled.span`
  font-size: 13px;
  a {
    color: #fff;
    text-decoration: underline;
  }
`;

export const UserBar: React.FC<{
  site: PublicSite;
  user?: { name: string; id: number; scope: string[] };
  admin?: boolean;
}> = ({ user, site, admin }) => {
  const { t } = useTranslation();
  const { location } = useHistory();
  const query = useLocationQuery();
  const { buttonProps, itemProps, isOpen, setIsOpen } = useDropdownMenu(4);
  const redirect = admin
    ? `/s/${site.slug}/madoc`
    : `/s/${site.slug}/madoc/${location.pathname}${query ? `?${stringify(query)}` : ''}`;
  const showAdmin = user && user.scope.indexOf('site.admin') !== -1;

  useEffect(() => {
    setIsOpen(false);
  }, [location, setIsOpen]);

  return (
    <>
      <UserBarContainer>
        {showAdmin && admin ? (
          <UserBarAdminButton as={HrefLink} href={`/`}>
            {t('Site admin')}
          </UserBarAdminButton>
        ) : (
          <UserBarAdminButton href={`/s/${site.slug}/madoc/admin`}>{t('Site admin')}</UserBarAdminButton>
        )}
        <UserBarExpander />
        <LanguageSwitcher />

        {user ? (
          <GlobalHeaderMenuContainer>
            <GlobalHeaderMenuLabel {...buttonProps}>{user.name}</GlobalHeaderMenuLabel>
            <GlobalHeaderMenuList $visible={isOpen} role="menu">
              {admin ? (
                <>
                  <GlobalHeaderMenuItem href={`/s/${site.slug}/madoc/dashboard`} {...itemProps[0]}>
                    {t('Dashboard')}
                  </GlobalHeaderMenuItem>
                  <GlobalHeaderMenuItem href={`/s/${site.slug}/madoc`} {...itemProps[1]}>
                    {t('View site')}
                  </GlobalHeaderMenuItem>

                  <GlobalHeaderMenuItem href={`/s/${site.slug}/profile`} {...itemProps[2]}>
                    {t('Account')}
                  </GlobalHeaderMenuItem>
                  <GlobalHeaderMenuItem
                    href={`/s/${site.slug}/madoc/logout?${stringify({ redirect })}`}
                    {...itemProps[3]}
                  >
                    {t('Logout')}
                  </GlobalHeaderMenuItem>
                </>
              ) : (
                <>
                  <GlobalHeaderMenuItem as={HrefLink} href={`/dashboard`} {...itemProps[0]}>
                    {t('Dashboard')}
                  </GlobalHeaderMenuItem>
                  <GlobalHeaderMenuItem as={HrefLink} href={`/`} {...itemProps[1]}>
                    {t('View site')}
                  </GlobalHeaderMenuItem>

                  <GlobalHeaderMenuItem href={`/s/${site.slug}/profile`} {...itemProps[2]}>
                    {t('Account')}
                  </GlobalHeaderMenuItem>
                  <GlobalHeaderMenuItem
                    href={`/s/${site.slug}/madoc/logout?${stringify({ redirect })}`}
                    {...itemProps[3]}
                  >
                    {t('Logout')}
                  </GlobalHeaderMenuItem>
                </>
              )}
            </GlobalHeaderMenuList>
          </GlobalHeaderMenuContainer>
        ) : (
          <UserBarLogout>
            <a href={`/s/${site.slug}/madoc/login?${stringify({ redirect })}`}>{t('Log in')}</a>
          </UserBarLogout>
        )}
      </UserBarContainer>
      <UserBarSpacer />
    </>
  );
};
