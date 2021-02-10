import React, { useMemo } from 'react';
import { ApiClient } from '../../gateway/api';
import { useTranslation } from 'react-i18next';
import { PublicSite } from '../../utility/omeka-api';
import { GlobalStyles } from '../shared/atoms/GlobalStyles';
import { UserBar } from '../shared/components/UserBar';
import { renderUniversalRoutes } from '../shared/utility/server-utils';
import { ApiContext, useIsApiRestarting } from '../shared/hooks/use-api';
import { ErrorMessage } from '../shared/atoms/ErrorMessage';
import { UniversalRoute } from '../types';
import '../shared/caputre-models/plugins';
import { SiteProvider } from '../shared/hooks/use-site';

export type AdminAppProps = {
  jwt?: string;
  api: ApiClient;
  routes: UniversalRoute[];
  user: { name: string; id: number };
  site: PublicSite;
};

const AdminApp: React.FC<AdminAppProps> = ({ api, routes, site, user }) => {
  const { i18n } = useTranslation();
  const restarting = useIsApiRestarting(api);

  const viewingDirection = useMemo(() => i18n.dir(i18n.language), [i18n.language]);

  return (
    <div lang={i18n.language} dir={viewingDirection}>
      <SiteProvider value={useMemo(() => ({ site, user }), [site, user])}>
        <GlobalStyles />
        <UserBar site={site} user={user} admin />
        {restarting ? <ErrorMessage>Lost connection to server, retrying... </ErrorMessage> : null}
        <ApiContext.Provider value={api}>{renderUniversalRoutes(routes)}</ApiContext.Provider>
      </SiteProvider>
    </div>
  );
};

export default AdminApp;
