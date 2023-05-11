import React from 'react';
import { useApi } from '../../../../shared/hooks/use-api';
import { useMutation } from 'react-query';
import { Button } from '../../../../shared/navigation/Button';
import { HrefLink } from '../../../../shared/utility/href-link';
import { CustomEditorTypes } from '../../../../shared/page-blocks/custom-editor-types';
import { EditShorthandCaptureModel } from '../../../../shared/capture-models/EditorShorthandCaptureModel';
import { useTopic } from '../../../../site/pages/loaders/topic-loader';
import { entityModel } from '../../../../../extensions/enrichment/models';
import { ErrorMessage } from '../../../../shared/capture-models/editor/atoms/Message';

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

    if (updatedData.featured_resources) {
      const ftRes = updatedData.featured_resources;
      if (Array.isArray(ftRes)) {
        const newArr = ftRes.map((f: { madoc_id?: string; resource_id?: string }) =>
          typeof f === 'object' ? (f.resource_id ? f.resource_id : f.madoc_id) : f
        );
        updatedData.featured_resources = newArr.filter(x => x !== undefined || null);
      } else if (typeof ftRes === 'string') {
        updatedData.featured_resources = [ftRes];
      } else {
        updatedData.featured_resources = Object.values(ftRes);
      }
    }

    const resp = api.enrichment.upsertTopic({ id: data.id, ...updatedData });

    await refetch();

    return resp;
  });

  if (!data) {
    return <div>Loading...</div>;
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
    <div style={{ padding: '1em 0' }}>
      {status.isError && <ErrorMessage>Error... </ErrorMessage>}
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
