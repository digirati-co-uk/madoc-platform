import { sql, TaggedTemplateLiteralInvocationType } from 'slonik';
import { metadataReducer } from '../../utility/iiif-metadata';
import { SQL_EMPTY, SQL_INT_ARRAY } from '../../utility/postgres-tags';

export type CollectionSnippetsRow = {
  collection_id: number;
  manifest_id: number;
  metadata_id: number;
  resource_type: string;
  is_manifest: boolean;
  manifest_thumbnail: string | null;
  key: string;
  value: string;
  language: string;
  source: string;
  resource_id: number;
  canvas_count?: number;
};

type CollectionAggregate = TaggedTemplateLiteralInvocationType<{
  collection_id: number;
  manifest_id: number;
  resource_type: string;
  manifest_canvas_count: number;
  collection_manifest_count: number;
  manifest_thumbnail: string;
}>;

export function getSingleCollection({
  collectionId,
  siteId,
  page = 0,
  perPage = 24,
  type,
  excludeManifests,
}: {
  collectionId: number;
  siteId: number;
  page?: number;
  perPage?: number;
  type?: 'manifest' | 'collection';
  excludeManifests?: number[];
}) {
  const offset = (page - 1) * perPage;

  const manifestExclusion = excludeManifests
    ? sql`and manifest_links.item_id = any(${sql.array(excludeManifests, SQL_INT_ARRAY)}) is false`
    : SQL_EMPTY;

  return sql<{
    collection_id: number;
    manifest_id: number;
    resource_type: string;
    manifest_canvas_count: number;
    collection_manifest_count: number;
    manifest_thumbnail: string;
    published: boolean;
  }>`
      select ${collectionId}::int                                  as collection_id,
             manifest_links.item_id                                as manifest_id,
             canvas_count.item_total                               as manifest_canvas_count,
             manifest_count.item_total                             as collection_manifest_count,
             resource.type                                         as resource_type,
             resource.id                                           as resource_id,
             manifest_thumbnail(${siteId}, manifest_links.item_id) as manifest_thumbnail,
             single_collection.published                           as published
      
      from iiif_derived_resource single_collection
               left join iiif_derived_resource_items manifest_links 
                        on  manifest_links.site_id = ${siteId}
                        and manifest_links.resource_id = single_collection.resource_id
                        ${manifestExclusion}
                left join iiif_resource resource
                        on resource.id = manifest_links.item_id
               left join iiif_derived_resource_item_counts canvas_count
                         on canvas_count.resource_id = manifest_links.item_id and canvas_count.site_id = ${siteId}
               left join iiif_derived_resource_item_counts manifest_count
                         on manifest_count.resource_id = ${collectionId} and manifest_count.site_id = ${siteId}

      where single_collection.site_id = ${siteId}
        and single_collection.resource_id = ${collectionId}
        and single_collection.resource_type = 'collection'
      ${
        type
          ? type === 'collection'
            ? sql`and resource.type = 'collection'`
            : sql`and resource.type = 'manifest'`
          : sql``
      }
      order by manifest_links.item_index
      limit ${perPage}
      offset ${offset}
  `;
}

function selectCollections({
  perPage = 24,
  page = 0,
  parentCollectionId,
  hideFlat = true,
  siteId,
  onlyPublished,
}: {
  siteId: number;
  page?: number;
  perPage?: number;
  hideFlat?: boolean;
  parentCollectionId?: number;
  onlyPublished?: boolean;
}) {
  const offset = (page - 1) * perPage;

  if (parentCollectionId) {
    return sql`
      select cidr.resource_id as collection_id, cidr.published as published
      from iiif_derived_resource cidr
      left join iiif_derived_resource_items cidri on cidr.resource_id = cidri.item_id
      where resource_type = 'collection'  
        and cidr.site_id = ${siteId}
        and cidri.site_id = ${siteId}
        ${hideFlat ? sql`and cidr.flat = false` : SQL_EMPTY}
        ${onlyPublished ? sql`and cidr.published = true` : SQL_EMPTY}
        and cidri.resource_id = ${parentCollectionId} 
      limit ${perPage} offset ${offset}
    `;
  }

  return sql`
    select cidr.resource_id as collection_id, cidr.published as published
    from iiif_derived_resource cidr
    where resource_type = 'collection'  
      and cidr.site_id = ${siteId}
      ${hideFlat ? sql`and cidr.flat = false` : SQL_EMPTY}
      ${onlyPublished ? sql`and cidr.published = true` : SQL_EMPTY}
    limit ${perPage} offset ${offset}
  `;
}

