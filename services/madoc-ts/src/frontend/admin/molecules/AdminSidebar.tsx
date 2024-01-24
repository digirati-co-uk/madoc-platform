import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { ModelDocumentIcon } from '../../shared/icons/ModelDocumentIcon';
import {
  AdminMenuContainer,
  AdminMenuItem,
  AdminMenuItemContainer,
  AdminMenuItemIcon,
  AdminMenuItemLabel,
  AdminMenuSubItem,
  AdminMenuSubItemContainer,
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
} from '../components/AdminMenu';
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
    isProjects,
    isManageCollections,
    isDashboard,
    isManageManifests,
    isLocalisation,
    isMedia,
    isPageBlocks,
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
      isPageBlocks: pathname.startsWith('/page-blocks'),
      isSiteConfiguration:
        pathname.startsWith('/configure') ||
        pathname.startsWith('/system') ||
        pathname.startsWith('/site') ||
        pathname.startsWith('/enrichment/search-indexing'),
      isLocalisation: pathname.startsWith('/i18n'),
      isMedia: pathname.startsWith('/media'),
      isSiteGlobal: pathname.startsWith('/global'),
    };
  }, [pathname]);

  return (
    <AdminSidebarContainer>
      <SiteSwitcherContainer>
        <SiteSwitcherSiteName>{site.title}</SiteSwitcherSiteName>
        <SiteSwitcherBackButton as="a" href={`/s/${site.slug}`}>
          {t('Back to site')}
        </SiteSwitcherBackButton>
      </SiteSwitcherContainer>

      <AdminMenuContainer>
        <AdminMenuItemContainer>
          <AdminMenuItem as={HrefLink} href={'/'} $active={isDashboard}>
            <AdminMenuItemIcon>
              <DashboardIcon />
            </AdminMenuItemIcon>
            <AdminMenuItemLabel>{t('Dashboard')}</AdminMenuItemLabel>
          </AdminMenuItem>
        </AdminMenuItemContainer>

        <AdminMenuItemContainer>
          <AdminMenuItem as={HrefLink} href="/manifests" $active={isManageManifests}>
            <AdminMenuItemIcon>
              <ManageManifestsIcon />
            </AdminMenuItemIcon>
            <AdminMenuItemLabel>{t('Manifests', { count: 2 })}</AdminMenuItemLabel>
          </AdminMenuItem>

          <AdminMenuSubItemContainer $open={isManageManifests}>
            <AdminMenuSubItem as={HrefLink} href="/import/manifest">
              {t('Import manifest')}
            </AdminMenuSubItem>
            <AdminMenuSubItem as={HrefLink} href="/enrichment/ocr">
              {t('View manifests with OCR')}
            </AdminMenuSubItem>
          </AdminMenuSubItemContainer>
        </AdminMenuItemContainer>

        <AdminMenuItemContainer>
          <AdminMenuItem as={HrefLink} href="/collections" $active={isManageCollections}>
            <AdminMenuItemIcon>
              <ManageCollectionsIcon />
            </AdminMenuItemIcon>
            <AdminMenuItemLabel>{t('Collections', { count: 2 })}</AdminMenuItemLabel>
          </AdminMenuItem>

          <AdminMenuSubItemContainer $open={isManageCollections}>
            <AdminMenuSubItem as={HrefLink} href="/import/collection/create">
              {t('Create new collection')}
            </AdminMenuSubItem>
            <AdminMenuSubItem as={HrefLink} href="/import/collection">
              {t('Import collection')}
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
          <AdminMenuItem as={HrefLink} href="/media" $active={isMedia}>
            <AdminMenuItemIcon>
              <MediaIcon />
            </AdminMenuItemIcon>
            <AdminMenuItemLabel>{t('Media')}</AdminMenuItemLabel>
          </AdminMenuItem>
        </AdminMenuItemContainer>

        <AdminMenuItemContainer>
          <AdminMenuItem as={HrefLink} href="/page-blocks" $active={isPageBlocks}>
            <AdminMenuItemIcon>
              <ModelDocumentIcon color="#fff" />
            </AdminMenuItemIcon>
            <AdminMenuItemLabel>{t('Site pages')}</AdminMenuItemLabel>
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
            <AdminMenuSubItem as={HrefLink} href="/site/details">
              {t('Site details')}
            </AdminMenuSubItem>
            <AdminMenuSubItem as={HrefLink} href="/configure/site/project">
              {t('Site default project configuration')}
            </AdminMenuSubItem>
            <AdminMenuSubItem as={HrefLink} href="/configure/site/metadata">
              {t('Site metadata display configuration')}
            </AdminMenuSubItem>
            <AdminMenuSubItem as={HrefLink} href="/configure/site/system">
              {t('Site general configuration')}
            </AdminMenuSubItem>
            <AdminMenuSubItem as={HrefLink} href="/enrichment/search-indexing">
              {t('Site search indexing')}
            </AdminMenuSubItem>
            {isGlobalAdmin ? (
              <AdminMenuSubItem as={HrefLink} href="/system/themes">
                {t('Themes')}
              </AdminMenuSubItem>
            ) : null}
            <AdminMenuSubItem as={HrefLink} href="/site/annotation-styles">
              {t('Annotation styles')}
            </AdminMenuSubItem>
            <AdminMenuSubItem as={HrefLink} href="/site/permissions">
              {t('Site permissions')}
            </AdminMenuSubItem>
            <AdminMenuSubItem as={HrefLink} href="/configure/site/terms-and-conditions">
              {t('Site terms and conditions')}
            </AdminMenuSubItem>
            <AdminMenuSubItem as={HrefLink} href="/configure/site/terms">
              {t('External terms list')}
            </AdminMenuSubItem>
            <AdminMenuSubItem as={HrefLink} href="/site/invitations">
              {t('Invitations')}
            </AdminMenuSubItem>
            {isGlobalAdmin ? (
              <AdminMenuSubItem as={HrefLink} href="/system/plugins">
                {t('Plugins')}
              </AdminMenuSubItem>
            ) : null}
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
              <AdminMenuSubItem as={HrefLink} href="/global/api-keys">
                {t('API keys')}
              </AdminMenuSubItem>
              <AdminMenuSubItem as={HrefLink} href="/global/status">
                {t('System status')}
              </AdminMenuSubItem>
              <AdminMenuSubItem as={HrefLink} href="/global/config">
                {t('Global config')}
              </AdminMenuSubItem>
            </AdminMenuSubItemContainer>
          </AdminMenuItemContainer>
        ) : null}
      </AdminMenuContainer>
    </AdminSidebarContainer>
  );
};
