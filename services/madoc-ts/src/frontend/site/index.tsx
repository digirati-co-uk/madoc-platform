import React, { useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { ThemeProvider } from 'styled-components';
import { ApiClient } from '../../gateway/api';
import { PublicSite } from '../../utility/omeka-api';
import { renderUniversalRoutes } from '../shared/utility/server-utils';
import { ApiContext } from '../shared/hooks/use-api';
import { defaultTheme } from '../themes/default-theme';
import { UniversalRoute } from '../types';
import { VaultProvider } from '@hyperion-framework/react-vault';
import '../shared/caputre-models/plugins';
import { SiteProvider } from '../shared/hooks/use-site';

export type SiteAppProps = {
  jwt?: string;
  api: ApiClient;
  routes: UniversalRoute[];
  siteSlug?: string;
  user?: { name: string; id: number; scope: string[] };
  site: PublicSite;
  supportedLocales: Array<{ label: string; code: string }>;
  defaultLocale: string;
};

const SiteApp: React.FC<SiteAppProps> = ({ api, site, user, supportedLocales, defaultLocale, routes }) => {
  return (
    <ThemeProvider theme={defaultTheme}>
      <VaultProvider>
        <SiteProvider
          value={useMemo(() => ({ site, user, supportedLocales, defaultLocale }), [
            site,
            user,
            supportedLocales,
            defaultLocale,
          ])}
        >
          <ApiContext.Provider value={api}>{renderUniversalRoutes(routes)}</ApiContext.Provider>
        </SiteProvider>
      </VaultProvider>
    </ThemeProvider>
  );
};

export default SiteApp;
