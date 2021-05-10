import React, { useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { SiteContainer, SiteContainerBackground } from '../../../shared/atoms/SiteContainer';
import { UserBar } from '../../../shared/components/UserBar';
import { useSite, useUser } from '../../../shared/hooks/use-site';
import { ErrorBoundary } from '../../../shared/utility/error-boundary';
import { renderUniversalRoutes } from '../../../shared/utility/server-utils';
import { createUniversalComponent } from '../../../shared/utility/create-universal-component';
import { UniversalComponent } from '../../../types';
import { useStaticData } from '../../../shared/hooks/use-data';
import { GlobalFooter } from '../../features/GlobalFooter';
import { GlobalSiteHeader } from '../../features/GlobalSiteHeader';
import { GlobalSiteNavigation } from '../../features/GlobalSiteNavigation';
import { ConfigProvider, SiteConfigurationContext } from '../../features/SiteConfigurationContext';

export type RootLoaderType = {
  params: {};
  query: {};
  variables: {};
  data: {
    project: SiteConfigurationContext['project'];
    navigation: SiteConfigurationContext['navigation'];
  };
  context: {};
};

export const RootLoader: UniversalComponent<RootLoaderType> = createUniversalComponent<RootLoaderType>(
  ({ route }) => {
    const site = useSite();
    const user = useUser();
    const { data } = useStaticData(RootLoader, [], {
      cacheTime: 24 * 60 * 60,
    });
    const { i18n } = useTranslation();
    const viewingDirection = useMemo(() => i18n.dir(i18n.language), [i18n]);

    return (
      <ConfigProvider project={data ? data.project : undefined} navigation={data ? data.navigation : undefined}>
        <Helmet>
          <title>{site.title}</title>
        </Helmet>
        <UserBar site={site} user={user} />
        <GlobalSiteHeader menu={<GlobalSiteNavigation />} />
        <SiteContainerBackground>
          <SiteContainer lang={i18n.language} dir={viewingDirection}>
            <ErrorBoundary>{renderUniversalRoutes(route.routes)}</ErrorBoundary>
          </SiteContainer>
        </SiteContainerBackground>
        <GlobalFooter />
      </ConfigProvider>
    );
  },
  {
    getKey: () => {
      return ['root-config', []];
    },
    getData: async (key, vars, api) => {
      const project = api.getSiteConfiguration();
      const navigation = api.pageBlocks.getPageNavigation();

      return {
        project: await project,
        navigation: (await navigation).navigation,
      };
    },
  }
);
