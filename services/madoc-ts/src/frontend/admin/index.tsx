import React, { useMemo, useState } from 'react';
import { RouteObject } from 'react-router-dom';
import { CurrentUserWithScope, Site, SystemConfig } from '../../extensions/site-manager/types';
import { ApiClient } from '../../gateway/api';
import { useTranslation } from 'react-i18next';
import { GlobalStyles } from '../shared/typography/GlobalStyles';
import { AdminLayoutContainer, AdminLayoutMain, AdminLayoutMenu } from './components/AdminMenu';
import { UserBar } from '../shared/components/UserBar';
import { RenderConfigRoutes } from '../shared/utility/server-utils';
import { ApiContext, useIsApiRestarting } from '../shared/hooks/use-api';
import { ErrorMessage } from '../shared/callouts/ErrorMessage';
import '../shared/capture-models/plugins';
import { SiteProvider } from '../shared/hooks/use-site';
import { AdminSidebar } from './molecules/AdminSidebar';
import './index.css';

export type AdminAppProps = {
  jwt?: string;
  api: ApiClient;
  routes: RouteObject[];
  user: CurrentUserWithScope;
  site: Site;
  supportedLocales: Array<{ label: string; code: string }>;
  contentLanguages: Array<{ label: string; code: string }>;
  displayLanguages: Array<{ label: string; code: string }>;
  defaultLocale: string;
  systemConfig: SystemConfig;
};

const AdminApp: React.FC<AdminAppProps> = ({
  api,
  routes,
  site,
  user,
  supportedLocales,
  contentLanguages,
  displayLanguages,
  defaultLocale,
  systemConfig,
}) => {
  const { i18n, t } = useTranslation();
  const restarting = useIsApiRestarting(api);
  const viewingDirection = useMemo(() => i18n.dir(i18n.language), [i18n.language]);
  const [updatedSite, setSite] = useState(site);
  const [updatedSystemConfig, updateSystemConfig] = useState(systemConfig);

  return (
    <div lang={i18n.language} dir={viewingDirection}>
      <SiteProvider
        value={useMemo(
          () => ({
            site: updatedSite,
            setSite,
            user,
            supportedLocales,
            defaultLocale,
            contentLanguages,
            displayLanguages,
            navigationOptions: { enableProjects: true, enableCollections: true },
            systemConfig: updatedSystemConfig,
            updateSystemConfig,
          }),
          [updatedSite, user, supportedLocales, defaultLocale, contentLanguages, displayLanguages, updatedSystemConfig]
        )}
      >
        <ApiContext.Provider value={api}>
          <GlobalStyles />
          <UserBar user={user} admin />
          {restarting ? <ErrorMessage>{t('Lost connection to server, retrying...')}</ErrorMessage> : null}
          <AdminLayoutContainer>
            <AdminLayoutMenu>
              <AdminSidebar />
            </AdminLayoutMenu>
            <AdminLayoutMain>
              <RenderConfigRoutes routes={routes} />
            </AdminLayoutMain>
          </AdminLayoutContainer>
        </ApiContext.Provider>
      </SiteProvider>
    </div>
  );
};

export default AdminApp;
