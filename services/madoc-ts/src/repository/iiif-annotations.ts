import { ConflictError } from '../utility/errors/conflict';
import { CommonQueryMethodsType, sql, SerializableValueType } from 'slonik';
import { AnnotationPageRecord, JsonObject, StoredAnnotation } from '../iiif/types';
import { extraProperties, identifier, importedPages } from '../iiif/properties';
import {
  annotationTextSources,
  groupAnnotationText,
  normalizePage,
  remoteTextBodies,
} from '../iiif/annotation-document';
import { NotFound } from '../utility/errors/not-found';
import { canvasAnnotationPage } from '../iiif/canvas-annotations';

export async function getCanvasAnnotationPages(
  connection: CommonQueryMethodsType,
  siteId: number,
  canvasId: number,
  admin = false
) {
  const canvas = await requireIIIFResource(connection, siteId, canvasId, admin);
  const pages = await connection.any<Pick<AnnotationPageRecord, 'id' | 'uri' | 'label' | 'properties'>>(sql`
    select l.id, l.uri, l.label,
      case when l.properties ? 'document' then l.properties || jsonb_build_object('document',
        ((l.properties->'document') - 'items') || jsonb_build_object('items', coalesce((
          select jsonb_agg(a.value order by a.position)
          from jsonb_array_elements(l.properties->'document'->'items') with ordinality a(value, position)
          where exists (
            select 1 from jsonb_path_query(a.value, '$.target.**') target(value)
            where jsonb_typeof(target.value) = 'string'
              and split_part(target.value #>> '{}', '#', 1) = ${canvas.source}
          )
        ), '[]'::jsonb))
      ) else l.properties end as properties
    from iiif_linking l
    join iiif_derived_resource owner on owner.resource_id = l.resource_id and owner.site_id = l.site_id
    where l.site_id = ${siteId} and l.property = 'annotations'
      and coalesce((l.properties->>'deleted')::boolean, false) = false
      and (${admin} or owner.resource_type = 'canvas' or owner.published = true)
      and (l.resource_id = ${canvasId} or l.resource_id in (
        select resource_id from iiif_derived_resource_items where item_id = ${canvasId} and site_id = ${siteId}
      ))
    order by l.resource_id, coalesce((l.properties->>'position')::int, 0), l.id
  `);
  return pages
    .filter(page => page.properties.document)
    .map((page): JsonObject => ({
      ...canvasAnnotationPage(page.properties.document!, canvas.source, page.properties.textBodies),
      id: `urn:madoc:annotation-page:${page.id}`,
      label: page.properties.document!.label || { none: [page.label] },
    }))
    .filter(page => Array.isArray(page.items) && page.items.length > 0);
}

export async function requireIIIFResource(
  connection: CommonQueryMethodsType,
  siteId: number,
  resourceId: number,
  admin = true
) {
  const resource = await connection.maybeOne<{
    source: string;
    resource_type: 'manifest' | 'canvas';
    revision: string;
  }>(sql`
    select r.source, d.resource_type, d.iiif_updated_at::text as revision
    from iiif_derived_resource d join iiif_resource r on r.id = d.resource_id
    where d.site_id = ${siteId} and d.resource_id = ${resourceId}
      and d.resource_type in ('manifest', 'canvas', 'collection')
      and (${admin} or (d.resource_type in ('manifest', 'collection') and d.published = true) or (
        d.resource_type = 'canvas' and exists (
          select 1 from iiif_derived_resource_items i join iiif_derived_resource parent
            on parent.resource_id = i.resource_id and parent.site_id = i.site_id
          where i.item_id = d.resource_id and i.site_id = d.site_id
            and parent.resource_type = 'manifest' and parent.published = true
        )
      ))
  `);
  if (!resource) throw new NotFound();
  return resource;
}

