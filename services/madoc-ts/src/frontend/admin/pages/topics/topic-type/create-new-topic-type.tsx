import React, { useMemo, useState } from 'react';
import { useMutation } from 'react-query';
import { EditShorthandCaptureModel } from '../../../../shared/capture-models/EditorShorthandCaptureModel';
import { useApi } from '../../../../shared/hooks/use-api';
import { Button } from '../../../../shared/navigation/Button';
import { HrefLink } from '../../../../shared/utility/href-link';
import { CustomEditorTypes } from '../../../../shared/page-blocks/custom-editor-types';
import { entityTypeModel } from '../../../../../extensions/enrichment/models';
import { ErrorMessage } from '../../../../shared/capture-models/editor/atoms/Message';

export function CreateNewTopicType() {
  const api = useApi();
  const [error, setError] = useState('');
  const [createNewEntityType, status] = useMutation(async (data: any) => {
    if (!data) return;
    // @todo can change later.
    data.image_url = `${window.location.protocol}//${window.location.host}${data.image_url.publicLink ||
      data.image_url}`;

    if (data.featured_topics) {
      if (data.featured_topics[0].length) {
        data.featured_topics = data.featured_topics
          .map((f: { slug: { id: any } }) => f.slug.id)
          .filter((f: string) => f !== undefined);
      }
      delete data.featured_topics;
    }

    return api.enrichment.upsertTopicType(data);
  });

  console.log(error);
  const model = useMemo(() => {
    const copy: any = {
      ...entityTypeModel,
    };
    delete copy['featured_topics.slug'];
    return copy;
  }, []);

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
      {status.isError && <ErrorMessage>Error... </ErrorMessage>}
      <CustomEditorTypes>
        <EditShorthandCaptureModel
          template={model}
          data={{ label: '', title: { en: [''] }, description: { en: [''] }, image_url: '' }}
          onSave={async data => {
            await createNewEntityType(data);
          }}
          keepExtraFields
        />
      </CustomEditorTypes>
    </div>
  );
}
