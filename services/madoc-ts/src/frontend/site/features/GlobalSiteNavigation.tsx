import React from 'react';
import { useHistory } from 'react-router-dom';
import { LightNavigation, LightNavigationItem } from '../../shared/atoms/LightNavigation';
import { useUser } from '../../shared/hooks/use-site';
import { HrefLink } from '../../shared/utility/href-link';

export const GlobalSiteNavigation: React.FC = () => {
  const history = useHistory();
  const user = useUser();

  return (
    <LightNavigation style={{ marginBottom: 15 }}>
      <LightNavigationItem $active={history.location.pathname === '/projects'}>
        <HrefLink href="/projects">Projects</HrefLink>
      </LightNavigationItem>
      <LightNavigationItem $active={history.location.pathname === '/collections'}>
        <HrefLink href="/collections">Collections</HrefLink>
      </LightNavigationItem>
      {user ? (
        <LightNavigationItem $active={history.location.pathname.startsWith('/dashboard')}>
          <HrefLink href="/dashboard">User dashboard</HrefLink>
        </LightNavigationItem>
      ) : null}
    </LightNavigation>
  );
};
