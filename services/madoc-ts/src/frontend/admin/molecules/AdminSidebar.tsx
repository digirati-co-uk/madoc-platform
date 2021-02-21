import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory, useLocation } from 'react-router-dom';
import {
  AdminMenuContainer,
  AdminMenuItem,
  AdminMenuItemContainer,
  AdminMenuItemIcon,
  AdminMenuItemLabel,
  AdminMenuSubItem,
  AdminMenuSubItemContainer,
  AdminSearchIcon,
  AdminSidebarContainer,
  DashboardIcon,
  InternationalisationIcon,
  ManageCollectionsIcon,
  ManageManifestsIcon,
  ProjectsIcon,
  SiteConfigurationIcon,
  SiteSwitcherBackButton,
  SiteSwitcherContainer,
  SiteSwitcherSiteName,
} from '../../shared/components/AdminMenu';
import { useSite } from '../../shared/hooks/use-site';
import { HrefLink } from '../../shared/utility/href-link';

export const AdminSidebar: React.FC = () => {
  const site = useSite();
  const location = useLocation();
  const { t } = useTranslation();

  const pathname = location.pathname;

  const {
    isSiteConfiguration,
    isSearchIndexing,
    isProjects,
    isManageCollections,
    isDashboard,
    isManageManifests,
    isLocalisation,
  } = useMemo(() => {
    return {
      isDashboard: pathname === '/',
      isManageCollections: pathname.startsWith('/collections') || pathname.startsWith('/import/collection'),
      isManageManifests:
        pathname.startsWith('/manifests') ||
        pathname.startsWith('/import/manifest') ||
        pathname.startsWith('/enrichment/ocr'),
      isProjects: pathname.startsWith('/projects'),
      isSearchIndexing: pathname.startsWith('/enrichment/search-indexing'),
      isSiteConfiguration: pathname.startsWith('/configure'),
      isLocalisation: pathname.startsWith('/i18n'),
    };
  }, [pathname]);

  return (
    <AdminSidebarContainer>
      <SiteSwitcherContainer>
        <SiteSwitcherSiteName>{site.title}</SiteSwitcherSiteName>
        <SiteSwitcherBackButton as="a" href={`/s/${site.slug}/madoc`}>
          {t('Back to site')}
        </SiteSwitcherBackButton>
      </SiteSwitcherContainer>

      <AdminMenuContainer>
        <AdminMenuItemContainer>
          <AdminMenuItem as={HrefLink} href={'/'} $active={isDashboard}>
            <AdminMenuItemIcon>
              <DashboardIcon />
            </AdminMenuItemIcon>
            <AdminMenuItemLabel>{t('Admin dashboard')}</AdminMenuItemLabel>
          </AdminMenuItem>
        </AdminMenuItemContainer>

        <AdminMenuItemContainer>
          <AdminMenuItem as={HrefLink} href="/collections" $active={isManageCollections}>
            <AdminMenuItemIcon>
              <ManageCollectionsIcon />
            </AdminMenuItemIcon>
            <AdminMenuItemLabel>{t('Manage collections', { count: 2 })}</AdminMenuItemLabel>
          </AdminMenuItem>

          <AdminMenuSubItemContainer $open={isManageCollections}>
            <AdminMenuSubItem as={HrefLink} href="/import/collection">
              {t('Add new collection')}
            </AdminMenuSubItem>
          </AdminMenuSubItemContainer>
        </AdminMenuItemContainer>

        <AdminMenuItemContainer>
          <AdminMenuItem as={HrefLink} href="/manifests" $active={isManageManifests}>
            <AdminMenuItemIcon>
              <ManageManifestsIcon />
            </AdminMenuItemIcon>
            <AdminMenuItemLabel>{t('Manage manifests', { count: 2 })}</AdminMenuItemLabel>
          </AdminMenuItem>

          <AdminMenuSubItemContainer>
            <AdminMenuSubItem as={HrefLink} href="/import/manifest">
              {t('Add new manifest')}
            </AdminMenuSubItem>
            <AdminMenuSubItem as={HrefLink} href="/enrichement/ocr">
              {t('View manifests with OCR')}
            </AdminMenuSubItem>
          </AdminMenuSubItemContainer>
        </AdminMenuItemContainer>

        <AdminMenuItemContainer>
          <AdminMenuItem as={HrefLink} href="/projects" $active={isProjects}>
            <AdminMenuItemIcon>
              <ProjectsIcon />
            </AdminMenuItemIcon>
            <AdminMenuItemLabel>{t('Projects', { count: 2 })}</AdminMenuItemLabel>
          </AdminMenuItem>
        </AdminMenuItemContainer>

        <AdminMenuItemContainer>
          <AdminMenuItem as={HrefLink} href="/enrichment/search-indexing" $active={isSearchIndexing}>
            <AdminMenuItemIcon>
              <AdminSearchIcon />
            </AdminMenuItemIcon>
            <AdminMenuItemLabel>{t('Search indexing')}</AdminMenuItemLabel>
          </AdminMenuItem>
        </AdminMenuItemContainer>

        <AdminMenuItemContainer>
          <AdminMenuItem as={HrefLink} href="/i18n" $active={isLocalisation}>
            <AdminMenuItemIcon>
              <InternationalisationIcon />
            </AdminMenuItemIcon>
            <AdminMenuItemLabel>{t('Localisation')}</AdminMenuItemLabel>
          </AdminMenuItem>
        </AdminMenuItemContainer>

        <AdminMenuItemContainer>
          <AdminMenuItem as={HrefLink} href="/configure/site" $active={isSiteConfiguration}>
            <AdminMenuItemIcon>
              <SiteConfigurationIcon />
            </AdminMenuItemIcon>
            <AdminMenuItemLabel>{t('Site configuration')}</AdminMenuItemLabel>
          </AdminMenuItem>
        </AdminMenuItemContainer>
      </AdminMenuContainer>
    </AdminSidebarContainer>
  );
};
