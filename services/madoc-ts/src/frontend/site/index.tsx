import React, { useMemo } from 'react';
import { ApiClient } from '../../gateway/api';
import { useTranslation } from 'react-i18next';
import { PublicSite } from '../../utility/omeka-api';
import { SiteContainer } from '../shared/atoms/SiteContainer';
import { UserBar } from '../shared/components/UserBar';
import { renderUniversalRoutes } from '../shared/utility/server-utils';
import { ApiContext } from '../shared/hooks/use-api';
import { UniversalRoute } from '../types';
import { VaultProvider } from '@hyperion-framework/react-vault';
import '../shared/caputre-models/plugins';
import { SiteProvider } from '../shared/hooks/use-site';
import { GlobalSiteHeader } from './features/GlobalSiteHeader';
import { GlobalSiteNavigation } from './features/GlobalSiteNavigation';

export type SiteAppProps = {
  jwt?: string;
  api: ApiClient;
  routes: UniversalRoute[];
  siteSlug?: string;
  user?: { name: string; id: number; scope: string[] };
  site: PublicSite;
  supportedLocales: string[];
  defaultLocale: string;
};

const SiteApp: React.FC<SiteAppProps> = ({ api, site, user, supportedLocales, defaultLocale, routes }) => {
  const { i18n } = useTranslation();

  const viewingDirection = useMemo(() => i18n.dir(i18n.language), [i18n]);

  return (
    <VaultProvider>
      <SiteProvider
        value={useMemo(() => ({ site, user, supportedLocales, defaultLocale }), [
          site,
          user,
          supportedLocales,
          defaultLocale,
        ])}
      >
        <ApiContext.Provider value={api}>
          <UserBar site={site} user={user} />
          <GlobalSiteHeader />
          <SiteContainer lang={i18n.language} dir={viewingDirection}>
            <GlobalSiteNavigation />
            {renderUniversalRoutes(routes)}
          </SiteContainer>
        </ApiContext.Provider>
      </SiteProvider>
    </VaultProvider>
  );
};

export default SiteApp;
