import React, { useState } from 'react';
import ReactTimeago from 'react-timeago';
import { EnrichmentEntityType } from '../../../../../../extensions/enrichment/authority/types';
import { EditShorthandCaptureModel } from '../../../../../shared/capture-models/EditorShorthandCaptureModel';
import { useData } from '../../../../../shared/hooks/use-data';
import { Button } from '../../../../../shared/navigation/Button';
import { serverRendererFor } from '../../../../../shared/plugins/external/server-renderer-for';
import { HrefLink } from '../../../../../shared/utility/href-link';
import { entityTypeModel } from './entity-type-model';

export function EntityType() {
  const { data } = useData<{ entity: EnrichmentEntityType; items: any }>(EntityType);
  const [isEditing, setIsEditing] = useState(false);
  const { entity, items } = data || {};
  const created = entity?.created ? new Date(entity?.created) : null;

  if (isEditing) {
    return (
      <EditShorthandCaptureModel
        template={entityTypeModel}
        data={entity}
        onSave={async newData => {
          console.log('new data->', newData);
        }}
      />
    );
  }

  return (
    <div>
      <h2>{entity?.label || '...'}</h2>
      <Button onClick={() => setIsEditing(true)}>Edit</Button>
      {created ? (
        <span>
          Created <ReactTimeago date={created} />
        </span>
      ) : null}
      <div>
        <h3>Other labels</h3>
        <ul>
          {entity?.other_labels.map((label, i) => (
            <li key={i}>
              {label.value} ({label.language})
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h3>Entities in this type</h3>
        <ul>
          {items?.results.map((r: any) => {
            return (
              <li key={r.id}>
                <HrefLink to={`/enrichment/authority/entities/${r.id}`}>{r.label}</HrefLink>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

serverRendererFor(EntityType, {
  getKey(params) {
    return ['authority.entity_type.get', { id: params.id }];
  },
  async getData(key: string, vars, api) {
    const entity = await api.authority.entity_type.get(vars.id);
    return {
      entity,
      items: await api.enrichment.getTopicType(entity.label),
    };
  },
});
