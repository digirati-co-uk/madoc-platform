import React from 'react';
import { EnrichmentEntitySnippet } from '../../../../../../extensions/enrichment/authority/types';
import { DjangoPagination } from '../../../../../../extensions/enrichment/types';
import { usePaginatedData } from '../../../../../shared/hooks/use-data';
import { Button } from '../../../../../shared/navigation/Button';
import { serverRendererFor } from '../../../../../shared/plugins/external/server-renderer-for';
import { Heading2 } from '../../../../../shared/typography/Heading2';
import { HrefLink } from '../../../../../shared/utility/href-link';

export function ListEntityTypes() {
  const { data } = usePaginatedData<DjangoPagination<EnrichmentEntitySnippet>>(ListEntityTypes);

  // @todo pagination.
  return (
    <div>
      <Heading2>List entity type s</Heading2>
      <Button as={HrefLink} href={`new`}>
        Create new
      </Button>
      <ul>
        {data?.results.map(result => (
          <li key={result.id}>
            <HrefLink href={result.id}>{result.label}</HrefLink>
          </li>
        ))}
      </ul>
    </div>
  );
}

serverRendererFor(ListEntityTypes, {
  getKey(params, query) {
    return ['authority.entity_type.list', { page: query.page || 1 }];
  },
  getData(key: string, vars, api) {
    return api.authority.entity_type.list(vars.page);
  },
});
