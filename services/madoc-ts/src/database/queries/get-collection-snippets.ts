import { sql, SqlSqlTokenType } from 'slonik';
import { metadataReducer } from '../../utility/iiif-metadata';

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

type CollectionAggregate = SqlSqlTokenType<{
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
}: {
  collectionId: number;
  siteId: number;
  page?: number;
  perPage?: number;
}) {
  const offset = (page - 1) * perPage;

  return sql<{
    collection_id: number;
    manifest_id: number;
    resource_type: string;
    manifest_canvas_count: number;
    collection_manifest_count: number;
    manifest_thumbnail: string;
  }>`
      with site_counts as (select * from iiif_derived_resource_item_counts where site_id = ${siteId})
      select ${collectionId}::int                                  as collection_id,
             manifest_links.item_id                                as manifest_id,
             canvas_count.item_total                               as manifest_canvas_count,
             manifest_count.item_total                             as collection_manifest_count,
             resource.type                                         as resource_type,
             resource.id                                           as resource_id,
             manifest_thumbnail(${siteId}, manifest_links.item_id) as manifest_thumbnail
      
      from iiif_derived_resource single_collection
               left join iiif_derived_resource_items manifest_links 
                        on  manifest_links.site_id = ${siteId}
                        and manifest_links.resource_id = single_collection.resource_id
                left join iiif_resource resource
                        on resource.id = manifest_links.item_id
               left join site_counts canvas_count
                         on canvas_count.resource_id = manifest_links.item_id
               left join site_counts manifest_count
                         on manifest_count.resource_id = ${collectionId}

      where single_collection.site_id = ${siteId}
        and single_collection.resource_id = ${collectionId}
      order by manifest_links.item_index
      limit ${perPage}
      offset ${offset}
  `;
}

function selectCollections({
  perPage = 24,
  page = 0,
  parentCollectionId,
  siteId,
}: {
  siteId: number;
  page?: number;
  perPage?: number;
  parentCollectionId?: number;
}) {
  const offset = (page - 1) * perPage;

  if (parentCollectionId) {
    return sql`
      select cidr.resource_id as collection_id
      from iiif_derived_resource cidr
      left join iiif_derived_resource_items cidri on cidr.id = cidri.item_id
      where resource_type = 'collection'  
        and cidr.site_id = ${siteId}
        and cidri.site_id = ${siteId}
        and cidri.resource_id = ${parentCollectionId} 
      limit ${perPage} offset ${offset}
    `;
  }

  return sql`
    select cidr.resource_id as collection_id
    from iiif_derived_resource cidr
    where resource_type = 'collection'  
      and cidr.site_id = ${siteId} 
    limit ${perPage} offset ${offset}
  `;
}

export function getCollectionList({
  siteId,
  page = 0,
  perPage = 24,
  parentCollectionId,
}: {
  siteId: number;
  page?: number;
  perPage?: number;
  parentCollectionId?: number;
}) {
  return sql<{
    collection_id: number;
    manifest_id: number;
    resource_type: string;
    manifest_canvas_count: number;
    collection_manifest_count: number;
    manifest_thumbnail: string;
  }>`
    with site_counts as (select * from iiif_derived_resource_item_counts where site_id = ${siteId})
    select collection_id as collection_id,
            manifest_links.item_id as manifest_id,
            manifest_links.type as resource_type,
            canvas_count.item_total                       as manifest_canvas_count,
            manifest_count.item_total                     as collection_manifest_count,
            manifest_thumbnail(${siteId}, manifest_links.item_id) as manifest_thumbnail
     from (${selectCollections({ parentCollectionId, siteId, perPage, page })}) collection(collection_id)
              left join (select im.item_id, im.resource_id, ir.type
                         from iiif_derived_resource_items im
                            left join iiif_resource ir on im.item_id = ir.id
                         where item_index <= 6
                           and type = 'manifest'
                           and site_id = ${siteId}) manifest_links on resource_id = collection_id
              left join site_counts canvas_count
                        on canvas_count.resource_id = manifest_links.item_id
              left join site_counts manifest_count
                        on manifest_count.resource_id = collection_id
    `;
}

export function getCollectionSnippets(
  collectionQuery: CollectionAggregate,
  { fields, siteId, allCollectionFields }: { fields: string[]; siteId: number; allCollectionFields: boolean }
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

export function mapCollectionSnippets(rows: CollectionSnippetsRow[]) {
  return rows.reduce(
    (state, row) => {
      if (state.metadata_ids.indexOf(row.metadata_id) !== -1) {
        return state;
      }

      state.metadata_ids.push(row.metadata_id);

      if (row.is_manifest) {
        if (!state.collection_to_manifest[row.collection_id]) {
          state.collection_to_manifest[row.collection_id] = [];
        }
        if (state.collection_to_manifest[row.collection_id].indexOf(row.manifest_id) === -1) {
          state.collection_to_manifest[row.collection_id].push(row.manifest_id);
        }

        const manifests = metadataReducer(state.manifests, row);

        // Add any extra rows.
        manifests[row.resource_id].canvasCount = row.canvas_count || 0;

        return {
          collection_to_manifest: state.collection_to_manifest,
          manifests,
          collections: state.collections,
          metadata_ids: state.metadata_ids,
        };
      }

      if (row.resource_id === null && row.collection_id) {
        // When there is no metadata.
        row.key = 'label';
        row.resource_id = row.collection_id;
        row.language = 'none';
        row.value = 'Untitled';
      }

      return {
        collection_to_manifest: state.collection_to_manifest,
        manifests: state.manifests,
        collections: metadataReducer(state.collections, row),
        metadata_ids: state.metadata_ids,
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
