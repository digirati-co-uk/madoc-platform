import React from 'react';
import { useMutation } from 'react-query';
import { EditShorthandCaptureModel } from '../../../shared/capture-models/EditorShorthandCaptureModel';
import { useApi } from '../../../shared/hooks/use-api';
import { Button } from '../../../shared/navigation/Button';
import { HrefLink } from '../../../shared/utility/href-link';
import { CustomEditorTypes } from '../../../shared/page-blocks/custom-editor-types';
import { entityTypeModel } from '../../../../extensions/enrichment/models';

export function CreateNewTopicType() {
  const api = useApi();
  const [createNewEntityType, status] = useMutation(async (data: any) => {

    // @todo can change later.
    data.image_url = `${window.location.protocol}//${window.location.host}${data.image_url.publicLink || data.image_url}`;

    // data.other_labels = (data.other_labels || []).filter((e: any) => e.value !== '');
    return api.enrichment.upsertTopicType(data);
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
      <CustomEditorTypes>
        <EditShorthandCaptureModel
          template={entityTypeModel}
          data={{ label: '', other_labels: { en: [''] }, description: { en: [''] }, image_url: '' }}
          onSave={async data => {
            await createNewEntityType(data);
          }}
          keepExtraFields
        />
      </CustomEditorTypes>
    </div>
  );
}
