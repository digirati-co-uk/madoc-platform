import React from 'react';
import { useApi } from '../../../shared/hooks/use-api';
import { useMutation } from 'react-query';
import { Button } from '../../../shared/navigation/Button';
import { HrefLink } from '../../../shared/utility/href-link';
import { CustomEditorTypes } from '../../../shared/page-blocks/custom-editor-types';
import { EditShorthandCaptureModel } from '../../../shared/capture-models/EditorShorthandCaptureModel';
import { useTopic } from '../../../site/pages/loaders/topic-loader';
import { entityModel } from '../../../../extensions/enrichment/models';

export function EditTopic() {
  const api = useApi();
  const { data, refetch } = useTopic();
  const [createNewEntityType, status] = useMutation(async (updatedData: any) => {
    if (!data) return;
    if (typeof updatedData.image_url !== 'string' || !updatedData.image_url.startsWith('http')) {
      // @todo can change later.
      updatedData.image_url = `${window.location.protocol}//${window.location.host}${updatedData.image_url}`;
    }

    // data.other_labels = (data.other_labels || []).filter((e: any) => e.value !== '');
    const resp = api.enrichment.upsertTopicType({ id: data.id, ...updatedData });

    refetch();

    return resp;
  });

  if (!data) {
    return <div>Loading...</div>;
  }

  if (status.isError) {
    return <div>Error...</div>;
  }

  if (status.isSuccess && status.data) {
    return (
      <div>
        Updated
        <pre>{JSON.stringify(status.data, null, 2)}</pre>
        <Button $primary as={HrefLink} href={`/topics/${data.type_slug}/${status.data.slug}`}>
          Go to topic
        </Button>
      </div>
    );
  }

  return (
    <div>
      <CustomEditorTypes>
        <EditShorthandCaptureModel
          template={entityModel}
          data={data}
          onSave={async input => {
            await createNewEntityType(input);
          }}
          keepExtraFields
        />
      </CustomEditorTypes>
    </div>
  );
}
