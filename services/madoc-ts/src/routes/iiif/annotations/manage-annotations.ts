import { ConflictError } from '../../../utility/errors/conflict';
import { randomUUID } from 'crypto';
import { sql, SerializableValueType, UniqueIntegrityConstraintViolationError } from 'slonik';
import { api } from '../../../gateway/api.server';
import { enqueueAnnotationPages } from '../../../iiif/queue-annotation-pages';
import * as backfill from '../../../gateway/tasks/backfill-iiif-properties';
import {
  AnnotationPageInput,
  CompleteAnnotationPageRequest,
  ImportIIIFPropertiesRequest,
} from '../../../types/schemas/annotations';
import { RouteMiddleware, ServerContext } from '../../../types/route-middleware';
import { userWithScope } from '../../../utility/user-with-scope';
import { RequestError } from '../../../utility/errors/request-error';
import {
  getAnnotationPage,
  insertAnnotationPage,
  invalidateIIIF,
  listAnnotationPages,
  preserveIIIFProperties,
  requireIIIFResource,
  saveAnnotationDocument,
} from '../../../repository/iiif-annotations';
import { AnnotationPageRecord, StoredAnnotation } from '../../../iiif/types';
import { identifier, object } from '../../../iiif/properties';
import { normalizePage, remoteTextBodies } from '../../../iiif/annotation-document';
import { validateRemoteUrl } from '../../../iiif/fetch-annotation-page';

interface Params {
  id: string;
  pageId: string;
}

async function admin(context: ServerContext<Params>) {
  const scope = userWithScope(context, ['site.admin']);
  const resourceId = Number(context.params.id);
  const resource = await requireIIIFResource(context.connection, scope.siteId, resourceId);
  const userApi = api.asUser({ siteId: scope.siteId, userId: scope.id }, {}, true);
  context.disposableApis.push(userApi);
  return { ...scope, resourceId, resource, userApi };
}

async function queuePages(context: ServerContext<Params>, pages: readonly AnnotationPageRecord[]) {
  const { userApi, siteId, id } = await admin(context);
  await enqueueAnnotationPages(userApi, pages, siteId, id);
}

export const listAnnotations: RouteMiddleware<Params> = async context => {
  const { siteId, resourceId } = await admin(context);
  context.body = {
    pages: await listAnnotationPages(context.connection, siteId, resourceId, context.query.summary === 'true'),
  };
};

export const addAnnotation: RouteMiddleware<Params, AnnotationPageInput> = async context => {
  const { siteId, resourceId, userApi } = await admin(context);
  const body = context.requestBody;
  if (!body) throw new RequestError('Annotation page is required');
  if (
    body.position !== undefined &&
    (!Number.isInteger(body.position) || body.position < 0 || body.position > 2147483647)
  )
    throw new RequestError('Invalid page position');
  const uri =
    body.mode === 'external' ? validateRemoteUrl(body.url).href : identifier(body.page) || `urn:uuid:${randomUUID()}`;
  const document = body.mode === 'json' ? normalizePage(body.page, uri) : undefined;
  const page = await context.connection.transaction(async connection => {
    const result = await insertAnnotationPage(connection, siteId, resourceId, uri, body.label || 'Annotations', {
      mode: body.mode,
      position: body.position ?? 0,
      generation: 0,
      status: 'pending',
      edited: true,
    });
    if (document) await saveAnnotationDocument(connection, siteId, result, document);
    await invalidateIIIF(connection, siteId, resourceId);
    return result;
  });
  if (body.mode === 'external' || (document && remoteTextBodies(document).length))
    await queuePages(context, [await getAnnotationPage(context.connection, siteId, resourceId, page.id)]);
  await reindex(context);
  context.body = await getAnnotationPage(context.connection, siteId, resourceId, page.id);
  context.status = 201;
};

