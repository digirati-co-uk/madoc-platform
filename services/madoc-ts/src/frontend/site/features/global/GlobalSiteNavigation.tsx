import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { LightNavigation, LightNavigationItem } from '../../../shared/navigation/LightNavigation';
import { LocaleString } from '../../../shared/components/LocaleString';
import { useNavigationOptions, useUser } from '../../../shared/hooks/use-site';
import { HrefLink } from '../../../shared/utility/href-link';
import { useSiteConfiguration } from '../SiteConfigurationContext';

export function GlobalSiteNavigation(props: {
  showHomepageMenu?: boolean;
  extraNavItems?: {
    slug?: string;
    text?: string;
  }[];
}) {
  const location = useLocation();
  const { t } = useTranslation();
  const user = useUser();
  const { navigation, project } = useSiteConfiguration();
  const { enableProjects, enableCollections } = useNavigationOptions();
  const showProjects = enableProjects && !project.headerOptions?.hideProjectsLink;
  const showCollections = enableCollections && !project.headerOptions?.hideCollectionsLink;
  const showDashboard = user && !project.headerOptions?.hideDashboardLink;
  const showNavLinks = !project.headerOptions?.hidePageNavLinks;
  const showReviews = !!project.headerOptions?.showReviews;
  const isExtraActive = props.extraNavItems ? props.extraNavItems.some(i => i.slug === location.pathname) : false;

  return (
    <LightNavigation>
      {props.showHomepageMenu ? (
        <LightNavigationItem $active={location.pathname === '/'}>
          <HrefLink href="/">{t('Home')}</HrefLink>
        </LightNavigationItem>
      ) : null}
      {showProjects ? (
        <LightNavigationItem $active={location.pathname.startsWith('/projects') && !isExtraActive}>
          <HrefLink href="/projects">{t('Projects')}</HrefLink>
        </LightNavigationItem>
      ) : null}
      {showCollections ? (
        <LightNavigationItem $active={location.pathname.startsWith('/collections') && !isExtraActive}>
          <HrefLink href="/collections">{t('Collections')}</HrefLink>
        </LightNavigationItem>
      ) : null}
      {showDashboard ? (
        <LightNavigationItem $active={location.pathname.startsWith('/dashboard') && !isExtraActive}>
          <HrefLink href="/dashboard">{t('User dashboard')}</HrefLink>
        </LightNavigationItem>
      ) : null}
      {showReviews ? (
        <LightNavigationItem $active={location.pathname.startsWith('/reviews') && !isExtraActive}>
          <HrefLink href="/reviews">{t('Reviews')}</HrefLink>
        </LightNavigationItem>
      ) : null}
      {props.extraNavItems?.length
        ? props.extraNavItems.map((item, i) => {
            return (
              item.slug && (
                <LightNavigationItem key={i} $active={location.pathname === item.slug}>
                  <HrefLink href={item.slug}>{item.text ? t(item.text) : item.slug}</HrefLink>
                </LightNavigationItem>
              )
            );
          })
        : null}
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