export function getCollectionList({
  siteId,
  page = 0,
  perPage = 24,
  parentCollectionId,
  onlyPublished,
}: {
  siteId: number;
  page?: number;
  perPage?: number;
  parentCollectionId?: number;
  onlyPublished?: boolean;
}) {
  return sql<{
    collection_id: number;
    manifest_id: number;
    resource_type: string;
    manifest_canvas_count: number;
    collection_manifest_count: number;
    manifest_thumbnail: string;
  }>`
    select collection_id as collection_id,
            manifest_links.item_id as manifest_id,
            manifest_links.type as resource_type,
            canvas_count.item_total                       as manifest_canvas_count,
            manifest_count.item_total                     as collection_manifest_count,
            manifest_thumbnail(${siteId}, manifest_links.item_id) as manifest_thumbnail,
            collection.published                          as published
     from (${selectCollections({
       parentCollectionId,
       siteId,
       perPage,
       page,
       onlyPublished,
     })}) collection(collection_id, published)
              left join (select im.item_id, im.resource_id, ir.type
                         from iiif_derived_resource_items im
                            left join iiif_resource ir on im.item_id = ir.id
                         where item_index <= 6
                           and type = 'manifest'
                           and site_id = ${siteId}) manifest_links on resource_id = collection_id
              left join iiif_derived_resource_item_counts canvas_count
                        on canvas_count.resource_id = manifest_links.item_id and canvas_count.site_id = ${siteId}
              left join iiif_derived_resource_item_counts manifest_count
                        on manifest_count.resource_id = collection_id and manifest_count.site_id = ${siteId}
    `;
}

export function getCollectionSnippets(
  collectionQuery: CollectionAggregate,
  { fields, siteId, allCollectionFields }: { fields?: string[]; siteId: number; allCollectionFields: boolean }
) {
  return sql<CollectionSnippetsRow>`   
        select
            collections_aggregation.collection_id as collection_id,
            collections_aggregation.manifest_id as manifest_id,
            (collections_aggregation.manifest_id = metadata.resource_id) as is_manifest,
            collections_aggregation.manifest_thumbnail as thumbnail,
            collections_aggregation.manifest_canvas_count as canvas_count,
            collections_aggregation.collection_manifest_count as manifest_count,
            collections_aggregation.resource_type as resource_type,
            collections_aggregation.published as published,
            metadata.id as metadata_id,
            metadata.key,
            metadata.value,
            metadata.language,
            metadata.source,
            metadata.resource_id

        from (${collectionQuery}) collections_aggregation
                 left join iiif_metadata metadata
                           on (collections_aggregation.collection_id = metadata.resource_id or
                              collections_aggregation.manifest_id = metadata.resource_id) 
                              and metadata.site_id = ${siteId}
                            ${
                              fields && !allCollectionFields
                                ? sql`and metadata.key = ANY (${sql.array(fields, 'text')})`
                                : sql``
                            } 
                            ${
                              fields && allCollectionFields
                                ? sql`and (
                                  (collections_aggregation.manifest_id = metadata.resource_id) = false 
                                    or metadata.key = ANY (${sql.array(fields, 'text')})
                                  )`
                                : sql``
                            }
    `;
}

export function mapCollectionSnippets(rows: readonly CollectionSnippetsRow[]) {
  return rows.reduce(
    (state, row) => {
      let { collections, manifests } = state;
      const { collection_to_manifest, metadata_ids } = state;

      // Always add mapping for collection to manifest.
      if (row.manifest_id && !collection_to_manifest[row.collection_id]) {
        collection_to_manifest[row.collection_id] = [];
      }
      if (row.manifest_id && collection_to_manifest[row.collection_id].indexOf(row.manifest_id) === -1) {
        collection_to_manifest[row.collection_id].push(row.manifest_id);
      }

      if (row.resource_id === null && row.collection_id) {
        // When there is no metadata.
        row.key = 'label';
        row.resource_id = row.collection_id;
        row.language = 'none';
        row.value = 'Untitled';
      }

      if (metadata_ids.indexOf(row.metadata_id) === -1) {
        if (row.is_manifest) {
          manifests = metadataReducer(manifests, row);

          // Add any extra rows.
          manifests[row.resource_id].canvasCount = row.canvas_count || 0;
        } else {
          collections = metadataReducer(state.collections, row);
        }

        // Track which metadata ids have been reduced.
        metadata_ids.push(row.metadata_id);
      }

      return {
        collection_to_manifest,
        manifests,
        collections,
        metadata_ids,
      };
    },
    {
      collections: {},
      manifests: {},
      collection_to_manifest: {},
      metadata_ids: [],
    } as {
      collections: any;
      manifests: any;
      collection_to_manifest: any;
      metadata_ids: number[];
    }
  );
}
