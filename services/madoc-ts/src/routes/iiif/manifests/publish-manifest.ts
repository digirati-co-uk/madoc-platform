import { sql } from 'slonik';
import { RouteMiddleware } from '../../../types/route-middleware';
import { userWithScope } from '../../../utility/user-with-scope';

export const publishManifest: RouteMiddleware<{ id: string }, { isPublished?: boolean }> = async context => {
  // Only published the manifest.
  const { siteId } = userWithScope(context, ['site.admin']);
  const { isPublished = true } = context.requestBody;
  const manifestId = Number(context.params.id);

  if (isPublished) {
    // Publish.
    await context.connection.query(sql`
      update iiif_derived_resource set published = true where resource_id = ${manifestId} and resource_type = 'manifest' and site_id = ${siteId}
    `);
  } else {
    // Unpublish.
    await context.connection.query(sql`
      update iiif_derived_resource set published = false where resource_id = ${manifestId} and resource_type = 'manifest' and site_id = ${siteId}
    `);
  }

  context.response.status = 201;
};