export const updateAnnotation: RouteMiddleware<Params, AnnotationPageInput> = async context => {
  const { siteId, resourceId } = await admin(context);
  const body = context.requestBody;
  if (!body) throw new RequestError('Annotation page is required');
  if (
    body.position !== undefined &&
    (!Number.isInteger(body.position) || body.position < 0 || body.position > 2147483647)
  )
    throw new RequestError('Invalid page position');
  let refresh = false;
  const page = await context.connection.transaction(async connection => {
    await connection.query(
      sql`select id from iiif_linking where id = ${Number(context.params.pageId)} and site_id = ${siteId} for update`
    );
    const previous = await getAnnotationPage(connection, siteId, resourceId, Number(context.params.pageId));
    const properties: StoredAnnotation = {
      ...previous.properties,
      mode: body.mode,
      edited: true,
      generation: previous.properties.generation + 1,
      position: body.position ?? previous.properties.position,
    };
    if (body.mode === 'json') {
      const document = normalizePage(body.page, previous.uri);
      await saveAnnotationDocument(connection, siteId, previous, document, { ...properties, textBodies: {} });
      refresh = remoteTextBodies(document).length > 0;
    } else {
      const uri = validateRemoteUrl(body.url).href;
      if (uri !== previous.uri) {
        const duplicate = await connection.maybeOne<{ id: number; properties: StoredAnnotation }>(sql`select id, properties from iiif_linking where uri = ${uri}
          and site_id = ${siteId} and resource_id = ${resourceId} and property = 'annotations' and id <> ${previous.id}`);
        if (duplicate && !duplicate.properties.deleted) throw new ConflictError('This annotation page is already attached');
        if (duplicate) await connection.query(sql`delete from iiif_linking where id = ${duplicate.id} and site_id = ${siteId}`);
      }
      properties.status = 'pending';
      await connection.query(
        sql`update iiif_linking set uri = ${uri}, properties = ${sql.json(properties as unknown as SerializableValueType)} where id = ${previous.id} and site_id = ${siteId}`
      );
      if (uri !== previous.uri) {
        // Remember the replaced identity so a later source backfill cannot reattach it.
        await insertAnnotationPage(connection, siteId, resourceId, previous.uri, previous.label, {
          ...previous.properties,
          deleted: true,
          edited: true,
          generation: previous.properties.generation + 1,
        });
      }
      refresh = true;
    }
    if (body.label !== undefined)
      await connection.query(
        sql`update iiif_linking set label = ${body.label} where id = ${previous.id} and site_id = ${siteId}`
      );
    await invalidateIIIF(connection, siteId, resourceId);
    return getAnnotationPage(connection, siteId, resourceId, previous.id);
  }).catch(error => {
    if (error instanceof UniqueIntegrityConstraintViolationError) throw new ConflictError('This annotation page is already attached');
    throw error;
  });
  if (refresh) await queuePages(context, [page]);
  await reindex(context);
  context.body = page;
};

export const refreshAnnotation: RouteMiddleware<Params> = async context => {
  const { siteId, resourceId } = await admin(context);
  const page = await context.connection.transaction(async connection => {
    await connection.query(
      sql`select id from iiif_linking where id = ${Number(context.params.pageId)} and site_id = ${siteId} for update`
    );
    const previous = await getAnnotationPage(connection, siteId, resourceId, Number(context.params.pageId));
    if (previous.properties.mode !== 'external') throw new RequestError('Only external pages can be refreshed');
    const properties = {
      ...previous.properties,
      generation: previous.properties.generation + 1,
      status: 'pending',
      error: null,
    };
    await connection.query(
      sql`update iiif_linking set properties = ${sql.json(properties as unknown as SerializableValueType)} where id = ${previous.id} and site_id = ${siteId}`
    );
    return getAnnotationPage(connection, siteId, resourceId, previous.id);
  });
  await queuePages(context, [page]);
  context.body = page;
  context.status = 202;
};

