import React, { useMemo } from 'react';
import { ApiClient } from '../../gateway/api';
import { ResolvedTheme } from '../../types/themes';
import { PublicSite } from '../../utility/omeka-api';
import { renderUniversalRoutes } from '../shared/utility/server-utils';
import { ApiContext } from '../shared/hooks/use-api';
import { defaultTheme } from '../themes/default-theme';
import { CustomThemeProvider } from '../themes/helpers/CustomThemeProvider';
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
  theme?: ResolvedTheme | null;
  supportedLocales: Array<{ label: string; code: string }>;
  displayLanguages: Array<{ label: string; code: string }>;
  contentLanguages: Array<{ label: string; code: string }>;
  defaultLocale: string;
  navigationOptions?: {
    enableProjects: boolean;
    enableCollections: boolean;
  };
  collectThemeOverrides?: (name: string, theme: any) => void;
  themeOverrides?: any;
};

const SiteApp: React.FC<SiteAppProps> = ({
  api,
  site,
  user,
  supportedLocales,
  contentLanguages,
  displayLanguages,
  defaultLocale,
  routes,
  navigationOptions = {
    enableProjects: true,
    enableCollections: true,
  },
  theme,
  themeOverrides,
}) => {
  return (
    <CustomThemeProvider theme={theme && theme.theme ? theme.theme : defaultTheme} themeOverrides={themeOverrides}>
      <VaultProvider>
        <SiteProvider
          value={useMemo(
            () => ({
              site,
              user,
              supportedLocales,
              contentLanguages,
              displayLanguages,
              defaultLocale,
              navigationOptions,
              theme,
            }),
            [contentLanguages, displayLanguages, theme, site, user, supportedLocales, defaultLocale, navigationOptions]
          )}
        >
          <ApiContext.Provider value={api}>{renderUniversalRoutes(routes)}</ApiContext.Provider>
        </SiteProvider>
      </VaultProvider>
    </CustomThemeProvider>
  );
};

export default SiteApp;
