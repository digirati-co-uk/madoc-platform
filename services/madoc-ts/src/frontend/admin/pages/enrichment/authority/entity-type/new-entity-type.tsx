import React from 'react';
import { useMutation } from 'react-query';
import { EnrichmentEntityType } from '../../../../../../extensions/enrichment/authority/types';
import { EditShorthandCaptureModel } from '../../../../../shared/capture-models/EditorShorthandCaptureModel';
import { useApi } from '../../../../../shared/hooks/use-api';
import { entityTypeModel } from '../../../../../../extensions/enrichment/models';

export function NewEntityType() {
  const api = useApi();
  const [createNewEntityType, status] = useMutation(async (data: Partial<EnrichmentEntityType>) => {
    // @ts-ignore
    data.other_labels = (data.other_labels || []).filter(e => e.value !== '');
    return api.authority.entity_type.create(data);
  });

  if (status.isError) {
    return <div>Error...</div>;
  }

  if (status.isSuccess) {
    return (
      <div>
        Added!
        <pre>{JSON.stringify(status.data)}</pre>
      </div>
    );
  }

  return (
    <div>
      <EditShorthandCaptureModel
        template={entityTypeModel}
        data={{ label: '', other_labels: [{ value: '', language: '' }] }}
        onSave={async data => {
          await createNewEntityType(data);
        }}
        keepExtraFields
      />
    </div>
  );
}
