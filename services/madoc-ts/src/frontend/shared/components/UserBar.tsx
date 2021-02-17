import { stringify } from 'query-string';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';
import { PublicSite } from '../../../utility/omeka-api';
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
  const redirect = admin
    ? `/s/${site.slug}/madoc`
    : `/s/${site.slug}/madoc/${location.pathname}${query ? `?${stringify(query)}` : ''}`;
  const showAdmin = user && user.scope.indexOf('site.admin') !== -1;

  return (
    <>
      <UserBarContainer>
        {showAdmin && <UserBarAdminButton href={`/s/${site.slug}/madoc/admin`}>{t('Site admin')}</UserBarAdminButton>}
        <UserBarExpander />
        <LanguageSwitcher />
        {user ? (
          <>
            <UserBarUserDetails>
              Signed in as{' '}
              {admin ? (
                <a href={`/s/${site.slug}/madoc/dashboard`}>{user.name}</a>
              ) : (
                <HrefLink href="/dashboard">{user.name}</HrefLink>
              )}
            </UserBarUserDetails>
            <UserBarLogout>
              <a href={`/s/${site.slug}/madoc/logout?${stringify({ redirect })}`}>Logout</a>
            </UserBarLogout>
          </>
        ) : (
          <UserBarLogout>
            <a href={`/s/${site.slug}/madoc/login?${stringify({ redirect })}`}>Log in</a>
          </UserBarLogout>
        )}
      </UserBarContainer>
      <UserBarSpacer />
    </>
  );
};
