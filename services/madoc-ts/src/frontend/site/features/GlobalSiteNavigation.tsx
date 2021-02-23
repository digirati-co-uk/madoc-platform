import React from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import { LightNavigation, LightNavigationItem } from '../../shared/atoms/LightNavigation';
import { LocaleString } from '../../shared/components/LocaleString';
import { HrefLink } from '../../shared/utility/href-link';
import { useSiteConfiguration } from './SiteConfigurationContext';

export const GlobalSiteNavigation: React.FC = () => {
  const history = useHistory();
  const { t } = useTranslation();
  const { navigation } = useSiteConfiguration();

  return (
    <LightNavigation>
      <LightNavigationItem $active={history.location.pathname === '/projects'}>
        <HrefLink href="/projects">{t('Projects')}</HrefLink>
      </LightNavigationItem>
      <LightNavigationItem $active={history.location.pathname === '/collections'}>
        <HrefLink href="/collections">{t('Collections')}</HrefLink>
      </LightNavigationItem>
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
