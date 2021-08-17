import React, { useMemo, useState } from 'react';
import { CurrentUserWithScope, Site, SystemConfig } from '../../extensions/site-manager/types';
import { ApiClient } from '../../gateway/api';
import { useTranslation } from 'react-i18next';
import { GlobalStyles } from '../shared/atoms/GlobalStyles';
import { AdminLayoutContainer, AdminLayoutMain, AdminLayoutMenu } from '../shared/components/AdminMenu';
import { UserBar } from '../shared/components/UserBar';
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
            <AdminLayoutMain>{renderUniversalRoutes(routes)}</AdminLayoutMain>
          </AdminLayoutContainer>
        </ApiContext.Provider>
      </SiteProvider>
    </div>
  );
};

export default AdminApp;
