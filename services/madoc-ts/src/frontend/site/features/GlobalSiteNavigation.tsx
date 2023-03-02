import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { LightNavigation, LightNavigationItem } from '../../shared/navigation/LightNavigation';
import { LocaleString } from '../../shared/components/LocaleString';
import { useNavigationOptions, useUser } from '../../shared/hooks/use-site';
import { HrefLink } from '../../shared/utility/href-link';
import { useSiteConfiguration } from './SiteConfigurationContext';

export function GlobalSiteNavigation(props: { showHomepageMenu?: boolean }) {
  const location = useLocation();
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
      {props.showHomepageMenu ? (
        <LightNavigationItem $active={location.pathname === '/'}>
          <HrefLink href="/">{t('Home')}</HrefLink>
        </LightNavigationItem>
      ) : null}
      {showProjects ? (
        <LightNavigationItem $active={location.pathname.startsWith('/projects')}>
          <HrefLink href="/projects">{t('Projects')}</HrefLink>
        </LightNavigationItem>
      ) : null}
      {showCollections ? (
        <LightNavigationItem $active={location.pathname.startsWith('/collections')}>
          <HrefLink href="/collections">{t('Collections')}</HrefLink>
        </LightNavigationItem>
      ) : null}
      {showDashboard ? (
        <LightNavigationItem $active={location.pathname.startsWith('/dashboard')}>
          <HrefLink href="/dashboard">{t('User dashboard')}</HrefLink>
        </LightNavigationItem>
      ) : null}
      {showNavLinks &&
        navigation.map(nav => {
          return (
            <LightNavigationItem key={nav.id} $active={location.pathname === nav.path}>
              <HrefLink href={nav.path}>
                <LocaleString>{nav.navigationTitle ? nav.navigationTitle : nav.title}</LocaleString>
              </HrefLink>
            </LightNavigationItem>
          );
        })}
    </LightNavigation>
  );
}
