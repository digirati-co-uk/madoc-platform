import React from 'react';
import { EnrichmentResourceResponse, EntityTagSnippet } from '../../../../../extensions/enrichment/authority/types';
import { useData } from '../../../../shared/hooks/use-data';
import { serverRendererFor } from '../../../../shared/plugins/external/server-renderer-for';
import { ParseResourceTags } from '../../../../site/hooks/canvas-menu/use-get-tags';
import { Link } from 'react-router-dom';
import { createLink } from '../../../../shared/utility/create-link';
import { TagPill } from '../../../../site/hooks/canvas-menu/tagging-panel';
import { Subheading } from '@storybook/addon-docs';
import { TableContainer, TableRow, TableRowLabel } from '../../../../shared/layout/Table';

export function ListCanvasTags() {
  const { data } = useData<EnrichmentResourceResponse>(ListCanvasTags);
  const ResourceTags = ParseResourceTags(data?.entity_tags);

  return (
    <div>
      <Subheading>This canvas is tagged with:</Subheading>
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

serverRendererFor(ListCanvasTags, {
  getKey(params) {
    return ['canvas-resource', { id: params.id }];
  },
  getData: async (key: string, vars, api) => {
    return await api.enrichment.getSiteResource(`urn:madoc:canvas:${vars.id}`);
  },
});
