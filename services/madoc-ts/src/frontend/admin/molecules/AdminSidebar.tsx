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
        pathname.startsWith('/enrichment/search-indexing') ||
        pathname.startsWith('/enrichment/typesense-playground'),
      isLocalisation: pathname.startsWith('/i18n'),
      isMedia: pathname.startsWith('/media'),
      isSiteGlobal: pathname.startsWith('/global'),
    };
  }, [pathname]);

  return (
    <AdminSidebarContainer className="madoc-admin-sidebar">
      <SiteSwitcherContainer data-admin-switcher>
        <SiteSwitcherSiteName>{site.title}</SiteSwitcherSiteName>
        <SiteSwitcherBackButton as="a" href={`/s/${site.slug}`}>
          {t('Back to site')}
        </SiteSwitcherBackButton>
      </SiteSwitcherContainer>

      <AdminMenuContainer>
        <AdminMenuItemContainer>
          <AdminMenuItem as={HrefLink} href={'/'} $active={isDashboard} data-active={isDashboard}>
            <AdminMenuItemIcon>
              <DashboardIcon />
            </AdminMenuItemIcon>
            <AdminMenuItemLabel>{t('Dashboard')}</AdminMenuItemLabel>
          </AdminMenuItem>
        </AdminMenuItemContainer>

        <AdminMenuItemContainer>
          <AdminMenuItem as={HrefLink} href="/manifests" $active={isManageManifests} data-active={isManageManifests}>
            <AdminMenuItemIcon>
              <ManageManifestsIcon />
            </AdminMenuItemIcon>
            <AdminMenuItemLabel>{t('Manifests', { count: 2 })}</AdminMenuItemLabel>
          </AdminMenuItem>

          <AdminMenuSubItemContainer $open={isManageManifests} data-admin-submenu>
            <AdminMenuSubItem
              as={HrefLink}
              href="/import/manifest"
              aria-current={pathname === '/import/manifest' ? 'page' : undefined}
            >
              {t('Import manifest')}
            </AdminMenuSubItem>
            <AdminMenuSubItem
              as={HrefLink}
              href="/enrichment/ocr"
              aria-current={pathname === '/enrichment/ocr' ? 'page' : undefined}
            >
              {t('View manifests with OCR text')}
            </AdminMenuSubItem>
          </AdminMenuSubItemContainer>
        </AdminMenuItemContainer>

        <AdminMenuItemContainer>
          <AdminMenuItem
            as={HrefLink}
            href="/collections"
            $active={isManageCollections}
            data-active={isManageCollections}
          >
            <AdminMenuItemIcon>
              <ManageCollectionsIcon />
            </AdminMenuItemIcon>
            <AdminMenuItemLabel>{t('Collections', { count: 2 })}</AdminMenuItemLabel>
          </AdminMenuItem>

          <AdminMenuSubItemContainer $open={isManageCollections} data-admin-submenu>
            <AdminMenuSubItem
              as={HrefLink}
              href="/import/collection/create"
              aria-current={pathname === '/import/collection/create' ? 'page' : undefined}
            >
              {t('Create new collection')}
            </AdminMenuSubItem>
            <AdminMenuSubItem
              as={HrefLink}
              href="/import/collection"
              aria-current={pathname === '/import/collection' ? 'page' : undefined}
            >
              {t('Import collection')}
            </AdminMenuSubItem>
          </AdminMenuSubItemContainer>
        </AdminMenuItemContainer>

        <AdminMenuItemContainer>
          <AdminMenuItem as={HrefLink} href="/projects" $active={isProjects} data-active={isProjects}>
            <AdminMenuItemIcon>
              <ProjectsIcon />
            </AdminMenuItemIcon>
            <AdminMenuItemLabel>{t('Projects', { count: 2 })}</AdminMenuItemLabel>
          </AdminMenuItem>
        </AdminMenuItemContainer>

        <AdminMenuItemContainer>
          <AdminMenuItem as={HrefLink} href="/media" $active={isMedia} data-active={isMedia}>
            <AdminMenuItemIcon>
              <MediaIcon />
            </AdminMenuItemIcon>
            <AdminMenuItemLabel>{t('Media')}</AdminMenuItemLabel>
          </AdminMenuItem>
        </AdminMenuItemContainer>

        <AdminMenuItemContainer>
          <AdminMenuItem as={HrefLink} href="/page-blocks" $active={isPageBlocks} data-active={isPageBlocks}>
            <AdminMenuItemIcon>
              <ModelDocumentIcon color="#fff" />
            </AdminMenuItemIcon>
            <AdminMenuItemLabel>{t('Site pages')}</AdminMenuItemLabel>
          </AdminMenuItem>
        </AdminMenuItemContainer>

        <AdminMenuItemContainer>
          <AdminMenuItem as={HrefLink} href="/i18n" $active={isLocalisation} data-active={isLocalisation}>
            <AdminMenuItemIcon>
              <InternationalisationIcon />
            </AdminMenuItemIcon>
            <AdminMenuItemLabel>{t('Localisation')}</AdminMenuItemLabel>
          </AdminMenuItem>
        </AdminMenuItemContainer>

        <AdminMenuItemContainer>
          <AdminMenuItem
            as={HrefLink}
            href="/configure/site"
            $active={isSiteConfiguration}
            data-active={isSiteConfiguration}
          >
            <AdminMenuItemIcon>
              <SiteConfigurationIcon data-current-color />
            </AdminMenuItemIcon>
            <AdminMenuItemLabel>{t('Site configuration')}</AdminMenuItemLabel>
          </AdminMenuItem>

          <AdminMenuSubItemContainer $open={isSiteConfiguration} data-admin-submenu>
            <AdminMenuSubItem
              as={HrefLink}
              href="/site/details"
              aria-current={pathname === '/site/details' ? 'page' : undefined}
            >
              {t('Site details')}
            </AdminMenuSubItem>
            <AdminMenuSubItem
              as={HrefLink}
              href="/configure/site/system"
              aria-current={pathname === '/configure/site/system' ? 'page' : undefined}
            >
              {t('Site general configuration')}
            </AdminMenuSubItem>
            <AdminMenuSubItem
              as={HrefLink}
              href="/configure/site/project"
              aria-current={pathname === '/configure/site/project' ? 'page' : undefined}
            >
              {t('Site default project configuration')}
            </AdminMenuSubItem>
            <AdminMenuSubItem
              as={HrefLink}
              href="/configure/site/metadata"
              aria-current={pathname === '/configure/site/metadata' ? 'page' : undefined}
            >
              {t('Site metadata display configuration')}
            </AdminMenuSubItem>
            <AdminMenuSubItem
              as={HrefLink}
              href="/enrichment/search-indexing"
              aria-current={pathname === '/enrichment/search-indexing' ? 'page' : undefined}
            >
              {t('Site search indexing')}
            </AdminMenuSubItem>
            <AdminMenuSubItem
              as={HrefLink}
              href="/enrichment/typesense-playground"
              aria-current={pathname === '/enrichment/typesense-playground' ? 'page' : undefined}
            >
              {t('Typesense playground')}
            </AdminMenuSubItem>
            {isGlobalAdmin ? (
              <AdminMenuSubItem
                as={HrefLink}
                href="/system/themes"
                aria-current={pathname === '/system/themes' ? 'page' : undefined}
              >
                {t('Themes')}
              </AdminMenuSubItem>
            ) : null}
            <AdminMenuSubItem
              as={HrefLink}
              href="/configure/site/terms-and-conditions"
              aria-current={pathname === '/configure/site/terms-and-conditions' ? 'page' : undefined}
            >
              {t('Site terms and conditions')}
            </AdminMenuSubItem>
            <AdminMenuSubItem
              as={HrefLink}
              href="/site/invitations"
              aria-current={pathname === '/site/invitations' ? 'page' : undefined}
            >
              {t('User Invitations')}
            </AdminMenuSubItem>
            <AdminMenuSubItem
              as={HrefLink}
              href="/site/permissions"
              aria-current={pathname === '/site/permissions' ? 'page' : undefined}
            >
              {t('Site permissions')}
            </AdminMenuSubItem>
            <AdminMenuSubItem
              as={HrefLink}
              href="/configure/site/terms"
              aria-current={pathname === '/configure/site/terms' ? 'page' : undefined}
            >
              {t('External terms list')}
            </AdminMenuSubItem>
            <AdminMenuSubItem
              as={HrefLink}
              href="/site/annotation-styles"
              aria-current={pathname === '/site/annotation-styles' ? 'page' : undefined}
            >
              {t('Annotation styles')}
            </AdminMenuSubItem>
            {isGlobalAdmin ? (
              <AdminMenuSubItem
                as={HrefLink}
                href="/system/plugins"
                aria-current={pathname === '/system/plugins' ? 'page' : undefined}
              >
                {t('Plugins')}
              </AdminMenuSubItem>
            ) : null}
          </AdminMenuSubItemContainer>
        </AdminMenuItemContainer>

        {isGlobalAdmin ? (
          <AdminMenuItemContainer>
            <AdminMenuItem as={HrefLink} href="/global/sites" $active={isSiteGlobal} data-active={isSiteGlobal}>
              <AdminMenuItemIcon>
                <SiteGlobIcon />
              </AdminMenuItemIcon>
              <AdminMenuItemLabel>{t('Global')}</AdminMenuItemLabel>
            </AdminMenuItem>

            <AdminMenuSubItemContainer $open={isSiteGlobal} data-admin-submenu>
              <AdminMenuSubItem
                as={HrefLink}
                href="/global/config"
                aria-current={pathname === '/global/config' ? 'page' : undefined}
              >
                {t('Global config')}
              </AdminMenuSubItem>
              <AdminMenuSubItem
                as={HrefLink}
                href="/global/sites"
                aria-current={pathname === '/global/sites' ? 'page' : undefined}
              >
                {t('All sites')}
              </AdminMenuSubItem>
              <AdminMenuSubItem
                as={HrefLink}
                href="/global/sites/create"
                aria-current={pathname === '/global/sites/create' ? 'page' : undefined}
              >
                {t('Create site')}
              </AdminMenuSubItem>
              <AdminMenuSubItem
                as={HrefLink}
                href="/global/users"
                aria-current={pathname === '/global/users' ? 'page' : undefined}
              >
                {t('All users')}
              </AdminMenuSubItem>
              <AdminMenuSubItem
                as={HrefLink}
                href="/global/users/create"
                aria-current={pathname === '/global/users/create' ? 'page' : undefined}
              >
                {t('Create user')}
              </AdminMenuSubItem>
              <AdminMenuSubItem
                as={HrefLink}
                href="/global/status"
                aria-current={pathname === '/global/status' ? 'page' : undefined}
              >
                {t('System status')}
              </AdminMenuSubItem>
              <AdminMenuSubItem
                as={HrefLink}
                href="/global/logs"
                aria-current={pathname === '/global/logs' ? 'page' : undefined}
              >
                {t('Process logs')}
              </AdminMenuSubItem>
              <AdminMenuSubItem
                as={HrefLink}
                href="/global/queue"
                aria-current={pathname === '/global/queue' ? 'page' : undefined}
              >
                {t('Queue inspector')}
              </AdminMenuSubItem>
              <AdminMenuSubItem
                as={HrefLink}
                href="/global/api-keys"
                aria-current={pathname === '/global/api-keys' ? 'page' : undefined}
              >
                {t('API keys')}
              </AdminMenuSubItem>
            </AdminMenuSubItemContainer>
          </AdminMenuItemContainer>
        ) : null}
      </AdminMenuContainer>
    </AdminSidebarContainer>
  );
};
