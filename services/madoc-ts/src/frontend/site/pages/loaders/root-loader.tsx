import React, { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import { SiteContainer, SiteContainerBackground } from '../../../shared/atoms/SiteContainer';
import { RenderFragment } from '../../../shared/components/RenderFragment';
import { UserBar } from '../../../shared/components/UserBar';
import { useClearFormResponse, useSite, useSiteTheme, useUser } from '../../../shared/hooks/use-site';
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
  params: any;
  query: any;
  variables: any;
  data: {
    project: SiteConfigurationContext['project'];
    navigation: SiteConfigurationContext['navigation'];
  };
  context: any;
};

export const RootLoader: UniversalComponent<RootLoaderType> = createUniversalComponent<RootLoaderType>(
  ({ route }) => {
    const site = useSite();
    const user = useUser();
    const { data } = useStaticData(RootLoader, [], {
      cacheTime: 24 * 60 * 60,
    });
    const { i18n } = useTranslation();
    const siteTheme = useSiteTheme();
    const viewingDirection = useMemo(() => i18n.dir(i18n.language), [i18n]);

    const clearFormResponse = useClearFormResponse();
    const { location } = useHistory();
    const [initialPath] = useState(location.pathname);
    useEffect(() => {
      if (initialPath !== location.pathname) {
        clearFormResponse();
      }
    }, [clearFormResponse, initialPath, location.pathname]);

    return (
      <ConfigProvider project={data ? data.project : undefined} navigation={data ? data.navigation : undefined}>
        <Helmet>
          <title>{site.title}</title>
          {siteTheme && siteTheme.assets.css
            ? siteTheme.assets.css.map(item => (
                <link
                  key={item}
                  rel="stylesheet"
                  href={`/s/${site.slug}/madoc/themes/${siteTheme.id}/public/${item}`}
                />
              ))
            : null}
          {siteTheme && siteTheme.assets.js
            ? siteTheme.assets.js.map(item => (
                <script
                  key={item}
                  type="application/javascript"
                  src={`/s/${site.slug}/madoc/themes/${siteTheme.id}/public/${item}`}
                />
              ))
            : null}
        </Helmet>
        {siteTheme && siteTheme.html.header ? <RenderFragment fragment={siteTheme.html.header} /> : null}
        <UserBar user={user} />
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
