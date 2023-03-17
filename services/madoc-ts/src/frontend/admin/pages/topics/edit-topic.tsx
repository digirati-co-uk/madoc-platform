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
  const [createNewEntity, status] = useMutation(async (updatedData: any) => {
    if (!data) return;

    if (updatedData.other_data.main_image) {
      const imageData = updatedData.other_data.main_image;
      updatedData.other_data.thumbnail = {
        id: imageData.id,
        alt: updatedData.other_data.thumbnail.alt,
        url: imageData.thumbnail,
      };
      updatedData.other_data.main_image = {
        id: imageData.id,
        alt: updatedData.other_data.thumbnail.alt,
        url: imageData.image,
      };
    }
    // if (typeof imageData.image !== 'string' || !imageData.image.startsWith('http')) {
    //   // @todo can change later.
    //   imageData.image = `${window.location.protocol}//${window.location.host}${imageData.image}`;
    //   imageData.thumbnail = `${window.location.protocol}//${window.location.host}${imageData.thumbnail}`;
    // }

    const resp = api.enrichment.upsertTopic({ id: data.id, ...updatedData });

    await refetch();

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
            await createNewEntity(input);
          }}
          keepExtraFields
        />
      </CustomEditorTypes>
    </div>
  );
}
