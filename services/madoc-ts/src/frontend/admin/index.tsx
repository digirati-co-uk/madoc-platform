import React, { useMemo } from 'react';
import { useHistory } from 'react-router-dom';
import { ApiClient } from '../../gateway/api';
import { useTranslation } from 'react-i18next';
import { PublicSite } from '../../utility/omeka-api';
import { GlobalStyles } from '../shared/atoms/GlobalStyles';
import {
  AdminLayoutContainer,
  AdminLayoutMain,
  AdminLayoutMenu,
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
} from '../shared/components/AdminMenu';
import { UserBar } from '../shared/components/UserBar';
import { HrefLink } from '../shared/utility/href-link';
import { renderUniversalRoutes } from '../shared/utility/server-utils';
import { ApiContext, useIsApiRestarting } from '../shared/hooks/use-api';
import { ErrorMessage } from '../shared/atoms/ErrorMessage';
import { UniversalRoute } from '../types';
import '../shared/caputre-models/plugins';
import { SiteProvider } from '../shared/hooks/use-site';
import { AdminSidebar } from './molecules/AdminSidebar';

export type AdminAppProps = {
  jwt?: string;
  api: ApiClient;
  routes: UniversalRoute[];
  user: { name: string; id: number; scope: string[] };
  site: PublicSite;
  supportedLocales: string[];
  defaultLocale: string;
};

const AdminApp: React.FC<AdminAppProps> = ({ api, routes, site, user, supportedLocales, defaultLocale }) => {
  const { i18n, t } = useTranslation();
  const restarting = useIsApiRestarting(api);
  const viewingDirection = useMemo(() => i18n.dir(i18n.language), [i18n.language]);

  return (
    <div lang={i18n.language} dir={viewingDirection}>
      <SiteProvider
        value={useMemo(() => ({ site, user, supportedLocales, defaultLocale }), [
          site,
          user,
          supportedLocales,
          defaultLocale,
        ])}
      >
        <GlobalStyles />
        <UserBar site={site} user={user} admin />
        {restarting ? <ErrorMessage>{t('Lost connection to server, retrying...')}</ErrorMessage> : null}
        <AdminLayoutContainer>
          <AdminLayoutMenu>
            <AdminSidebar />
          </AdminLayoutMenu>
          <AdminLayoutMain>
            <ApiContext.Provider value={api}>{renderUniversalRoutes(routes)}</ApiContext.Provider>
          </AdminLayoutMain>
        </AdminLayoutContainer>
      </SiteProvider>
    </div>
  );
};

export default AdminApp;
