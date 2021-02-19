import { RouteMiddleware } from '../../types/route-middleware';
import { countResources } from '../../database/queries/resource-queries';
import { optionalUserWithScope } from '../../utility/user-with-scope';
import { sql } from 'slonik';

export const statistics: RouteMiddleware = async context => {
  const { siteId } = optionalUserWithScope(context, []);

  const collections = await context.connection.one(countResources({ resource_type: 'collection', site_id: siteId }));
  const manifests = await context.connection.one(countResources({ resource_type: 'manifest', site_id: siteId }));
  const canvases = await context.connection.one(countResources({ resource_type: 'canvas', site_id: siteId }));
  // @todo remove projects from here.
  const projects = await context.connection.one(
    sql`select count(*) as total from iiif_project where site_id = ${siteId}`
  );

  context.response.body = {
    collections: collections.total,
    manifests: manifests.total,
    canvases: canvases.total,
    projects: projects.total,
  };
};