export async function invalidateIIIF(connection: CommonQueryMethodsType, siteId: number, resourceId: number) {
  await connection.query(sql`
    update iiif_derived_resource set iiif_updated_at = clock_timestamp()
    where site_id = ${siteId} and (resource_id = ${resourceId} or resource_id in (
      select resource_id from iiif_derived_resource_items where site_id = ${siteId} and item_id = ${resourceId}
    ))
  `);
}

export async function listAnnotationPages(
  connection: CommonQueryMethodsType,
  siteId: number,
  resourceId: number,
  summary = false
) {
  return connection.any<AnnotationPageRecord>(sql`
    select id, resource_id, uri, label, source, ${
      summary
        ? sql`
      (properties - 'document' - 'textBodies') || jsonb_build_object(
        'hasDocument', properties ? 'document',
        'annotationCount', jsonb_array_length(coalesce(properties->'document'->'items', '[]'::jsonb))
      )`
        : sql`properties`
    } as properties from iiif_linking
    where site_id = ${siteId} and resource_id = ${resourceId} and property = 'annotations' and coalesce((properties->>'deleted')::boolean, false) = false
    order by coalesce((properties->>'position')::int, 0), id
  `);
}

export async function getAnnotationPage(
  connection: CommonQueryMethodsType,
  siteId: number,
  resourceId: number,
  pageId: number
) {
  const row = await connection.maybeOne<AnnotationPageRecord>(sql`
    select id, resource_id, uri, label, source, properties from iiif_linking
    where id = ${pageId} and site_id = ${siteId} and resource_id = ${resourceId} and property = 'annotations' and coalesce((properties->>'deleted')::boolean, false) = false
  `);
  if (!row) throw new NotFound();
  return row;
}

export async function insertAnnotationPage(
  connection: CommonQueryMethodsType,
  siteId: number,
  resourceId: number,
  uri: string,
  label: string,
  properties: StoredAnnotation,
  imported = false
) {
  const inserted = await connection.maybeOne<AnnotationPageRecord>(sql`
    insert into iiif_linking (uri, type, label, property, source, properties, resource_id, site_id)
    values (${uri}, 'AnnotationPage', ${label}, 'annotations', ${imported ? 'iiif' : 'manual'},
      ${sql.json(properties as unknown as SerializableValueType)}, ${resourceId}, ${siteId}) on conflict do nothing
    returning id, resource_id, uri, label, source, properties
  `);
  if (inserted) return inserted;
  const existing = await connection.one<AnnotationPageRecord>(sql`
    select id, resource_id, uri, label, source, properties from iiif_linking
    where uri = ${uri} and site_id = ${siteId} and resource_id = ${resourceId} and property = 'annotations'
    for update
  `);
  if (!imported) {
    if (!existing.properties.deleted) throw new ConflictError('This annotation page is already attached');
    const restored = { ...properties, generation: existing.properties.generation + 1 };
    await connection.query(sql`update iiif_linking set properties = ${sql.json(restored as unknown as SerializableValueType)},
      source = 'manual', label = ${label} where id = ${existing.id} and site_id = ${siteId}`);
    return { ...existing, label, source: 'manual', properties: restored };
  }
  return existing;
}

