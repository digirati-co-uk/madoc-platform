import React, { useMemo } from 'react';
import { useApi } from '../../../../shared/hooks/use-api';
import { useMutation } from 'react-query';
import { Button } from '../../../../shared/navigation/Button';
import { HrefLink } from '../../../../shared/utility/href-link';
import { CustomEditorTypes } from '../../../../shared/page-blocks/custom-editor-types';
import { EditShorthandCaptureModel } from '../../../../shared/capture-models/EditorShorthandCaptureModel';
import { useTopicType } from '../../../../site/pages/loaders/topic-type-loader';
import { entityTypeModel } from '../../../../../extensions/enrichment/models';
import { ErrorMessage } from '../../../../shared/capture-models/editor/atoms/Message';

export function EditTopicType() {
  const api = useApi();
  const { data, refetch } = useTopicType();

  const [createNewEntityType, status] = useMutation(async (updatedData: any) => {
    if (!data) return;
    if (typeof updatedData.image_url !== 'string' || !updatedData.image_url.startsWith('http')) {
      // @todo can change later.
      updatedData.image_url = `${window.location.protocol}//${window.location.host}${updatedData.image_url}`;
    }
    // @todo can hopfully change this
    if (updatedData.featured_topics) {
      const unEdited = updatedData.featured_topics.filter((f: { slug: { id: any } }) => !f.slug.id);

      const ogItems = data.featured_topics?.filter(g => {
        return unEdited.some((t: { slug: string }) => g.slug.includes(t.slug));
      });
      const ogIds = ogItems?.map((f: { id: any }) => f.id);
      const newIds = updatedData.featured_topics
        .map((f: { slug: { id: any } }) => f.slug.id)
        .filter((f: string) => f !== undefined);

      updatedData.featured_topics = ogIds?.concat(newIds);
    }
    const resp = api.enrichment.upsertTopicType({
      id: data.id,
      label: data.label,
      ...updatedData,
    });

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
      {status.isError && <ErrorMessage>Error... </ErrorMessage>}
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
