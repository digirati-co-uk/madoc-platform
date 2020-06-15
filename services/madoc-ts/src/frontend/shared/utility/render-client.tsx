import cookies from 'browser-cookies';
import { queryCache } from 'react-query';
import { createBackend } from '../../../middleware/i18n/i18next.client';
import { hydrate } from 'react-dom';
import { SSRContext } from '../components/SSRContext';
import { I18nextProvider } from 'react-i18next';
import { BrowserRouter } from 'react-router-dom';
import { api } from '../../../gateway/api.browser';
import React from 'react';
import { UniversalRoute } from '../../types';

export function renderClient(Component: React.FC<any>, routes: UniversalRoute[], requireJwt = true) {
  const component = document.getElementById('react-component');

  const [, slug] = window.location.pathname.match(/s\/([^/]*)/) as string[];
  const jwt = cookies.get(`madoc/${slug}`) || undefined;

  if (!jwt && requireJwt) {
    const loc = window.location.href;
    window.location.href = `/s/${slug}/madoc/login?redirect=${loc}`;
  }

  if (component && (jwt || !requireJwt)) {
    const reactQueryData = document.getElementById('react-query-data');
    if (reactQueryData) {
      const map = JSON.parse(reactQueryData.innerText);
      const values: any = Object.values(map);
      for (const { key, data } of values) {
        queryCache.setQueryData(key, data);
      }
    }

    createBackend(slug, jwt).then(([t, i18n]) => {
      const propScript = document.getElementById('react-data');
      const { basename, ...props }: any = propScript ? JSON.parse(propScript.innerText) : { tasks: [] };

      hydrate(
        <SSRContext.Provider value={undefined}>
          <I18nextProvider i18n={i18n}>
            <BrowserRouter basename={basename}>
              <Component jwt={jwt} api={api} routes={routes} />
            </BrowserRouter>
          </I18nextProvider>
        </SSRContext.Provider>,
        component
      );
    });
  }
}