export const deleteAnnotation: RouteMiddleware<Params> = async context => {
  const { siteId, resourceId } = await admin(context);
  await context.connection.transaction(async connection => {
    await connection.query(
      sql`select id from iiif_linking where id = ${Number(context.params.pageId)} and site_id = ${siteId} for update`
    );
    const page = await getAnnotationPage(connection, siteId, resourceId, Number(context.params.pageId));
    // Keep a tombstone so a source backfill cannot undo an administrator's removal.
    await connection.query(sql`update iiif_linking set properties = ${sql.json({
      ...page.properties,
      deleted: true,
      edited: true,
      generation: page.properties.generation + 1,
    } as unknown as SerializableValueType)}
      where id = ${page.id} and site_id = ${siteId} and resource_id = ${resourceId}`);
    await connection.query(sql`delete from iiif_annotation_text where page_id = ${page.id} and site_id = ${siteId}`);
    await invalidateIIIF(connection, siteId, resourceId);
  });
  await reindex(context);
  context.status = 204;
};

async function reindex(context: ServerContext<Params>) {
  const { userApi, resourceId, resource } = await admin(context);
  // The content is committed even if the search service is temporarily unavailable.
  try {
    if (resource.resource_type === 'canvas') await userApi.indexCanvas(resourceId);
    else await userApi.indexManifest(resourceId);
  } catch (error) {
    console.error('Could not reindex annotation text', error);
  }
}

export const completeAnnotation: RouteMiddleware<Params, CompleteAnnotationPageRequest> = async context => {
  const { siteId, resourceId } = await admin(context);
  const body = context.requestBody;
  if (!body || (!body.page && !body.error)) throw new RequestError('Page or error is required');
  await context.connection.transaction(async connection => {
    await connection.query(
      sql`select id from iiif_linking where id = ${Number(context.params.pageId)} and site_id = ${siteId} for update`
    );
    const page = await getAnnotationPage(connection, siteId, resourceId, Number(context.params.pageId));
    if (page.properties.generation !== body.generation) return;
    if (body.page)
      await saveAnnotationDocument(connection, siteId, page, body.page, {
        ...page.properties,
        textBodies: body.textBodies || {},
        textError: body.textError,
      });
    else
      await connection.query(sql`update iiif_linking set properties = ${sql.json({ ...page.properties, status: 'error', error: body.error } as unknown as SerializableValueType)}
      where id = ${page.id} and site_id = ${siteId}`);
  });
  await reindex(context);
  context.body = { ok: true };
};

export const importProperties: RouteMiddleware<Params, ImportIIIFPropertiesRequest> = async context => {
  const { siteId, resourceId } = await admin(context);
  const body = context.requestBody;
  if (!body || !object(body.resource)) throw new RequestError('IIIF resource is required');
  const pending: AnnotationPageRecord[] = [];
  let textChanged = false;
  await context.connection.transaction(async connection => {
    const manifest = await preserveIIIFProperties(connection, siteId, resourceId, body.resource);
    pending.push(...manifest.pending);
    textChanged ||= manifest.textChanged;
    if (body.includeCanvases && Array.isArray(body.resource.items)) {
      for (const canvas of body.resource.items) {
        if (!object(canvas)) continue;
        const row = await connection.maybeOne<{ id: number }>(sql`
          select r.id from iiif_resource r join iiif_derived_resource_items i on i.item_id = r.id
          where r.source = ${identifier(canvas) || ''} and i.site_id = ${siteId} and i.resource_id = ${resourceId}
        `);
        if (row) {
          const restored = await preserveIIIFProperties(connection, siteId, row.id, canvas);
          pending.push(...restored.pending);
          textChanged ||= restored.textChanged;
        }
      }
    }
  });
  await queuePages(context, pending);
  if (textChanged) await reindex(context);
  context.body = { ok: true };
};

export const backfillProperties: RouteMiddleware<Params> = async context => {
  const { userApi, resourceId, resource, siteId, id } = await admin(context);
  context.body = await userApi.newTask(backfill.createTask(resourceId, resource.source, siteId, id));
  context.status = 202;
};
