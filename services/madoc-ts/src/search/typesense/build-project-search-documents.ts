import { createHash } from 'crypto';
import {
  ProjectSearchCaptureModelRow,
  ProjectSearchIIIFResourceRow,
} from '../../database/queries/search-index-export';
import { filterModelGetOptions } from '../../capture-model-server/server-filters/filter-model-get-options';
import { filterRevises } from '../../frontend/shared/capture-models/helpers/filter-revises';
import { getEntityLabel } from '../../frontend/shared/capture-models/utility/get-entity-label';
import { isEntity } from '../../frontend/shared/capture-models/helpers/is-entity';
import { traverseDocument } from '../../frontend/shared/capture-models/helpers/traverse-document';
import { CaptureModel } from '../../frontend/shared/capture-models/types/capture-model';
import { BaseField } from '../../frontend/shared/capture-models/types/field-types';
import { Revision } from '../../frontend/shared/capture-models/types/capture-model';
import { getProjectSearchFacetFieldName } from '../../frontend/shared/capture-models/helpers/project-search-index-options';
import { ProjectSearchIndexDefinition } from '../../types/schemas/project-search-index';
import { getCroppedImageFromService } from '../../utility/get-cropped-image-from-service';
import { parseUrn } from '../../utility/parse-urn';
import { ImageService } from '@iiif/presentation-3';

