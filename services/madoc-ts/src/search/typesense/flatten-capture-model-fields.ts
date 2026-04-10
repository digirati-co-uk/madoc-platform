import { captureModelToIndexables } from '../../utility/capture-model-to-indexables';
import { SearchExportCaptureModelRow } from '../../database/queries/search-index-export';

export type CaptureModelSearchAggregate = {
  fields: Record<string, string[]>;
  searchText: string[];
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

function extractCaptureModelValues(targetId: string, documentData: unknown) {
  const values: string[] = [];

  if (documentData && typeof documentData === 'object') {
    try {
      const indexables = captureModelToIndexables(targetId, documentData as any);
      for (const indexable of indexables) {
        collectSearchableValues(indexable.indexable, values);
      }
    } catch {
      // no-op, fallback handled below.
    }

    if (!values.length) {
      collectSearchableValues(documentData, values);
    }
  }

  return uniq(values);
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

    if (!values.length) {
      continue;
    }

    if (!byResource[targetId]) {
      byResource[targetId] = {
        fields: {},
        searchText: [],
      };
    }

    if (fieldName) {
      byResource[targetId].fields[fieldName] = uniq([...(byResource[targetId].fields[fieldName] || []), ...values]);
    }

    byResource[targetId].searchText = uniq([...(byResource[targetId].searchText || []), ...values]);
  }

  return byResource;
}
