import React from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import { LightNavigation, LightNavigationItem } from '../../shared/navigation/LightNavigation';
import { LocaleString } from '../../shared/components/LocaleString';
import { useNavigationOptions, useUser } from '../../shared/hooks/use-site';
import { HrefLink } from '../../shared/utility/href-link';
import { useSiteConfiguration } from './SiteConfigurationContext';

export const GlobalSiteNavigation: React.FC = () => {
  const history = useHistory();
  const { t } = useTranslation();
  const user = useUser();
  const { navigation, project } = useSiteConfiguration();
  const { enableProjects, enableCollections } = useNavigationOptions();
  const showProjects = enableProjects && !project.headerOptions?.hideProjectsLink;
  const showCollections = enableCollections && !project.headerOptions?.hideCollectionsLink;
  const showDashboard = user && !project.headerOptions?.hideDashboardLink;
  const showNavLinks = !project.headerOptions?.hidePageNavLinks;

  return (
    <LightNavigation>
      {showProjects ? (
        <LightNavigationItem $active={history.location.pathname === '/projects'}>
          <HrefLink href="/projects">{t('Projects')}</HrefLink>
        </LightNavigationItem>
      ) : null}
      {showCollections ? (
        <LightNavigationItem $active={history.location.pathname === '/collections'}>
          <HrefLink href="/collections">{t('Collections')}</HrefLink>
        </LightNavigationItem>
      ) : null}
      {showDashboard ? (
        <LightNavigationItem $active={history.location.pathname === '/dashboard'}>
          <HrefLink href="/dashboard">{t('User dashboard')}</HrefLink>
        </LightNavigationItem>
      ) : null}
      {showNavLinks &&
        navigation.map(nav => {
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
