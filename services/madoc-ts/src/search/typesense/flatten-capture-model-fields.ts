import { captureModelToIndexables } from '../../utility/capture-model-to-indexables';
import { SearchExportCaptureModelRow } from '../../database/queries/search-index-export';
import { traverseDocument } from '../../frontend/shared/capture-models/helpers/traverse-document';
import type { CaptureModel } from '../../frontend/shared/capture-models/types/capture-model';

export type CaptureModelSearchAggregate = {
  fields: Record<string, string[]>;
  searchText: string[];
  labels: string[];
};

function uniq(values: string[]) {
  return [...new Set(values.map(value => value.trim()).filter(Boolean))];
}

function toCaptureModelFieldName(modelId: string): string | null {
  const lastToken = `${modelId}`.split(':').pop() || `${modelId}`;
  const normalized = lastToken
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');

  if (!normalized) {
    return null;
  }

  return `capture_model_${normalized}`;
}

function collectSearchableValues(value: unknown, values: string[]) {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) {
      return;
    }

    try {
      const parsed = JSON.parse(trimmed);
      if (parsed !== trimmed) {
        collectSearchableValues(parsed, values);
        return;
      }
    } catch {
      // no-op
    }

    values.push(trimmed);
    return;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    values.push(`${value}`);
    return;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      collectSearchableValues(item, values);
    }
    return;
  }

  if (value && typeof value === 'object') {
    for (const nested of Object.values(value)) {
      collectSearchableValues(nested, values);
    }
  }
}

function isCaptureModelDocument(value: unknown): value is CaptureModel['document'] {
  return !!value && typeof value === 'object' && (value as { type?: unknown }).type === 'entity';
}

function extractCaptureModelValues(targetId: string, documentData: unknown) {
  const values: string[] = [];

  if (isCaptureModelDocument(documentData)) {
    try {
      const indexables = captureModelToIndexables(targetId, documentData);
      for (const indexable of indexables) {
        collectSearchableValues(indexable.indexable, values);
      }
    } catch {
      // Ignore malformed capture model documents.
    }
  } else {
    collectSearchableValues(documentData, values);
  }

  return uniq(values);
}

function extractCaptureModelLabels(documentData: unknown) {
  if (!isCaptureModelDocument(documentData)) {
    return [];
  }

  const labels: string[] = [];
  try {
    traverseDocument(documentData, {
      visitField(field) {
        collectSearchableValues(field.label, labels);
        collectSearchableValues(field.pluralLabel, labels);
      },
      visitEntity(entity) {
        collectSearchableValues(entity.label, labels);
        collectSearchableValues(entity.pluralLabel, labels);
      },
    });
  } catch {
    // Ignore malformed capture model documents.
  }
  return uniq(labels);
}

export function flattenCaptureModelFieldsByResource(rows: SearchExportCaptureModelRow[]) {
  const byResource: Record<string, CaptureModelSearchAggregate> = {};

  for (const row of rows) {
    const targetId = `${row.target_id || ''}`.trim();
    if (!targetId) {
      continue;
    }

    const fieldName = toCaptureModelFieldName(row.model_id);
    const values = extractCaptureModelValues(targetId, row.document_data);
    const labels = extractCaptureModelLabels(row.document_data);

    if (!values.length && !labels.length) {
      continue;
    }

    if (!byResource[targetId]) {
      byResource[targetId] = {
        fields: {},
        searchText: [],
        labels: [],
      };
    }

    if (fieldName && values.length) {
      byResource[targetId].fields[fieldName] = uniq([...(byResource[targetId].fields[fieldName] || []), ...values]);
    }

    byResource[targetId].searchText = uniq([...(byResource[targetId].searchText || []), ...values]);
    byResource[targetId].labels = uniq([...(byResource[targetId].labels || []), ...labels]);
  }

  return byResource;
}
