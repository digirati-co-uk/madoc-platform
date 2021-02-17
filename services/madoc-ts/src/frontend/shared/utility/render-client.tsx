import cookies from 'browser-cookies';
import { DndProvider } from 'react-dnd';
// @ts-ignore
import MultiBackend from 'react-dnd-multi-backend';
// @ts-ignore
import HTML5toTouch from 'react-dnd-multi-backend/dist/cjs/HTML5toTouch';
import { ReactQueryCacheProvider, ReactQueryConfig, ReactQueryConfigProvider } from 'react-query';
import { Hydrate } from 'react-query/hydration';
import { createBackend } from '../../../middleware/i18n/i18next.client';
import { render } from 'react-dom';
import { I18nextProvider } from 'react-i18next';
import { BrowserRouter } from 'react-router-dom';
import { api } from '../../../gateway/api.browser';
import React from 'react';
import { ListLocalisationsResponse } from '../../../routes/admin/localisation';
import { UniversalRoute } from '../../types';
import { ErrorPage } from '../components/NotFoundPage';
import { ErrorBoundary } from './error-boundary';
import { queryConfig } from './query-config';
import { ReactQueryDevtools } from 'react-query-devtools';

export function renderClient(
  Component: React.FC<any>,
  routes: UniversalRoute[],
  requireJwt = true,
  extraConfig: ReactQueryConfig = {}
) {
  const component = document.getElementById('react-component');
  const dehydratedStateEl = document.getElementById('react-query-cache');
  const dehydratedSiteEl = document.getElementById('react-omeka');
  const dehydratedState = dehydratedStateEl ? JSON.parse(dehydratedStateEl.innerText) : {};
  const dehydratedSite = dehydratedSiteEl ? JSON.parse(dehydratedSiteEl.innerText) : {};

  const [, slug] = window.location.pathname.match(/s\/([^/]*)/) as string[];
  const jwt = cookies.get(`madoc/${slug}`) || undefined;

  if (!jwt && requireJwt) {
    const loc = window.location.pathname;
    window.location.href = `/s/${slug}/madoc/login?redirect=${loc}`;
  }

  const localisations = dehydratedSite.locales as ListLocalisationsResponse['localisations'];
  const supportedLocales = localisations.map(local => local.code);
  const defaultLocale = dehydratedSite.defaultLocale || 'en';

  if (component && (jwt || !requireJwt)) {
    createBackend(slug, jwt, supportedLocales, defaultLocale).then(([t, i18n]) => {
      const propScript = document.getElementById('react-data');
      const { basename }: any = propScript ? JSON.parse(propScript.innerText) : {};

      render(
        <ReactQueryConfigProvider config={{ ...queryConfig, ...extraConfig }}>
          <ReactQueryCacheProvider>
            <Hydrate state={dehydratedState}>
              <I18nextProvider i18n={i18n}>
                <BrowserRouter basename={basename}>
                  <DndProvider backend={MultiBackend} options={HTML5toTouch}>
                    <ErrorBoundary onError={error => <ErrorPage error={error} />}>
                      <Component
                        jwt={jwt}
                        api={api}
                        routes={routes}
                        siteSlug={slug}
                        site={dehydratedSite.site}
                        user={dehydratedSite.user}
                        supportedLocales={supportedLocales}
                        defaultLocale={defaultLocale}
                      />
                      {process.env.NODE_ENV === 'development' ? <ReactQueryDevtools /> : null}
                    </ErrorBoundary>
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
