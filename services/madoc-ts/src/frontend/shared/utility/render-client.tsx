import cookies from 'browser-cookies';
import { DndProvider } from 'react-dnd';
import { MultiBackend } from 'react-dnd-multi-backend';
import { HTML5toTouch } from 'rdndmb-html5-to-touch';
import { ReactQueryCacheProvider, ReactQueryConfig, ReactQueryConfigProvider } from 'react-query';
import { Hydrate } from 'react-query/hydration';
import { ThemeProvider } from 'styled-components';
import { createBackend } from '../../../middleware/i18n/i18next.client';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { I18nextProvider } from 'react-i18next';
import { BrowserRouter, RouteObject } from 'react-router-dom';
import { api } from '../../../gateway/api.browser';
import React, { Suspense } from 'react';
import { SitePlugin } from '../../../types/schemas/plugins';
import { CreateRouteType } from '../../types';
import { ResolvedTheme } from '../../../types/themes';
import { defaultTheme } from '../capture-models/editor/themes';
import { ErrorPage } from '../components/NotFoundPage';
import { Spinner } from '../icons/Spinner';
import { Madoc } from '../plugins/globals';
import { PluginManager, PluginModule } from '../plugins/plugin-manager';
import { useModule } from '../plugins/use-module';
import { ErrorBoundary } from './error-boundary';
import { queryConfig } from './query-config';
import { ReactQueryDevtools } from 'react-query-devtools';
import { ScrollTop } from './scroll-top';
import '../required-modules';

export async function renderClient(
  Component: React.FC<any>,
  createRoutes: RouteObject[] | ((c: any) => CreateRouteType),
  components: any,
  requireJwt = true,
  extraConfig: ReactQueryConfig = {}
) {
  const component = document.getElementById('react-component');
  const dehydratedStateEl = document.getElementById('react-query-cache');
  const dehydratedSiteEl = document.getElementById('react-site-data');
  const dehydratedState = dehydratedStateEl ? JSON.parse(dehydratedStateEl.innerText) : {};
  const dehydratedSite = dehydratedSiteEl ? JSON.parse(dehydratedSiteEl.innerText) : {};

  // @ts-ignore
  window.umami = {
    trackEvent: () => {
      // no-op
    },
  };

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
    window.location.href = `/s/${slug}/login?redirect=${loc}`;
  }

  const theme: ResolvedTheme | null | undefined = dehydratedSite.theme;
  const localisations = dehydratedSite.locales as Array<{ label: string; code: string }>;
  const supportedLocales = localisations.map(local => local.code);
  const defaultLocale = dehydratedSite.defaultLocale || 'en';

  if (component && (jwt || !requireJwt)) {
    createBackend(slug, jwt, supportedLocales, defaultLocale).then(([t, i18n]) => {
      const propScript = document.getElementById('react-data');
      const { basename }: any = propScript ? JSON.parse(propScript.innerText) : {};

      const app = (
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
                  <ScrollTop />
                  <DndProvider backend={MultiBackend} options={HTML5toTouch}>
                    <ThemeProvider theme={defaultTheme}>
                      <ErrorBoundary onError={error => <ErrorPage error={error} />}>
                        <Suspense fallback={<Spinner />}>
                          <Component
                            jwt={jwt}
                            api={api}
                            routes={routes}
                            siteSlug={slug}
                            site={dehydratedSite.site}
                            user={dehydratedSite.user}
                            theme={theme}
                            supportedLocales={localisations}
                            contentLanguages={dehydratedSite.contentLanguages}
                            displayLanguages={dehydratedSite.displayLanguages}
                            defaultLocale={defaultLocale}
                            navigationOptions={dehydratedSite.navigationOptions}
                            themeOverrides={dehydratedSite.themeOverrides}
                            formResponse={dehydratedSite.reactFormResponse}
                            systemConfig={dehydratedSite.systemConfig}
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
        </ReactQueryConfigProvider>
      );

      if (component.hasChildNodes()) {
        hydrateRoot(component, app);
      } else {
        const root = createRoot(component);
        root.render(app);
      }

      component.classList.add('react-loaded');
    });
  }
}