export async function saveAnnotationDocument(
  connection: CommonQueryMethodsType,
  siteId: number,
  page: AnnotationPageRecord,
  document: JsonObject,
  properties: StoredAnnotation = page.properties
) {
  const normalized = normalizePage(document, page.uri);
  const resource = await requireIIIFResource(connection, siteId, page.resource_id);
  const canvases = await connection.any<{ id: number; source: string }>(sql`
    select r.id, r.source from iiif_resource r
    join iiif_derived_resource d on d.resource_id = r.id and d.site_id = ${siteId}
    where r.type = 'canvas' and (r.id = ${page.resource_id} or r.id in (
      select item_id from iiif_derived_resource_items where resource_id = ${page.resource_id} and site_id = ${siteId}
    ))
  `);
  const texts = groupAnnotationText(
    annotationTextSources(
      normalized,
      resource.resource_type === 'canvas' ? resource.source : undefined,
      properties.textBodies
    ),
    new Map(canvases.map(canvas => [canvas.source, canvas.id]))
  );
  await connection.query(sql`
    update iiif_linking set properties = ${sql.json({
      ...properties,
      document: normalized,
      status: 'ready',
      error: null,
      fetchedAt: new Date().toISOString(),
    } as unknown as SerializableValueType)}, modified_at = clock_timestamp()
    where id = ${page.id} and site_id = ${siteId} and resource_id = ${page.resource_id}
  `);
  await connection.query(sql`delete from iiif_annotation_text where page_id = ${page.id} and site_id = ${siteId}`);
  for (const text of texts) {
    await connection.query(sql`
      insert into iiif_annotation_text (page_id, site_id, canvas_id, language, text)
      values (${page.id}, ${siteId}, ${text.canvasId}, ${text.language}, ${text.text})
    `);
  }
  await invalidateIIIF(connection, siteId, page.resource_id);
}

export async function preserveIIIFProperties(
  connection: CommonQueryMethodsType,
  siteId: number,
  resourceId: number,
  resource: JsonObject
) {
  await requireIIIFResource(connection, siteId, resourceId);
  // Backfills only add missing properties and pages; local edits remain authoritative.
  await connection.query(sql`
    update iiif_derived_resource set extra_properties = ${sql.json(extraProperties(resource) as SerializableValueType)}::jsonb || extra_properties
    where site_id = ${siteId} and resource_id = ${resourceId}
  `);
  const pages = importedPages(resource);
  let textChanged = false;
  for (let position = 0; position < pages.length; position++) {
    const document = pages[position];
    const uri = identifier(document) || `urn:madoc:annotation-page:${resourceId}:${position}`;
    const embedded = Array.isArray(document.items);
    const page = await insertAnnotationPage(
      connection,
      siteId,
      resourceId,
      uri,
      'Imported annotations',
      {
        mode: embedded ? 'json' : 'external',
        position,
        status: 'pending',
        generation: 0,
      },
      true
    );
    if (page.properties.deleted) continue;
    if (embedded && !page.properties.document && !page.properties.edited) {
      let normalized: JsonObject;
      try {
        normalized = normalizePage(document, uri);
      } catch (error) {
        await connection.query(
          sql`update iiif_linking set properties = ${sql.json({
            ...page.properties,
            status: 'error',
            error: error instanceof Error ? error.message : String(error),
          } as unknown as SerializableValueType)} where id = ${page.id} and site_id = ${siteId}`
        );
        continue;
      }
      await saveAnnotationDocument(connection, siteId, page, normalized);
      textChanged = true;
    }
  }
  await invalidateIIIF(connection, siteId, resourceId);
  const pending = (await listAnnotationPages(connection, siteId, resourceId)).filter(
    page =>
      !page.properties.edited &&
      ((page.properties.mode === 'external' && !page.properties.document) ||
        (page.properties.document &&
          remoteTextBodies(page.properties.document).some(
            body => !page.properties.textBodies?.[identifier(body) || '']
          )))
  );
  return { pending, textChanged };
}

export async function getAnnotationPlaintext(
  connection: CommonQueryMethodsType,
  siteId: number,
  canvasId: number,
  admin = false
) {
  return connection.any<{ text: string; language: string; source: string }>(sql`
    select t.text, t.language, l.uri as source from iiif_annotation_text t
    join iiif_linking l on l.id = t.page_id and l.site_id = t.site_id
    join iiif_derived_resource owner on owner.resource_id = l.resource_id and owner.site_id = l.site_id
    where t.site_id = ${siteId} and t.canvas_id = ${canvasId} and (${admin} or owner.resource_type = 'canvas' or owner.published = true)
    order by coalesce((l.properties->>'position')::int, 0), l.id, t.language
  `);
}
