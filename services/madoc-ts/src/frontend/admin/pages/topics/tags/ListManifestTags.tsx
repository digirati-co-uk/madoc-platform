import { useData } from '../../../../shared/hooks/use-data';
import { EnrichmentResource, EntityTagSnippet } from '../../../../../extensions/enrichment/types';
import { ParseResourceTags } from '../../../../site/hooks/canvas-menu/use-get-tags';
import { TableActions, TableContainer, TableRow, TableRowLabel } from '../../../../shared/layout/Table';
import { TagPill } from '../../../../site/hooks/canvas-menu/tagging-panel';
import { Link, useParams } from 'react-router-dom';
import { createLink } from '../../../../shared/utility/create-link';
import { serverRendererFor } from '../../../../shared/plugins/external/server-renderer-for';
import React, { useState } from 'react';
import { Button, SmallButton } from '../../../../shared/navigation/Button';
import { Subheading1 } from '../../../../shared/typography/Heading1';
import { useMutation } from 'react-query';
import { useApi } from '../../../../shared/hooks/use-api';
import { Spinner } from '../../../../shared/icons/Spinner';
import { ErrorMessage } from '../../../../shared/callouts/ErrorMessage';
import { AddTopicButton } from '../../../../site/features/AddTopicButton';
import { Accordion } from '../../../../shared/atoms/Accordion';
import { useTranslation } from 'react-i18next';

export function ListManifestTags() {
  const { data, isError, refetch } = useData<EnrichmentResource>(ListManifestTags);
  const ResourceTags = ParseResourceTags(data?.entity_tags);
  const api = useApi();
  const { t } = useTranslation();
  const { id } = useParams<{
    id: string;
  }>();
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);

  const onSelect = (i: string | undefined) => {
    setSelectedId(i);
  };

  const [createTag, createTagStatus] = useMutation(async (entityId: string) => {
    if (id && entityId) {
      const manifestId = Number(id);
      await api.enrichment.tagMadocResource(entityId, 'manifest', manifestId);
      await api.enrichment.triggerTask('index_madoc_resource', { id: manifestId, type: 'manifest' }, {}, false);
    }
    setSelectedId(undefined);
    await refetch();
  });

  const [removeTag, removeTagStatus] = useMutation(async (tagId: string) => {
    if (tagId && id) {
      const manifestId = Number(id);
      await api.enrichment.removeResourceTag(tagId);
      await api.enrichment.triggerTask('index_madoc_resource', { id: manifestId, type: 'manifest' }, {}, false);
    }
    await refetch();
  });

  return (
    <div>
      {removeTagStatus.isError || createTagStatus.isError || (isError && <ErrorMessage> Error </ErrorMessage>)}
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
        <Subheading1>{t('This manifest is tagged with')}:</Subheading1>
      )}
      <TableContainer>
        {ResourceTags.map(tagType => (
          <>
            <TableRow>
              <TableRowLabel style={{ textTransform: 'uppercase', fontSize: '1.2em' }}>{tagType.type}</TableRowLabel>
            </TableRow>
            <>
              {tagType.tags.map((tag: EntityTagSnippet) =>
                tag.entity && tag.entity.label ? (
                  <TableRow>
                    <TagPill
                      style={{ margin: 0 }}
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
                  </TableRow>
                ) : null
              )}
            </>
          </>
        ))}
      </TableContainer>
    </div>
  );
}

serverRendererFor(ListManifestTags, {
  getKey(params) {
    return ['manifest-resource', { id: params.id }];
  },
  getData: async (key: string, vars, api) => {
    return await api.getSiteEnrichmentResource(`urn:madoc:manifest:${vars.id}`);
  },
});
