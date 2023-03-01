import React from 'react';
import { useMutation } from 'react-query';
import { EditShorthandCaptureModel } from '../../../../../shared/capture-models/EditorShorthandCaptureModel';
import { useApi } from '../../../../../shared/hooks/use-api';
import { entityModel } from '../../../../../../extensions/enrichment/models';

export function NewEntity() {
  const api = useApi();
  const [createNewEntityType, status] = useMutation(async (data: any) => {
    data.other_labels = (data.other_labels || []).filter((e: any) => e.value !== '');
    return api.authority.entity.create(data);
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
        template={entityModel}
        data={{ label: '', type: '', other_labels: [{ value: '', language: '' }] }}
        onSave={async data => {
          await createNewEntityType(data);
        }}
        keepExtraFields
      />
    </div>
  );
}
