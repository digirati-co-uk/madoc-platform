import React from 'react';
import { SiteTerms } from '../../../../types/site-terms';
import { useData } from '../../../shared/hooks/use-data';
import { serverRendererFor } from '../../../shared/plugins/external/server-renderer-for';

export function ListTerms() {
  const { data } = useData<{ terms: SiteTerms[] }>(ListTerms);

  return (
    <div>
      List terms
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}

serverRendererFor(ListTerms, {
  getKey: () => ['site-terms', {}],
  getData: (key, vars, api) => {
    return api.siteManager.listTerms();
  },
});
