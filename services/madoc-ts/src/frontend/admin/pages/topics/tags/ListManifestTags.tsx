import { useData } from '../../../../shared/hooks/use-data';
import { EnrichmentResourceResponse, EntityTagSnippet } from '../../../../../extensions/enrichment/authority/types';
import { ParseResourceTags } from '../../../../site/hooks/canvas-menu/use-get-tags';
import { Subheading } from '@storybook/addon-docs';
import { TableContainer, TableRow, TableRowLabel } from '../../../../shared/layout/Table';
import { TagPill } from '../../../../site/hooks/canvas-menu/tagging-panel';
import { Link } from 'react-router-dom';
import { createLink } from '../../../../shared/utility/create-link';
import { serverRendererFor } from '../../../../shared/plugins/external/server-renderer-for';
import React from 'react';

export function ListManifestTags() {
  const { data } = useData<EnrichmentResourceResponse>(ListManifestTags);
  const ResourceTags = ParseResourceTags(data?.entity_tags);

  return (
    <div>
      <Subheading>This manifest is tagged with:</Subheading>
      <TableContainer>
        {ResourceTags.map(tagType => (
          <>
            <TableRow>
              <TableRowLabel>{tagType.type}</TableRowLabel>
            </TableRow>
            <TableRow>
              {tagType.tags.map((tag: EntityTagSnippet) =>
                tag.entity && tag.entity.label ? (
                  <TagPill
                    as={Link}
                    to={createLink({ admin: true, topicType: tag.entity.type_slug, topic: tag.entity.slug })}
                  >
                    {tag.entity.label}
                  </TagPill>
                ) : null
              )}
            </TableRow>
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
    return await api.enrichment.getSiteResource(`urn:madoc:manifest:${vars.id}`);
  },
});
