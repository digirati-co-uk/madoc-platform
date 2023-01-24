import React from 'react';
import { EnrichmentEntity } from '../../../../../../extensions/enrichment/authority/types';
import { useData } from '../../../../../shared/hooks/use-data';
import { serverRendererFor } from '../../../../../shared/plugins/external/server-renderer-for';

export function Entity() {
  const { data } = useData<EnrichmentEntity>(Entity);

  return (
    <div>
      <h3>{data?.label || '...'}</h3>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}

serverRendererFor(Entity, {
  getKey(params) {
    return ['authority.entity.get', { id: params.id }];
  },
  getData(key: string, vars, api) {
    return api.authority.entity.get(vars.id);
  },
});
