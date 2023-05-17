import React, { useState } from 'react';
import { EnrichmentResourceResponse, EntityTagSnippet } from '../../../../../extensions/enrichment/authority/types';
import { useData } from '../../../../shared/hooks/use-data';
import { serverRendererFor } from '../../../../shared/plugins/external/server-renderer-for';
import { ParseResourceTags } from '../../../../site/hooks/canvas-menu/use-get-tags';
import { Link, useParams } from 'react-router-dom';
import { createLink } from '../../../../shared/utility/create-link';
import { TagPill } from '../../../../site/hooks/canvas-menu/tagging-panel';
import { TableActions, TableContainer, TableRow, TableRowLabel } from '../../../../shared/layout/Table';
import { Subheading1 } from '../../../../shared/typography/Heading1';
import { useApi } from '../../../../shared/hooks/use-api';
import { useTranslation } from 'react-i18next';
import { useMutation } from 'react-query';
import { ErrorMessage } from '../../../../shared/callouts/ErrorMessage';
import { Accordion } from '../../../../shared/atoms/Accordion';
import { Spinner } from '../../../../shared/icons/Spinner';
import { AddTopicButton } from '../../../../site/features/AddTopicButton';
import { Button, SmallButton } from '../../../../shared/navigation/Button';

export function ListCanvasTags() {
  const { data, isError, refetch } = useData<EnrichmentResourceResponse>(ListCanvasTags);
  const ResourceTags = ParseResourceTags(data?.entity_tags);
  const api = useApi();
  const { t } = useTranslation();
  const { id } = useParams<{
    id: string;
  }>();
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);

  const onSelect = (id: string | undefined) => {
    setSelectedId(id);
  };

  const [createTag, createTagStatus] = useMutation(async (entityId: string) => {
    if (id && entityId) {
      const manifestId = Number(id);
      await api.enrichment.tagMadocResource(entityId, 'canvas', manifestId);
      await api.enrichment.triggerTask('index_madoc_resource', { id: manifestId, type: 'canvas' }, {}, false);
    }
    setSelectedId(undefined);
    await refetch();
  });

  const [removeTag, removeTagStatus] = useMutation(async (tagId: string) => {
    if (tagId && id) {
      const manifestId = Number(id);
      await api.enrichment.removeResourceTag(tagId);
      await api.enrichment.triggerTask('index_madoc_resource', { id: manifestId, type: 'canvas' }, {}, false);
    }
    await refetch();
  });

  return (
    <div>
      {removeTagStatus.isError || createTagStatus.isError || (isError && <ErrorMessage>{t('Error...')}</ErrorMessage>)}
      <Accordion title={t('Add New Tag')} defaultOpen={false}>
        {createTagStatus.isLoading ? (
          <Spinner />
        ) : (
          <div>
            <AddTopicButton onSelected={onSelect} statusLoading={createTagStatus.isLoading} />
            <Button
              style={{ marginTop: '1em' }}
              disabled={!selectedId}
              onClick={() => {
                createTag(selectedId).then(r => refetch);
              }}
            >
              {t('Submit')}
            </Button>
          </div>
        )}
      </Accordion>
      {!ResourceTags || !ResourceTags.length ? (
        <Subheading1>{t('This resource is not tagged with any topics')}</Subheading1>
      ) : (
        <Subheading1>{t('This canvas is tagged with')}:</Subheading1>
      )}

      <TableContainer>
        {ResourceTags.map(tagType => (
          <>
            <TableRow>
              <TableRowLabel>{tagType.type}</TableRowLabel>
            </TableRow>
            <TableRow>
              {tagType.tags.map((tag: EntityTagSnippet) =>
                tag.entity && tag.entity.label ? (
                  <>
                    <TagPill
                      as={Link}
                      to={createLink({ admin: true, topicType: tag.entity.type_slug, topic: tag.entity.slug })}
                    >
                      {tag.entity.label}
                    </TagPill>
                    <TableActions>
                      {removeTagStatus.isLoading ? (
                        <Spinner />
                      ) : (
                        <SmallButton onClick={() => removeTag(tag.tag_id)}>{t('Remove')}</SmallButton>
                      )}
                    </TableActions>
                  </>
                ) : null
              )}
            </TableRow>
          </>
        ))}
      </TableContainer>
    </div>
  );
}

serverRendererFor(ListCanvasTags, {
  getKey(params) {
    return ['canvas-resource', { id: params.id }];
  },
  getData: async (key: string, vars, api) => {
    return await api.enrichment.getSiteEnrichmentResource(`urn:madoc:canvas:${vars.id}`);
  },
});
