import React from 'react';
import { EnrichmentEntitySnippet } from '../../../../../extensions/enrichment/authority/types';
import { DjangoPagination } from '../../../../../extensions/enrichment/types';
import { usePaginatedData } from '../../../../shared/hooks/use-data';
import { serverRendererFor } from '../../../../shared/plugins/external/server-renderer-for';
import { Heading2 } from '../../../../shared/typography/Heading2';

export function ListResourceTags() {
  const { data } = usePaginatedData<DjangoPagination<EnrichmentEntitySnippet>>(ListResourceTags);

  return (
    <div>
      {/*TODO*/}
      <Heading2>List resource tags</Heading2>
      <p>{data?.count} total tags</p>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}

serverRendererFor(ListResourceTags, {
  getKey(params, query) {
    return ['authority.resource_tag.list', { page: query.page || 1 }];
  },
  getData(key: string, vars, api) {
    return api.authority.resource_tag.list(vars.page);
  },
});
