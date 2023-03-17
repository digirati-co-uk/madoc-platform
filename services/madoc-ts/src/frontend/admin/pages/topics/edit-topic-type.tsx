import React, { useMemo } from 'react';
import { useApi } from '../../../shared/hooks/use-api';
import { useMutation } from 'react-query';
import { Button } from '../../../shared/navigation/Button';
import { HrefLink } from '../../../shared/utility/href-link';
import { CustomEditorTypes } from '../../../shared/page-blocks/custom-editor-types';
import { EditShorthandCaptureModel } from '../../../shared/capture-models/EditorShorthandCaptureModel';
import { useTopicType } from '../../../site/pages/loaders/topic-type-loader';
import { entityTypeModel } from '../../../../extensions/enrichment/models';

export function EditTopicType() {
  const api = useApi();
  const { data, refetch } = useTopicType();

  const [createNewEntityType, status] = useMutation(async (updatedData: any) => {
    if (!data) return;
    if (typeof updatedData.image_url !== 'string' || !updatedData.image_url.startsWith('http')) {
      // @todo can change later.
      updatedData.image_url = `${window.location.protocol}//${window.location.host}${updatedData.image_url}`;
    }

    const resp = api.enrichment.upsertTopicType({ id: data.id, label: data.label, ...updatedData });

    refetch();

    return resp;
  });

  const model = useMemo(() => {
    const copy: any = {
      ...entityTypeModel,
    };
    delete copy.label;
    return copy;
  }, []);

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
        <Button $primary as={HrefLink} href={`/topics/${status.data.slug}`}>
          Go to topic type
        </Button>
      </div>
    );
  }

  return (
    <div>
      <CustomEditorTypes>
        <EditShorthandCaptureModel
          template={model}
          data={data}
          onSave={async d => {
            await createNewEntityType(d);
          }}
          keepExtraFields
        />
      </CustomEditorTypes>
    </div>
  );
}
