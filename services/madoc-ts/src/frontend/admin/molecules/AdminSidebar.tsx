import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
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
  MediaIcon,
  ProjectsIcon,
  SiteConfigurationIcon,
  SiteGlobIcon,
  SiteSwitcherBackButton,
  SiteSwitcherContainer,
  SiteSwitcherSiteName,
} from '../../shared/components/AdminMenu';
import { useSite, useUser } from '../../shared/hooks/use-site';
import { HrefLink } from '../../shared/utility/href-link';

export const AdminSidebar: React.FC = () => {
  const site = useSite();
  const location = useLocation();
  const { t } = useTranslation();
  const user = useUser();

  const isGlobalAdmin = user?.role === 'global_admin';

  const pathname = location.pathname;

  const {
    isSiteConfiguration,
    isSearchIndexing,
    isProjects,
    isManageCollections,
    isDashboard,
    isManageManifests,
    isLocalisation,
    isMedia,
    isSiteGlobal,
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
      isSiteConfiguration:
        pathname.startsWith('/configure') || pathname.startsWith('/system') || pathname.startsWith('/site'),
      isLocalisation: pathname.startsWith('/i18n'),
      isMedia: pathname.startsWith('/media'),
      isSiteGlobal: pathname.startsWith('/global'),
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

          <AdminMenuSubItemContainer $open={isManageManifests}>
            <AdminMenuSubItem as={HrefLink} href="/import/manifest">
              {t('Add new manifest')}
            </AdminMenuSubItem>
            <AdminMenuSubItem as={HrefLink} href="/enrichement/ocr">
              {t('View manifests with OCR')}
            </AdminMenuSubItem>
          </AdminMenuSubItemContainer>
        </AdminMenuItemContainer>

        <AdminMenuItemContainer>
          <AdminMenuItem as={HrefLink} href="/media" $active={isMedia}>
            <AdminMenuItemIcon>
              <MediaIcon />
            </AdminMenuItemIcon>
            <AdminMenuItemLabel>{t('Media')}</AdminMenuItemLabel>
          </AdminMenuItem>
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

          <AdminMenuSubItemContainer $open={isSiteConfiguration}>
            <AdminMenuSubItem as={HrefLink} href="/configure/site/metadata">
              {t('Configure metadata')}
            </AdminMenuSubItem>
            <AdminMenuSubItem as={HrefLink} href="/site/details">
              {t('Site name')}
            </AdminMenuSubItem>
            <AdminMenuSubItem as={HrefLink} href="/system/plugins">
              {t('Plugins')}
            </AdminMenuSubItem>
            <AdminMenuSubItem as={HrefLink} href="/system/themes">
              {t('Themes')}
            </AdminMenuSubItem>
            <AdminMenuSubItem as={HrefLink} href="/site/permissions">
              {t('Permissions')}
            </AdminMenuSubItem>
            <AdminMenuSubItem as={HrefLink} href="/site/invitations">
              {t('Invitations')}
            </AdminMenuSubItem>
          </AdminMenuSubItemContainer>
        </AdminMenuItemContainer>

        {isGlobalAdmin ? (
          <AdminMenuItemContainer>
            <AdminMenuItem as={HrefLink} href="/global/sites" $active={isSiteGlobal}>
              <AdminMenuItemIcon>
                <SiteGlobIcon />
              </AdminMenuItemIcon>
              <AdminMenuItemLabel>{t('Global')}</AdminMenuItemLabel>
            </AdminMenuItem>

            <AdminMenuSubItemContainer $open={isSiteGlobal}>
              <AdminMenuSubItem as={HrefLink} href="/global/sites">
                {t('All sites')}
              </AdminMenuSubItem>
              <AdminMenuSubItem as={HrefLink} href="/global/sites/create">
                {t('Create  site')}
              </AdminMenuSubItem>
              <AdminMenuSubItem as={HrefLink} href="/global/users">
                {t('All users')}
              </AdminMenuSubItem>
              <AdminMenuSubItem as={HrefLink} href="/global/users/create">
                {t('Create user')}
              </AdminMenuSubItem>
              <AdminMenuSubItem as={HrefLink} href="/global/status">
                {t('System status')}
              </AdminMenuSubItem>
            </AdminMenuSubItemContainer>
          </AdminMenuItemContainer>
        ) : null}
      </AdminMenuContainer>
    </AdminSidebarContainer>
  );
};
