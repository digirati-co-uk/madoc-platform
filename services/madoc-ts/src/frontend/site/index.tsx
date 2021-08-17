import React, { useCallback, useMemo, useState } from 'react';
import { CurrentUserWithScope, SystemConfig, Site } from '../../extensions/site-manager/types';
import { ApiClient } from '../../gateway/api';
import { ResolvedTheme } from '../../types/themes';
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
  user?: CurrentUserWithScope;
  site: Site;
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
  formResponse?: any;
  systemConfig: SystemConfig;
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
  formResponse,
  systemConfig,
}) => {
  const [updatedSite, setSite] = useState(site);
  const [updatedFormResponse, setUpdatedFormResponse] = useState<any | undefined>(formResponse);
  const clearFormResponse = useCallback(() => {
    setUpdatedFormResponse(undefined);
  }, []);

  return (
    <CustomThemeProvider theme={theme && theme.theme ? theme.theme : defaultTheme} themeOverrides={themeOverrides}>
      <VaultProvider>
        <SiteProvider
          value={useMemo(
            () => ({
              site: updatedSite,
              setSite,
              user,
              supportedLocales,
              contentLanguages,
              displayLanguages,
              defaultLocale,
              navigationOptions,
              theme,
              formResponse: updatedFormResponse,
              clearFormResponse,
              systemConfig,
            }),
            [
              updatedSite,
              user,
              supportedLocales,
              contentLanguages,
              displayLanguages,
              defaultLocale,
              navigationOptions,
              theme,
              updatedFormResponse,
              clearFormResponse,
              systemConfig,
            ]
          )}
        >
          <ApiContext.Provider value={api}>{renderUniversalRoutes(routes)}</ApiContext.Provider>
        </SiteProvider>
      </VaultProvider>
    </CustomThemeProvider>
  );
};

export default SiteApp;
