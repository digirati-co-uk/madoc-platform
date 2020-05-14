import { sql } from 'slonik';
import { userWithScope } from '../../../utility/user-with-scope';
import { mapMetadata } from '../../../utility/iiif-metadata';
import { getMetadata } from '../../../utility/iiif-database-helpers';
import { RouteMiddleware } from '../../../types/route-middleware';
import { ManifestListResponse } from '../../../types/schemas/manifest-list';
import { InternationalString } from '@hyperion-framework/types';

type ManifestSnippetRow = {
  resource_id: number;
  created_at: Date;
  key: string;
  value: string;
  language: string;
  source: string;
  thumbnail?: string;
  canvas_total: number;
};

export const listManifests: RouteMiddleware = async context => {
  const { siteId } = userWithScope(context, []);

  const manifestCount = 24;
  const pageQuery = Number(context.query.page) || 1;
  const { total = 0 } = await context.connection.one<{ total: number }>(sql`
      select count(*) as total
          from iiif_derived_resource
          where resource_type = 'manifest' 
          and site_id = ${siteId}
  `);
  const totalPages = Math.ceil(total / manifestCount);
  const page = (pageQuery > totalPages ? totalPages : pageQuery) || 1;

  const manifestRows = await context.connection.any<ManifestSnippetRow>(
    getMetadata(
      sql`
          with site_counts as (select * from iiif_derived_resource_item_counts where site_id = ${siteId})
          select manifests.resource_id as resource_id, manifest_thumbnail(${siteId}, manifests.resource_id) as thumbnail, canvas_count.item_total as canvas_total
          from iiif_derived_resource manifests
          left join site_counts canvas_count
               on canvas_count.resource_id = manifests.resource_id
          where manifests.resource_type = 'manifest' 
            and manifests.site_id = ${siteId}
            limit ${manifestCount} offset ${(page - 1) * manifestCount}
        `,
      siteId,
      ['label']
    )
  );

  console.log(manifestRows);

  const manifests = mapMetadata<{ label: InternationalString }, ManifestSnippetRow>(manifestRows, row => ({
    id: row.resource_id,
    thumbnail: row.thumbnail,
    canvasCount: row.canvas_total || 0,
  }));

  context.response.body = {
    manifests,
    pagination: {
      page,
      totalPages,
      totalResults: total,
    },
  } as ManifestListResponse;
};
