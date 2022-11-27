import React from 'react';
import { useMutation } from 'react-query';
import { EnrichmentEntityType } from '../../../../extensions/enrichment/authority/types';
import { EditShorthandCaptureModel } from '../../../shared/capture-models/EditorShorthandCaptureModel';
import { useApi } from '../../../shared/hooks/use-api';
import { Button } from '../../../shared/navigation/Button';
import { HrefLink } from '../../../shared/utility/href-link';
import { entityTypeModel } from '../enrichment/authority/entity-type/entity-type-model';

export function CreateNewTopicType() {
  const api = useApi();
  const [createNewEntityType, status] = useMutation(async (data: Partial<EnrichmentEntityType>) => {
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
        <pre>{JSON.stringify(status.data, null, 2)}</pre>
        <Button $primary as={HrefLink} href={`/topics/${status.data?.label}`}>
          Go to topic type
        </Button>
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
