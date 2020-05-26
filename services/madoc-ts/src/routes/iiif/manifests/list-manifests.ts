import { optionalUserWithScope } from '../../../utility/user-with-scope';
import { mapMetadata } from '../../../utility/iiif-metadata';
import { getMetadata } from '../../../utility/iiif-database-helpers';
import { RouteMiddleware } from '../../../types/route-middleware';
import { ManifestListResponse } from '../../../types/schemas/manifest-list';
import { InternationalString } from '@hyperion-framework/types';
import { countResources } from '../../../database/queries/resource-queries';
import { getManifestList } from '../../../database/queries/get-manifest-snippets';

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
  const { siteId } = optionalUserWithScope(context, ['site.read']);
  const parent = context.query.parent ? Number(context.query.parent) : undefined;

  const manifestCount = 24;
  const pageQuery = Number(context.query.page) || 1;
  const { total = 0 } = await context.connection.one<{ total: number }>(countResources('manifest', siteId, parent));
  const totalPages = Math.ceil(total / manifestCount);
  const page = (pageQuery > totalPages ? totalPages : pageQuery) || 1;

  const manifestRows = await context.connection.any<ManifestSnippetRow>(
    getMetadata(
      getManifestList({
        siteId,
        parentId: parent,
        manifestCount,
        page,
      }),
      siteId,
      ['label']
    )
  );

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
