import React from 'react';
import { hydrate } from 'react-dom';
import AdminApp, { AdminAppProps, SSRContext } from './index';
import cookies from 'browser-cookies';
import { BrowserRouter } from 'react-router-dom';
import { api } from '../../gateway/api.browser';
import { queryCache } from 'react-query';
import { createBackend } from '../../middleware/i18n/i18next.client';
import { I18nextProvider } from 'react-i18next';

const component = document.getElementById('admin-component');

const [, slug] = window.location.pathname.match(/s\/([^/]*)/) as string[];
const jwt = cookies.get(`madoc/${slug}`);

if (component && jwt) {
  const reactQueryData = document.getElementById('react-query-data-v2');
  if (reactQueryData) {
    const map = JSON.parse(reactQueryData.innerText);
    const values: any = Object.values(map);
    for (const { key, data } of values) {
      queryCache.setQueryData(key, data);
    }
  }

  createBackend(jwt).then(([t, i18n]) => {
    const propScript = document.getElementById('admin-data');
    const { basename, ...props }: AdminAppProps & { basename: string } = propScript
      ? JSON.parse(propScript.innerText)
      : { tasks: [] };

    hydrate(
      <SSRContext.Provider value={undefined}>
        <I18nextProvider i18n={i18n}>
          <BrowserRouter basename={basename}>
            <AdminApp jwt={jwt} api={api} />
          </BrowserRouter>
        </I18nextProvider>
      </SSRContext.Provider>,
      component
    );
  });
}
