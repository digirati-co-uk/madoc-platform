import cookies from 'browser-cookies';
import { DndProvider } from 'react-dnd';
// @ts-ignore
import MultiBackend from 'react-dnd-multi-backend';
// @ts-ignore
import HTML5toTouch from 'react-dnd-multi-backend/dist/cjs/HTML5toTouch';
import { ReactQueryCacheProvider, ReactQueryConfig, ReactQueryConfigProvider } from 'react-query';
import { Hydrate } from 'react-query/hydration';
import { ThemeProvider } from 'styled-components';
import { defaultTheme } from '@capture-models/editor';
import { createBackend } from '../../../middleware/i18n/i18next.client';
import { render } from 'react-dom';
import { I18nextProvider } from 'react-i18next';
import { BrowserRouter } from 'react-router-dom';
import { api } from '../../../gateway/api.browser';
import React, { Suspense } from 'react';
import { SitePlugin } from '../../../types/schemas/plugins';
import { CreateRouteType, UniversalRoute } from '../../types';
import { ResolvedTheme } from '../../../types/themes';
import { ErrorPage } from '../components/NotFoundPage';
import { Spinner } from '../icons/Spinner';
import { Madoc } from '../plugins/globals';
import { PluginManager, PluginModule } from '../plugins/plugin-manager';
import { useModule } from '../plugins/use-module';
import { ErrorBoundary } from './error-boundary';
import { queryConfig } from './query-config';
import { ReactQueryDevtools } from 'react-query-devtools';

export async function renderClient(
  Component: React.FC<any>,
  createRoutes: UniversalRoute[] | ((components: any) => CreateRouteType),
  components: any,
  requireJwt = true,
  extraConfig: ReactQueryConfig = {}
) {
  const component = document.getElementById('react-component');
  const dehydratedStateEl = document.getElementById('react-query-cache');
  const dehydratedSiteEl = document.getElementById('react-omeka');
  const dehydratedState = dehydratedStateEl ? JSON.parse(dehydratedStateEl.innerText) : {};
  const dehydratedSite = dehydratedSiteEl ? JSON.parse(dehydratedSiteEl.innerText) : {};

  const remotePlugins = (dehydratedSite.plugins || []).map(async (plugin: SitePlugin) => {
    if (plugin.development.enabled && !plugin.development.revision && !plugin.installed) {
      return null;
    }

    return fetch(
      plugin.development.enabled && plugin.development.revision
        ? `/s/default/madoc/assets/plugins/${plugin.id}/${plugin.development.revision}/plugin.js`
        : `/s/default/madoc/assets/plugins/${plugin.id}/${plugin.version}/plugin.js`,
      {
        cache: 'force-cache',
      }
    )
      .then(res => res.text())
      .then(code => {
        const module = new Function(`
          return (function(require, module, exports) {
            ${code};
            
            return exports;
          })(this.require, this.module, this.exports);
        `);

        return {
          siteId: dehydratedSite.site.id,
          definition: plugin,
          module: module.call({
            Madoc: Madoc,
            require: useModule,
            exports: {},
            module: {},
          }),
        } as PluginModule;
      });
  });

  const availablePlugins = (await Promise.all(remotePlugins)).filter(r => r !== null);
  const pluginManager = new PluginManager(availablePlugins as any);
  const routes = Array.isArray(createRoutes)
    ? createRoutes
    : pluginManager.makeRoutes(
        createRoutes(pluginManager.hookComponents(components, dehydratedSite.site.id)),
        dehydratedSite.site.id
      );

  const [, slug] = window.location.pathname.match(/s\/([^/]*)/) as string[];
  const jwt = cookies.get(`madoc/${slug}`) || undefined;

  if (!jwt && requireJwt) {
    const loc = window.location.pathname;
    window.location.href = `/s/${slug}/madoc/login?redirect=${loc}`;
  }

  const theme: ResolvedTheme | null | undefined = dehydratedSite.theme;
  const localisations = dehydratedSite.locales as Array<{ label: string; code: string }>;
  const supportedLocales = localisations.map(local => local.code);
  const defaultLocale = dehydratedSite.defaultLocale || 'en';

  if (component && (jwt || !requireJwt)) {
    createBackend(slug, jwt, supportedLocales, defaultLocale).then(([t, i18n]) => {
      const propScript = document.getElementById('react-data');
      const { basename }: any = propScript ? JSON.parse(propScript.innerText) : {};

      render(
        <ReactQueryConfigProvider
          config={{
            ...queryConfig,
            ...extraConfig,
            queries: {
              ...(queryConfig.queries || {}),
              ...(extraConfig.queries || {}),
            },
          }}
        >
          <ReactQueryCacheProvider>
            <Hydrate state={dehydratedState}>
              <I18nextProvider i18n={i18n}>
                <BrowserRouter basename={basename}>
                  <DndProvider backend={MultiBackend} options={HTML5toTouch}>
                    <ThemeProvider theme={defaultTheme}>
                      <ErrorBoundary onError={error => <ErrorPage error={error} />}>
                        <Suspense fallback={<Spinner />} unstable_avoidThisFallback={true}>
                          <Component
                            jwt={jwt}
                            api={api}
                            routes={routes}
                            siteSlug={slug}
                            site={dehydratedSite.site}
                            user={dehydratedSite.user}
                            theme={theme}
                            supportedLocales={localisations}
                            defaultLocale={defaultLocale}
                            navigationOptions={dehydratedSite.navigationOptions}
                          />
                        </Suspense>
                        {process.env.NODE_ENV === 'development' ? <ReactQueryDevtools /> : null}
                      </ErrorBoundary>
                    </ThemeProvider>
                  </DndProvider>
                </BrowserRouter>
              </I18nextProvider>
            </Hydrate>
          </ReactQueryCacheProvider>
        </ReactQueryConfigProvider>,
        component
      );

      component.classList.add('react-loaded');
    });
  }
}
