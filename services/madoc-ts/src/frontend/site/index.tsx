import React, { useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';
import { ApiClient } from '../../gateway/api';
import { useTranslation } from 'react-i18next';
import { PublicSite } from '../../utility/omeka-api';
import { GlobalStyles } from '../shared/atoms/GlobalStyles';
import { LightNavigation, LightNavigationItem } from '../shared/atoms/LightNavigation';
import { SiteContainer } from '../shared/atoms/SiteContainer';
import { UserBar } from '../shared/components/UserBar';
import { HrefLink } from '../shared/utility/href-link';
import { renderUniversalRoutes } from '../shared/utility/server-utils';
import { ApiContext, useIsApiRestarting } from '../shared/hooks/use-api';
import { ErrorMessage } from '../shared/atoms/ErrorMessage';
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
  user?: { name: string; id: number };
  site: PublicSite;
};

const SiteApp: React.FC<SiteAppProps> = ({ api, site, user, routes }) => {
  const { i18n } = useTranslation();

  const viewingDirection = useMemo(() => i18n.dir(i18n.language), [i18n]);

  return (
    <VaultProvider>
      <SiteProvider value={useMemo(() => ({ site, user }), [user, site])}>
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
