import React from 'react';
import { EnrichmentEntitySnippet } from '../../../../../../extensions/enrichment/authority/types';
import { DjangoPagination } from '../../../../../../extensions/enrichment/types';
import { usePaginatedData } from '../../../../../shared/hooks/use-data';
import { Button } from '../../../../../shared/navigation/Button';
import { serverRendererFor } from '../../../../../shared/plugins/external/server-renderer-for';
import { Heading2 } from '../../../../../shared/typography/Heading2';
import { HrefLink } from '../../../../../shared/utility/href-link';

export function ListEntities() {
  const { data } = usePaginatedData<DjangoPagination<EnrichmentEntitySnippet>>(ListEntities);

  return (
    <div>
      <Heading2>List entities</Heading2>
      <HrefLink as={Button} href={`new`}>
        Create new
      </HrefLink>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}

serverRendererFor(ListEntities, {
  getKey(params, query) {
    return ['authority.entity.list', { page: query.page || 1 }];
  },
  getData(key: string, vars, api) {
    return api.authority.entity.list(vars.page);
  },
});
