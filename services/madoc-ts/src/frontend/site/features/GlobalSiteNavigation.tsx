import React from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import { LightNavigation, LightNavigationItem } from '../../shared/atoms/LightNavigation';
import { LocaleString } from '../../shared/components/LocaleString';
import { useNavigationOptions, useUser } from '../../shared/hooks/use-site';
import { HrefLink } from '../../shared/utility/href-link';
import { useSiteConfiguration } from './SiteConfigurationContext';

export const GlobalSiteNavigation: React.FC = () => {
  const history = useHistory();
  const { t } = useTranslation();
  const user = useUser();
  const { navigation } = useSiteConfiguration();
  const { enableProjects, enableCollections } = useNavigationOptions();

  return (
    <LightNavigation>
      {enableProjects ? (
        <LightNavigationItem $active={history.location.pathname === '/projects'}>
          <HrefLink href="/projects">{t('Projects')}</HrefLink>
        </LightNavigationItem>
      ) : null}
      {enableCollections ? (
        <LightNavigationItem $active={history.location.pathname === '/collections'}>
          <HrefLink href="/collections">{t('Collections')}</HrefLink>
        </LightNavigationItem>
      ) : null}
      {user ? (
        <LightNavigationItem $active={history.location.pathname === '/dashboard'}>
          <HrefLink href="/dashboard">{t('User dashboard')}</HrefLink>
        </LightNavigationItem>
      ) : null}
      {navigation.map(nav => {
        return (
          <LightNavigationItem key={nav.id} $active={history.location.pathname === nav.path}>
            <HrefLink href={nav.path}>
              <LocaleString>{nav.navigationTitle ? nav.navigationTitle : nav.title}</LocaleString>
            </HrefLink>
          </LightNavigationItem>
        );
      })}
    </LightNavigation>
  );
};
