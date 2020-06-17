import { RouteMiddleware } from '../../../types/route-middleware';
import { optionalUserWithScope } from '../../../utility/user-with-scope';
import { sql } from 'slonik';

type CollectionStats = {
  manifests: number;
  canvas: number;
};

export const getFlatCollectionStatistics: RouteMiddleware<{ id: string }> = async context => {
  const { siteId } = optionalUserWithScope(context, ['site.view']);
  const { id } = context.params;

  console.log(id, siteId);

  const result = await context.connection.maybeOne(
    sql<CollectionStats>`
        select manifest_total as manifests, canvas_total as canvases
        from iiif_derived_flat_collection_counts
        where flat_collection_id = ${id}
          and site_id = ${siteId}
      `
  );

  context.response.body = { manifests: 0, canvases: 0, ...(result || {}) };
};
