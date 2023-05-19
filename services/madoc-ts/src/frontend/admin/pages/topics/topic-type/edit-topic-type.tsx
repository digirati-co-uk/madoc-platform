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
import { useTranslation } from 'react-i18next';

export function EditTopicType() {
  const api = useApi();
  const { data, refetch } = useTopicType();
  const { t } = useTranslation();

  const [createNewEntityType, status] = useMutation(async (updatedData: any) => {
    if (!data) return;

    if (typeof updatedData.image_url !== 'string' || !updatedData.image_url.startsWith('http')) {
      // @todo can change later.
      updatedData.image_url = `${window.location.protocol}//${window.location.host}${updatedData.image_url}`;
    }
    if (data.topic_count > 0) {
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
      updatedData.featured_topics = [];
    }
    const resp = api.enrichment.upsertEntityType({
      id: data.id,
      label: data.label,
      ...updatedData,
    });

    await refetch();
    return resp;
  });

  const model = useMemo(() => {
    const copy: any = {
      ...entityTypeModel,
    };
    delete copy.label;
    // dont allow editing featured if not enough to chose from
    // backend automatically picks first 3
    if (data && data.topic_count < 4) {
      delete copy.featured_topics;
    }
    return copy;
  }, [data]);

  if (!data) {
    return <div>{t('Loading...')}</div>;
  }

  if (status.isSuccess && status.data) {
    return (
      <div>
        {t('Updated')}
        <pre>{JSON.stringify(status.data, null, 2)}</pre>
        <Button $primary as={HrefLink} href={`/topics/${status.data.slug}`}>
          {t('Go to topic type')}
        </Button>
      </div>
    );
  }

  return (
    <div>
      {status.isError && <ErrorMessage>{t('Error...')} </ErrorMessage>}
      <CustomEditorTypes>
        <EditShorthandCaptureModel
          template={model}
          data={{ ...data }}
          onSave={async d => {
            await createNewEntityType(d);
          }}
          keepExtraFields
        />
      </CustomEditorTypes>
    </div>
  );
}
