import { getValue } from '@iiif/vault-helpers';
import React, { useMemo } from 'react';
import { useMutation } from 'react-query';
import { EditShorthandCaptureModel } from '../../../shared/capture-models/EditorShorthandCaptureModel';
import { useApi } from '../../../shared/hooks/use-api';
import { Button } from '../../../shared/navigation/Button';
import { HrefLink } from '../../../shared/utility/href-link';
import { useRouteContext } from '../../../site/hooks/use-route-context';
import { useTopicType } from '../../../site/pages/loaders/topic-type-loader';
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
    console.log(status.data?.response)
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
      <EditShorthandCaptureModel
        template={model}
        data={{ label: '', type: topicType, other_labels: [{ value: '', language: '' }] }}
        onSave={async input => {
          await createNewEntityType(input);
        }}
        keepExtraFields
      />
    </div>
  );
}
