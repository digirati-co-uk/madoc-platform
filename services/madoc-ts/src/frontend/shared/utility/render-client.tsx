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
import { CreateRouteType, UniversalRoute } from '../../types';
import { ErrorPage } from '../components/NotFoundPage';
import { Spinner } from '../icons/Spinner';
import { PluginManager } from '../plugins/plugin-manager';
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

  const remotePlugin = await fetch(
    '/s/default/madoc/assets/plugins/my-plugin/3ee99c02fb31792f0c8a947153b942519694f64c/plugin.js',
    {
      cache: 'force-cache',
    }
  )
    .then(res => res.text())
    .then(code => {
      const module = new Function(`
          ${code};
          return this['madoc-example-plugin'];
        `);

      return module();
    });

  const pluginManager = new PluginManager([remotePlugin as any]);
  const routes = Array.isArray(createRoutes)
    ? createRoutes
    : pluginManager.makeRoutes(createRoutes(pluginManager.hookComponents(components)));

  const [, slug] = window.location.pathname.match(/s\/([^/]*)/) as string[];
  const jwt = cookies.get(`madoc/${slug}`) || undefined;

  if (!jwt && requireJwt) {
    const loc = window.location.pathname;
    window.location.href = `/s/${slug}/madoc/login?redirect=${loc}`;
  }

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
