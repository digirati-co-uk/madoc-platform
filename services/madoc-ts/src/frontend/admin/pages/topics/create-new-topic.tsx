import { getValue } from '@iiif/vault-helpers';
import React, { useMemo } from 'react';
import { useMutation } from 'react-query';
import { EditShorthandCaptureModel } from '../../../shared/capture-models/EditorShorthandCaptureModel';
import { useApi } from '../../../shared/hooks/use-api';
import { Button } from '../../../shared/navigation/Button';
import { HrefLink } from '../../../shared/utility/href-link';
import { useRouteContext } from '../../../site/hooks/use-route-context';
import { useTopicType } from '../../../site/pages/loaders/topic-type-loader';
import { CustomEditorTypes } from '../../../shared/page-blocks/custom-editor-types';
import { entityModel } from '../../../../extensions/enrichment/models';

export function CreateNewTopic() {
  const api = useApi();
  const { topicType } = useRouteContext();
  const { data, isLoading } = useTopicType();
  const hasTopic = data || isLoading;

  const [createNewEntityType, status] = useMutation(async (input: any) => {
    // input.other_labels = (input.other_labels || []).filter((e: any) => e.value !== '');

    if (hasTopic) {
      if (!data) {
        return;
      }
      // @todo can change later.
      input.image_url = `${window.location.protocol}//${window.location.host}${input.image_url.publicLink ||
        input.image_url}`;
      // @todo this will hopefully change.
      input.type = getValue(data.label);
      input.type_slug = data.slug;
    }
    return {
      response: await api.enrichment.upsertTopic(input),
      topicType: input.type_slug,
    };
  });
  const model = useMemo(() => {
    const copy: any = {
      ...entityModel,
    };

    if (topicType && topicType !== '_') {
      delete copy.type;
    }
    return copy;
  }, [topicType]);

  if (status.isError) {
    return <div>Error...</div>;
  }

  if (status.isSuccess) {
    return (
      <div>
        Added!
        <pre>{JSON.stringify(status.data?.response)}</pre>
        {/* @todo hopefully this will change to slug field. */}
        {status.data ? (
          <Button $primary as={HrefLink} href={`/topics/${status.data.topicType}/${status.data.response.label}`}>
            Go to topic
          </Button>
        ) : null}
      </div>
    );
  }

  if (isLoading) {
    return <div>loading...</div>;
  }

  return (
    <div>
      <CustomEditorTypes>
        <EditShorthandCaptureModel
          template={model}
          data={{
            label: '',
            other_labels: { en: [''] },
            description: { en: [''] },
            image_url: '',
            type: topicType,
          }}
          onSave={async input => {
            await createNewEntityType(input);
          }}
          keepExtraFields
        />
      </CustomEditorTypes>
    </div>
  );
}
