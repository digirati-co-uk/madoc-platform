import { getValue } from '@iiif/vault-helpers';
import React, { useMemo } from 'react';
import { useMutation } from 'react-query';
import { EditShorthandCaptureModel } from '../../../../shared/capture-models/EditorShorthandCaptureModel';
import { useApi } from '../../../../shared/hooks/use-api';
import { Button } from '../../../../shared/navigation/Button';
import { HrefLink } from '../../../../shared/utility/href-link';
import { useRouteContext } from '../../../../site/hooks/use-route-context';
import { useTopicType } from '../../../../site/pages/loaders/topic-type-loader';
import { CustomEditorTypes } from '../../../../shared/page-blocks/custom-editor-types';
import { entityModel } from '../../../../../extensions/enrichment/models';
import { ErrorMessage } from '../../../../shared/capture-models/editor/atoms/Message';
import { Heading2 } from '../../../../shared/typography/Heading2';
import { useTranslation } from 'react-i18next';

export function CreateNewTopic() {
  const api = useApi();
  const { t } = useTranslation();
  const { topicType } = useRouteContext();
  const { data, isLoading } = useTopicType();
  const hasTopic = data || isLoading;

  const [createNewEntityType, status] = useMutation(async (input: any) => {
    if (input.other_data.main_image) {
      const imageData = input.other_data.main_image;
      input.other_data.thumbnail = {
        id: imageData.id,
        alt: input.other_data.thumbnail ? input.other_data.thumbnail : 'thumbnail image',
        url: imageData.thumbnail,
      };
      input.other_data.main_image = {
        id: imageData.id,
        alt: input.other_data.thumbnail ? input.other_data.thumbnail : 'hero image',
        url: imageData.image,
      };
    }

    if (input.featured_resources) {
      if (input.featured_resources[0].length) {
        const ftRes = input.featured_resources;
        if (Array.isArray(ftRes)) {
          const newArr = ftRes.map((f: { madoc_id?: string; resource_id?: string }) =>
            typeof f === 'object' ? (f.resource_id ? f.resource_id : f.madoc_id) : f
          );
          input.featured_resources = newArr.filter(x => x !== undefined || null);
        } else if (typeof ftRes === 'string') {
          input.featured_resources = [ftRes];
        } else {
          input.featured_resources = Object.values(ftRes);
        }
      }
      delete input.featured_resources;
    }

    if (!input.authorities || !input.authorities[0].url) {
      delete input.authorities;
    }

    //todo hopfully will change
    if (data && hasTopic) {
      input.type = getValue(data.label);
      input.type_slug = getValue(data.slug);
    } else {
      input.type = input.type.label;
    }

    return {
      response: await api.enrichment.upsertTopic({ type_slug: input.type.toLowerCase(), ...input }),
      topicType: input.type_slug,
    };
  });
  const model = useMemo(() => {
    const copy: any = {
      ...entityModel,
    };

    delete copy['featured_resources.madoc_id'];
    if (topicType && topicType !== '_') {
      delete copy.type;
    }
    return copy;
  }, [topicType]);

  if (status.isSuccess) {
    return (
      <div>
        {t('Added!')}
        <pre>{JSON.stringify(status.data?.response)}</pre>
        {status.data ? (
          <Button $primary as={HrefLink} href={`/topics/${status.data.topicType}/${status.data.response.label}`}>
            {t('Go to topic')}
          </Button>
        ) : null}
      </div>
    );
  }

  if (isLoading) {
    return <div>{t('loading...')}</div>;
  }

  return (
    <div>
      <Heading2>{t('Create new Topic')}</Heading2>
      {status.isError && <ErrorMessage>{t('Error...')}</ErrorMessage>}
      <CustomEditorTypes>
        <EditShorthandCaptureModel
          template={model}
          data={{
            ...data,
            type: topicType,
            label: '',
            title: '',
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