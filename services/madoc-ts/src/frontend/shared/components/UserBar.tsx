import React from 'react';
import styled from 'styled-components';
import { PublicSite } from '../../../utility/omeka-api';
import { HrefLink } from '../utility/href-link';

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

export const UserBar: React.FC<{ site: PublicSite; user?: { name: string; id: number }; admin?: boolean }> = ({
  user,
  site,
  admin,
}) => {
  return (
    <>
      <UserBarContainer>
        <UserBarAdminButton href={`/s/${site.slug}/madoc/admin`}>Site admin</UserBarAdminButton>
        <UserBarExpander />
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
              <a href={`/s/${site.slug}/madoc/logout`}>Logout</a>
            </UserBarLogout>
          </>
        ) : (
          <UserBarLogout>
            <a href={`/s/${site.slug}/madoc/login`}>Log in</a>
          </UserBarLogout>
        )}
      </UserBarContainer>
      <UserBarSpacer />
    </>
  );
};
