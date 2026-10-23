import { CommonQueryMethodsType, sql } from 'slonik';
import { JsonObject } from './types';
import { mergeExtraProperties } from './export-properties';
import { object } from './properties';

export async function reconstructionProperties(
  connection: CommonQueryMethodsType,
  siteId: number,
  resourceIds: number[],
  baseUrl: string,
  version: string
) {
  const properties = await connection.any<{ resource_id: number; source: string; extra_properties: JsonObject }>(sql`
    select d.resource_id, r.source, d.extra_properties from iiif_derived_resource d join iiif_resource r on r.id = d.resource_id
    where d.site_id = ${siteId} and d.resource_id = any(${sql.array(resourceIds, 'int4')})
  `);
  const pages = await connection.any<{
    id: number;
    resource_id: number;
    uri: string;
    label: string;
    stored: boolean;
  }>(sql`
    select id, resource_id, uri, label, properties ? 'document' as stored from iiif_linking
    where site_id = ${siteId} and resource_id = any(${sql.array(resourceIds, 'int4')}) and property = 'annotations' and coalesce((properties->>'deleted')::boolean, false) = false
    order by coalesce((properties->>'position')::int, 0), id
  `);
  const bySource = new Map(properties.map(row => [row.source, row]));
  function apply(resource: JsonObject, resourceId: number): JsonObject {
    const extra = properties.find(row => row.resource_id === resourceId)?.extra_properties || {};
    const merged = mergeExtraProperties(resource, extra);
    const annotations = Array.isArray(merged.annotations) ? [...merged.annotations] : [];
    for (const page of pages.filter(page => page.resource_id === resourceId)) {
      annotations.push({
        id: page.stored ? `${baseUrl}/madoc/api/resources/${resourceId}/annotations/${page.id}/${version}` : page.uri,
        type: 'AnnotationPage',
        label: { none: [page.label] },
      });
    }
    if (annotations.length) merged.annotations = annotations;
    return merged;
  }
  return (manifest: JsonObject, manifestId: number): JsonObject => {
    const result = apply(manifest, manifestId);
    if (Array.isArray(result.items))
      result.items = result.items.map(canvas => {
        if (!object(canvas)) return canvas;
        const row = typeof canvas.id === 'string' ? bySource.get(canvas.id) : undefined;
        return row ? apply(canvas, row.resource_id) : canvas;
      });
    return result;
  };
}
