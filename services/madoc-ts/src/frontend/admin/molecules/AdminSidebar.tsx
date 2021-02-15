import React from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
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
  const { location } = useHistory();
  const { t } = useTranslation();

  const isDashboard = location.pathname === '/';
  const isManageCollections =
    location.pathname.startsWith('/collections') || location.pathname.startsWith('/import/collection');
  const isManageManifests =
    location.pathname.startsWith('/manifests') ||
    location.pathname.startsWith('/import/manifest') ||
    location.pathname.startsWith('/enrichment/ocr');
  const isProjects = location.pathname.startsWith('/projects');
  const isSearchIndexing = location.pathname.startsWith('/enrichment/search-indexing');
  const isSiteConfiguration = location.pathname.startsWith('/configure');

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