interface Region {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface SearchOccurrence {
  key: string;
  label: string;
  entityId: string;
  searchText: string[];
  facets: Record<string, string[]>;
  canvasIds: number[];
  manifestIds: number[];
  thumbnail: string | null;
  imageService?: ImageService;
  region?: Region;
}

export interface TypesenseProjectSearchDocument {
  id: string;
  resource_id: string;
  resource_type: 'CustomEntity';
  entity_type: string;
  resource_label: string;
  search_text: string[];
  project_id: string;
  index_id: string;
  entity_ids: string[];
  manifest_id: string;
  manifest_ids: string[];
  canvas_id?: string;
  canvas_ids: string[];
  thumbnail: string | null;
  region?: string;
  sort_index: number;
  [key: `facet_${string}`]: string[];
}

function uniq(values: string[]) {
  return [...new Set(values.map(value => value.trim()).filter(Boolean))];
}

function collectValues(value: unknown, values: string[]) {
  if (typeof value === 'string') {
    if (value.trim()) values.push(value.trim());
    return;
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    values.push(`${value}`);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach(item => collectValues(item, values));
  }
}

function resolveEntity(entity: CaptureModel['document']): CaptureModel['document'] {
  for (const [property, values] of Object.entries(entity.properties || {})) {
    const resolved = filterRevises(values as Array<BaseField | CaptureModel['document']>);
    entity.properties[property] = resolved as BaseField[] | CaptureModel['document'][];
    for (const value of resolved) {
      if (isEntity(value)) resolveEntity(value);
    }
  }
  return entity;
}

function getEntitiesAtPath(document: CaptureModel['document'], path: string[]) {
  let entities = [document];
  for (const property of path) {
    entities = entities.flatMap(entity =>
      ((entity.properties[property] || []) as Array<BaseField | CaptureModel['document']>).filter(isEntity)
    );
  }
  return entities;
}

function getFieldValues(entity: CaptureModel['document'], path: string[]) {
  let entities = [entity];
  for (const [index, property] of path.entries()) {
    const values = entities.flatMap(
      item => (item.properties[property] || []) as Array<BaseField | CaptureModel['document']>
    );
    if (index === path.length - 1) {
      const result: string[] = [];
      values.forEach(value => collectValues(isEntity(value) ? getEntityLabel(value) : value.value, result));
      return uniq(result);
    }
    entities = values.filter(isEntity);
  }
  return [];
}

function getRegion(entity: CaptureModel['document']): Region | undefined {
  const selector = entity.selector;
  const state = selector?.revisedBy?.at(-1)?.state || selector?.state;
  if (!selector || !state) return undefined;
  if (selector.type === 'box-selector') {
    return { x: Number(state.x), y: Number(state.y), width: Number(state.width), height: Number(state.height) };
  }
  if (selector.type === 'polygon-selector') {
    const points = state.shape?.points as Array<[number, number]> | undefined;
    if (!points?.length) return undefined;
    const xs = points.map(point => Number(point[0]));
    const ys = points.map(point => Number(point[1]));
    const x = Math.min(...xs);
    const y = Math.min(...ys);
    return { x, y, width: Math.max(...xs) - x, height: Math.max(...ys) - y };
  }
  return undefined;
}

function getImageService(itemsJson: unknown): ImageService | undefined {
  if (!itemsJson || typeof itemsJson !== 'object') return undefined;
  const items = Array.isArray(itemsJson) ? itemsJson : (itemsJson as { items?: unknown[] }).items;
  const page = items?.[0] as { items?: unknown[] } | undefined;
  const annotation = page?.items?.[0] as { body?: { service?: unknown[] } | Array<{ service?: unknown[] }> } | undefined;
  const annotationBody = annotation?.body;
  const body = Array.isArray(annotationBody) ? annotationBody[0] : annotationBody;
  const service = body?.service?.[0];
  return service && typeof service === 'object' ? (service as ImageService) : undefined;
}

function stableId(...values: string[]) {
  return createHash('sha256').update(values.join('\u0000')).digest('hex');
}

function filterCaptureModel(row: ProjectSearchCaptureModelRow, includeUnapproved: boolean) {
  const model: CaptureModel = {
    id: row.model_id,
    target: row.target,
    document: structuredClone(row.document_data) as CaptureModel['document'],
    structure: { id: row.model_id, type: 'model', label: '', fields: [] },
    revisions: row.revisions.map(
      (revision): Revision => ({ ...revision, status: revision.status as Revision['status'], fields: [] })
    ),
  };
  return filterModelGetOptions(model, {
    revisionStatuses: includeUnapproved ? ['accepted', 'submitted', 'draft', 'rejected'] : ['accepted'],
  });
}

export async function buildProjectSearchDocuments({
  definition,
  projectId,
  models,
  iiifResources,
}: {
  definition: ProjectSearchIndexDefinition;
  projectId: number;
  models: readonly ProjectSearchCaptureModelRow[];
  iiifResources: readonly ProjectSearchIIIFResourceRow[];
}) {
  const resources = new Map(iiifResources.map(resource => [resource.resource_id, resource]));
  const occurrences: SearchOccurrence[] = [];
  const warnings: string[] = [];

  for (const row of models) {
    const model = filterCaptureModel(row, definition.includeUnapproved);
    if (!model.document || model.document.type !== 'entity') continue;

    const targets = row.target
      .map(target => parseUrn(target.id))
      .filter((target): target is NonNullable<typeof target> => !!target)
      .map(target => resources.get(target.id))
      .filter((resource): resource is ProjectSearchIIIFResourceRow => !!resource);
    if (!targets.length) continue;

    for (const entity of getEntitiesAtPath(resolveEntity(model.document), definition.entityPath)) {
      const searchText: string[] = [];
      traverseDocument(entity, { visitField: field => collectValues(field.value, searchText) });
      const uniqueValues = definition.uniqueField ? getFieldValues(entity, definition.uniqueField) : [];
      if (definition.uniqueField && uniqueValues.length !== 1) {
        warnings.push(`Entity ${entity.id} did not have exactly one unique value`);
      }
      const key = uniqueValues.length === 1 ? `unique:${uniqueValues[0]}` : `entity:${row.model_id}:${entity.id}`;
      const facets = Object.fromEntries(
        definition.facets.map(facet => [getProjectSearchFacetFieldName(facet.path), getFieldValues(entity, facet.path)])
      );
      const canvasTargets = targets.filter(target => target.resource_type === 'canvas');
      const primary = canvasTargets[0] || targets[0];

      occurrences.push({
        key,
        label: getEntityLabel(entity, entity.label, true),
        entityId: entity.id,
        searchText: uniq(searchText),
        facets,
        canvasIds: canvasTargets.map(target => target.resource_id),
        manifestIds: uniq(targets.map(target => `${target.manifest_id}`)).map(Number),
        thumbnail: primary.default_thumbnail,
        imageService: getImageService(primary.items_json),
        region: getRegion(entity),
      });
    }
  }

  const grouped = new Map<string, SearchOccurrence[]>();
  for (const occurrence of occurrences) {
    grouped.set(occurrence.key, [...(grouped.get(occurrence.key) || []), occurrence]);
  }

  const documents: TypesenseProjectSearchDocument[] = [];
  for (const [key, group] of grouped) {
    const first = group[0];
    const canvasIds = [...new Set(group.flatMap(item => item.canvasIds))];
    const manifestIds = [...new Set(group.flatMap(item => item.manifestIds))];
    const id = stableId(definition.id, key);
    let thumbnail = first.thumbnail;
    if (first.imageService && first.region) {
      thumbnail = await getCroppedImageFromService(first.imageService, {
        validate: false,
        region: {
          x: first.region.x,
          y: first.region.y,
          w: first.region.width,
          h: first.region.height,
        },
        width: 256,
      });
    }
    const facetValues = Object.fromEntries(
      definition.facets.map(facet => {
        const field = getProjectSearchFacetFieldName(facet.path);
        return [field, uniq(group.flatMap(item => item.facets[field] || []))];
      })
    );

    documents.push({
      id,
      resource_id: `urn:madoc:project-search-result:${definition.id}:${id}`,
      resource_type: 'CustomEntity',
      entity_type: definition.label,
      resource_label: first.label || definition.label,
      search_text: uniq(group.flatMap(item => item.searchText)),
      project_id: `${projectId}`,
      index_id: definition.id,
      entity_ids: uniq(group.map(item => item.entityId)),
      manifest_id: manifestIds.length ? `urn:madoc:manifest:${manifestIds[0]}` : '',
      manifest_ids: manifestIds.map(manifestId => `${manifestId}`),
      canvas_id: canvasIds.length ? `urn:madoc:canvas:${canvasIds[0]}` : undefined,
      canvas_ids: canvasIds.map(canvasId => `${canvasId}`),
      thumbnail: thumbnail || null,
      region: first.region
        ? `${first.region.x},${first.region.y},${first.region.width},${first.region.height}`
        : undefined,
      sort_index: documents.length,
      ...facetValues,
    });
  }

  return { documents, warnings: uniq(warnings) };
}
