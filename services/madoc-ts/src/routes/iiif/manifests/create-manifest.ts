import { sql } from 'slonik';
import { userWithScope } from '../../../utility/user-with-scope';
import { RouteMiddleware } from '../../../types/route-middleware';
import { CreateManifest } from '../../../types/schemas/create-manifest';
import { addLinks } from '../../../database/queries/linking-queries';
import { extractLinks } from '../../../utility/extract-links';

export const createManifest: RouteMiddleware<{}, CreateManifest> = async context => {
  const { userUrn, siteId } = userWithScope(context, ['site.admin']);

  const manifestJson = JSON.stringify(context.requestBody.manifest);
  const localSource = context.requestBody.local_source || null;
  const taskId = context.requestBody.taskId || null;

  const { canonical_id } = await context.connection.one<{ derived_id: number; canonical_id: number }>(
    sql`select * from create_manifest(${manifestJson}, ${localSource}, ${siteId}, ${userUrn}, ${taskId})`
  );

  try {
    const extracted = extractLinks(context.requestBody.manifest as any, 'iiif');
    // Links.
    const links = addLinks(extracted, canonical_id, siteId);
    if (links) {
      await context.connection.query(links);
    }
  } catch (err) {
    console.log(err);
  }

  context.response.body = { id: canonical_id };
  context.response.status = 201;
};
