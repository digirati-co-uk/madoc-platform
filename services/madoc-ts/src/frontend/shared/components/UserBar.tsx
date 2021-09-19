import { stringify } from 'query-string';
import React, { useEffect } from 'react';
import useDropdownMenu from 'react-accessible-dropdown-menu-hook';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';
import { useSiteConfiguration } from '../../site/features/SiteConfigurationContext';
import {
  GlobalHeaderMenuContainer,
  GlobalHeaderMenuItem,
  GlobalHeaderMenuLabel,
  GlobalHeaderMenuList,
} from '../navigation/GlobalHeader';
import { LanguageSwitcher } from '../navigation/LanguageSwitcher';
import { useLocationQuery } from '../hooks/use-location-query';
import { useSite, useSystemConfig } from '../hooks/use-site';
import { ArrowDownIcon } from '../icons/ArrowDownIcon';
import { HrefLink } from '../utility/href-link';
import { NotificationCenter } from './NotificationCenter';

const UserBarContainer = styled.div`
  height: 36px;
  background: #333;
  left: 0;
  right: 0;
  top: 0;
  color: #fff;
  display: flex;
  flex-direction: row;
  align-items: center;
  z-index: 11; // 10 = image viewer, this allows the notification center to be above.
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
    margin-left: 10px;
    color: #fff;
    text-decoration: underline;
  }
`;

const UserBarInstallation = styled.div`
  margin-right: 1em;
  color: rgba(255, 255, 255, 0.5);
`;

function useLoginRedirect(admin = false) {
  const site = useSite();
  const { location } = useHistory();
  const query = useLocationQuery();

  if (admin) {
    return `/s/${site.slug}`;
  }

  if (location.pathname === '/login' || location.pathname === '/register') {
    return `/s/${site.slug}`;
  }

  return `/s/${site.slug}/${location.pathname}${query ? `?${stringify(query)}` : ''}`;
}

export const UserBar: React.FC<{
  user?: { name: string; id: number; scope: string[] };
  admin?: boolean;
}> = ({ user, admin }) => {
  const { t } = useTranslation();
  const { location } = useHistory();
  const systemConfig = useSystemConfig();
  const redirect = useLoginRedirect(admin);
  const showAdmin = user && user.scope.indexOf('site.admin') !== -1;
  const { buttonProps, itemProps, isOpen, setIsOpen } = useDropdownMenu(showAdmin ? 5 : 4);
  const { editMode, setEditMode } = useSiteConfiguration();
  const site = useSite();
  const adminIdx = showAdmin ? 1 : 0;

  useEffect(() => {
    setIsOpen(false);
  }, [location, setIsOpen]);

  return (
    <>
      <UserBarContainer>
        <UserBarInstallation>{systemConfig.installationTitle}</UserBarInstallation>
        {showAdmin ? (
          admin ? (
            <UserBarAdminButton as={HrefLink} href={`/`}>
              {site.title}
            </UserBarAdminButton>
          ) : (
            <UserBarAdminButton href={`/s/${site.slug}/admin`}>{site.title}</UserBarAdminButton>
          )
        ) : admin ? (
          <UserBarAdminButton href={`/s/${site.slug}`}>{site.title}</UserBarAdminButton>
        ) : (
          <UserBarAdminButton as={HrefLink} href={`/`}>
            {site.title}
          </UserBarAdminButton>
        )}
        <UserBarExpander />

        {user ? <NotificationCenter isAdmin={admin} /> : null}

        {showAdmin && !admin ? (
          <GlobalHeaderMenuContainer>
            <GlobalHeaderMenuLabel onClick={() => setEditMode(!editMode)}>
              {editMode ? t('Exit edit mode') : t('Edit mode')}
            </GlobalHeaderMenuLabel>
          </GlobalHeaderMenuContainer>
        ) : null}

        <LanguageSwitcher />

        {user ? (
          <GlobalHeaderMenuContainer>
            <GlobalHeaderMenuLabel {...buttonProps}>
              {user.name} <ArrowDownIcon style={{ fill: '#fff', fontSize: '1em', transform: 'translateY(2px)' }} />
            </GlobalHeaderMenuLabel>
            <GlobalHeaderMenuList $visible={isOpen} role="menu">
              {admin ? (
                <>
                  {showAdmin ? (
                    <GlobalHeaderMenuItem as={HrefLink} href={`/`} {...itemProps[0]}>
                      {t('Site admin')}
                    </GlobalHeaderMenuItem>
                  ) : null}
                  <GlobalHeaderMenuItem href={`/s/${site.slug}/dashboard`} {...itemProps[0 + adminIdx]}>
                    {t('Dashboard')}
                  </GlobalHeaderMenuItem>
                  <GlobalHeaderMenuItem href={`/s/${site.slug}`} {...itemProps[1 + adminIdx]}>
                    {t('View site')}
                  </GlobalHeaderMenuItem>

                  <GlobalHeaderMenuItem href={`/s/${site.slug}/profile`} {...itemProps[2 + adminIdx]}>
                    {t('Account')}
                  </GlobalHeaderMenuItem>
                  <GlobalHeaderMenuItem
                    href={`/s/${site.slug}/logout?${stringify({ redirect })}`}
                    {...itemProps[3 + adminIdx]}
                  >
                    {t('Logout')}
                  </GlobalHeaderMenuItem>
                </>
              ) : (
                <>
                  {showAdmin ? (
                    <GlobalHeaderMenuItem as="a" href={`/s/${site.slug}/admin`} {...itemProps[0]}>
                      {t('Site admin')}
                    </GlobalHeaderMenuItem>
                  ) : null}
                  <GlobalHeaderMenuItem as={HrefLink} href={`/dashboard`} {...itemProps[0 + adminIdx]}>
                    {t('Dashboard')}
                  </GlobalHeaderMenuItem>
                  <GlobalHeaderMenuItem as={HrefLink} href={`/`} {...itemProps[1 + adminIdx]}>
                    {t('View site')}
                  </GlobalHeaderMenuItem>

                  <GlobalHeaderMenuItem as={HrefLink} href={`/profile`} {...itemProps[2 + adminIdx]}>
                    {t('Account')}
                  </GlobalHeaderMenuItem>
                  <GlobalHeaderMenuItem
                    href={`/s/${site.slug}/logout?${stringify({ redirect })}`}
                    {...itemProps[3 + adminIdx]}
                  >
                    {t('Logout')}
                  </GlobalHeaderMenuItem>
                </>
              )}
            </GlobalHeaderMenuList>
          </GlobalHeaderMenuContainer>
        ) : (
          <UserBarLogout>
            {systemConfig.enableRegistrations ? <HrefLink href={`/register`}>{t('Register')}</HrefLink> : null}
            <HrefLink href={`/login?${stringify({ redirect })}`}>{t('Log in')}</HrefLink>
          </UserBarLogout>
        )}
      </UserBarContainer>
    </>
  );
};
