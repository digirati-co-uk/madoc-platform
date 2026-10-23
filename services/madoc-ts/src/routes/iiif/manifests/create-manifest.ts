import { preserveIIIFProperties } from '../../../repository/iiif-annotations';
import { enqueueAnnotationPages } from '../../../iiif/queue-annotation-pages';
import { AnnotationPageRecord } from '../../../iiif/types';
import { api } from '../../../gateway/api.server';
import { sql } from 'slonik';
import { userWithScope } from '../../../utility/user-with-scope';
import { RouteMiddleware } from '../../../types/route-middleware';
import { CreateManifest } from '../../../types/schemas/create-manifest';
import { addLinks } from '../../../database/queries/linking-queries';
import { extractLinks } from '../../../utility/extract-links';

export const createManifest: RouteMiddleware<{}, CreateManifest> = async context => {
  const { userUrn, siteId, id: userId } = userWithScope(context, ['site.admin']);

  const manifestJson = JSON.stringify(context.requestBody.manifest);
  const localSource = null;
  const taskId = context.requestBody.taskId || null;

  let pendingPages: readonly AnnotationPageRecord[] = [];
  const { canonical_id } = await context.connection.transaction(async connection => {
    const resp = await connection.one<{ derived_id: number; canonical_id: number }>(
      sql`select * from create_manifest(${manifestJson}, ${localSource}, ${siteId}, ${userUrn}, ${taskId})`
    );

    // Always un-publish at creation.
    await connection.query(sql`
      update iiif_derived_resource set published = false where id = ${resp.derived_id}
    `);

    pendingPages = (await preserveIIIFProperties(connection, siteId, resp.canonical_id, context.requestBody.manifest)).pending;
    return resp;
  });

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

  await context.connection.query(sql`select refresh_item_counts()`);

  const userApi = api.asUser({ siteId, userId }, {}, true);
  context.disposableApis.push(userApi);
  await enqueueAnnotationPages(userApi, pendingPages, siteId, userId);

  context.response.body = { id: canonical_id };
  context.response.status = 201;
};
