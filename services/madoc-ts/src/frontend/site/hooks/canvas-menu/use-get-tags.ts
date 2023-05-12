import { EntityTagSnippet } from '../../../../extensions/enrichment/authority/types';
import { useEnrichmentResource } from '../../pages/loaders/enrichment-resource-loader';

export interface ResourceTags {
  type: string;
  tags: EntityTagSnippet[];
}

export function useGetResourceTags(): ResourceTags[] {
  const { data } = useEnrichmentResource();
  return ParseResourceTags(data?.entity_tags);
}
export function ParseResourceTags(tags: EntityTagSnippet[] | undefined): ResourceTags[] {
  const initTags = tags ? tags : [];

  const tagTypes = initTags.reduce((tag, elem) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    tag[elem.entity.type] = (tag[elem.entity.type] || []).concat(elem);
    return tag;
  }, {});

  return !tagTypes
    ? []
    : Object.keys(tagTypes).map(k => {
        return {
          type: k,
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          tags: tagTypes[k],
        };
      });
}
