import { parseModelTarget } from '../../../../utility/parse-model-target';
import { ExportFile } from '../../server-export';
import type { ExportConfig, ExportDataOptions, ExportFileDefinition, SupportedExportResource } from '../../types';
import { getValue } from '@iiif/helpers';
import {
  isTabularCellFlagged,
  parseTabularCellFlags,
  sortTabularCellFlags,
  TABULAR_CELL_FLAGS_PROPERTY,
  type TabularCellFlag,
} from '../../../../frontend/shared/utility/tabular-cell-flags';
import {
  compareFieldKeysByTabularOrder,
  getTabularFieldOrderMap,
  hasTabularCellFlagsProperty,
} from './tabular-export-order';

const labelCache: {
  manifestLabels: Record<string, { label?: string; uri?: string }>;
  canvasLabels: Record<string, { label?: string; uri?: string }>;
} = {
  manifestLabels: {},
  canvasLabels: {},
};

const missingUriLogged = {
  manifest: new Set<string>(),
  canvas: new Set<string>(),
};

function formatTabularCellReview(flag: TabularCellFlag): string {
  const base = `row ${flag.rowIndex + 1}, column ${flag.columnKey}`;
  const comment = typeof flag.comment === 'string' ? flag.comment.trim() : '';
  return comment ? `${base}: ${comment}` : base;
}

function getTabularCellReviewColumns(value: unknown): {
  tabular_flag_count: number;
  tabular_note_count: number;
  tabular_flags: string;
  tabular_notes: string;
} {
  const allReviews = sortTabularCellFlags(parseTabularCellFlags(value));
  const flags = allReviews.filter(flag => isTabularCellFlagged(flag));
  const notes = allReviews.filter(flag => !isTabularCellFlagged(flag));

  return {
    tabular_flag_count: flags.length,
    tabular_note_count: notes.length,
    tabular_flags: flags.map(formatTabularCellReview).join(' | '),
    tabular_notes: notes.map(formatTabularCellReview).join(' | '),
  };
}

const csvMetadataFields = new Set([
  'model_id',
  'doc_id',
  'manifest',
  'manifest_uri',
  'manifest_label',
  'canvas',
  'canvas_uri',
  'canvas_label',
  'tabular_flag_count',
  'tabular_note_count',
]);

function isEmptyCsvValue(value: unknown): boolean {
  if (value === null || typeof value === 'undefined') {
    return true;
  }

  if (typeof value === 'string') {
    return value.trim().length === 0;
  }

  if (Array.isArray(value)) {
    return value.length === 0 || value.every(isEmptyCsvValue);
  }

  return false;
}

function isEmptyTabularCsvRow(record: Record<string, unknown>): boolean {
  return Object.entries(record).every(([key, value]) => csvMetadataFields.has(key) || isEmptyCsvValue(value));
}

async function fetchLabels(api: any, manifestIds: number[], canvasIds: number[]) {
  const uniqueManifestIds = Array.from(new Set(manifestIds.filter(id => id !== undefined)));
  const uniqueCanvasIds = Array.from(new Set(canvasIds.filter(id => id !== undefined)));

  const newManifestIds = uniqueManifestIds.filter(id => !labelCache.manifestLabels[id.toString()]);
  const newCanvasIds = uniqueCanvasIds.filter(id => !labelCache.canvasLabels[id.toString()]);

  function extractOriginalUri(resource: any): string | undefined {
    if (!resource) return undefined;

    const preferredKeys = [
      'id',
      '@id',
      'source',
      'originalId',
      'original_id',
      'iiifId',
      'iiif_id',
      'iiifUri',
      'iiif_uri',
      'uri',
      'url',
      'sourceId',
      'source_id',
    ];

    const isLikelyUri = (v: any) =>
      typeof v === 'string' &&
      v.length > 3 &&
      (v.startsWith('http://') || v.startsWith('https://') || v.startsWith('urn:'));

    const visited = new Set<any>();

    const scan = (obj: any, depth: number): string | undefined => {
      if (!obj || depth < 0) return undefined;
      if (typeof obj !== 'object') return undefined;
      if (visited.has(obj)) return undefined;
      visited.add(obj);

      for (const key of preferredKeys) {
        const value = (obj as any)[key];
        if (isLikelyUri(value)) return value;
      }
      if (typeof (obj as any).id === 'string' && (obj as any).id.length > 3) {
        return (obj as any).id;
      }
      if (typeof (obj as any)['@id'] === 'string' && (obj as any)['@id'].length > 3) {
        return (obj as any)['@id'];
      }

      for (const value of Object.values(obj)) {
        if (value && typeof value === 'object') {
          const found = scan(value, depth - 1);
          if (found) return found;
        }
      }

      return undefined;
    };

    return scan(resource, 3);
  }

  if (newManifestIds.length > 0) {
    const manifests = await Promise.all(
      newManifestIds.map(async id => ({ id, response: await api.getManifestById(id) }))
    );

    manifests.forEach(({ id, response }) => {
      const manifest = response.manifest;
      if (manifest) {
        const uri = extractOriginalUri(manifest);

        labelCache.manifestLabels[id.toString()] = {
          label: getValue(manifest.label),
          uri,
        };

        if (!uri && !missingUriLogged.manifest.has(id.toString())) {
          missingUriLogged.manifest.add(id.toString());
          console.warn('CSV export: missing manifest URI', { id, keys: Object.keys(manifest) });
        }
      } else {
        console.warn('CSV export: missing manifest (no response.manifest)', { id });
      }
    });
  }

  if (newCanvasIds.length > 0) {
    const canvases = await Promise.all(newCanvasIds.map(async id => ({ id, response: await api.getCanvasById(id) })));

    canvases.forEach(({ id, response }) => {
      const canvas = response.canvas;
      if (canvas) {
        const uri = extractOriginalUri(canvas) || extractOriginalUri(response);
        labelCache.canvasLabels[id.toString()] = {
          label: getValue(canvas.label),
          uri,
        };
        if (!uri && !missingUriLogged.canvas.has(id.toString())) {
          missingUriLogged.canvas.add(id.toString());
          console.warn('CSV export: missing canvas URI', { id, keys: Object.keys(canvas) });
        }
      }
    });
  }

  return { manifestLabels: labelCache.manifestLabels, canvasLabels: labelCache.canvasLabels };
}

export const projectCsvSimpleExport: ExportConfig = {
  type: 'project-csv-simple-export',
  supportedTypes: ['project'],
  metadata: {
    label: { en: ['Simple CSV Export'] },
    description: { en: ['Exports simple capture models to CSV (no nested models)'] },
  },
  configuration: {
    defaultValues: {
      entity: '',
    },
    editor: {
      entity: {},
    },
  },
  hookConfig(subject, options, config) {
    if (config && subject.type === 'project') {
      const editor = config.editor as any;
      return {
        ...config,
        editor: {
          ...((editor as any) || {}),
          entity: {
            type: 'autocomplete-field',
            label: 'Entity from model',
            description: 'List will be empty if your capture model does not have any nested entities.',
            dataSource: `madoc-api://projects/${subject.id}/model-autocomplete`,
            requestInitial: true,
            outputIdAsString: true,
            clearable: true,
          },
          reviews: {
            type: 'checkbox-field',
            label: 'Submission filter',
            inlineLabel: 'Include reviews',
            description: 'Include submissions being reviewed in the export.',
          } as any,
        },
      };
    }
  },
  async exportData(
    subject: SupportedExportResource,
    options: ExportDataOptions<any>
  ): Promise<ExportFileDefinition[] | undefined> {
    let fieldOrderMap = new Map<string, number>();
    let isTabularProject = false;
    try {
      const project = await options.api.getProject(subject.id);
      fieldOrderMap = getTabularFieldOrderMap(project?.template_config);
      isTabularProject = hasTabularCellFlagsProperty(project?.template_config);
    } catch (err) {
      console.warn('CSV export: failed to load project template config for field ordering', {
        projectId: subject.id,
        err: String(err),
      });
    }

    const allPublished = await options.api.getProjectFieldsRaw(subject.id, {
      status: options.config.reviews ? 'all' : 'approved',
      entity: options.config.entity,
    });
    isTabularProject = isTabularProject || allPublished.some((item: any) => item.key === TABULAR_CELL_FLAGS_PROPERTY);

    const rowRecord: Record<string, any> = {};
    const manifestIds: number[] = [];
    const canvasIds: number[] = [];

    for (const item of allPublished) {
      rowRecord[item.doc_id] = rowRecord[item.doc_id] || {
        target: item.target,
        model_id: item.model_id,
        doc_id: item.doc_id,
        __fields: [],
      };

      if (!rowRecord[item.doc_id].__fields.includes(item.key)) {
        rowRecord[item.doc_id].__fields.push(item.key);
      }

      rowRecord[item.doc_id][item.key] = rowRecord[item.doc_id][item.key] || [];
      rowRecord[item.doc_id][item.key].push({ value: item.value, id: item.id, revises: item.revises });

      const target = parseModelTarget(item.target);
      if (target.manifest && target.manifest.id !== undefined) {
        manifestIds.push(target.manifest.id);
      }
      if (target.canvas && target.canvas.id !== undefined) {
        canvasIds.push(target.canvas.id);
      }
    }

    const { manifestLabels, canvasLabels } = await fetchLabels(options.api, manifestIds, canvasIds);

    function findBest(fields: any[]) {
      const revises = fields.map(r => r.revises);
      return fields.filter(r => !revises.includes(r.id)).pop() || fields[0];
    }

    const mappedList = Object.entries(rowRecord)
      .map(([, record]) => {
        const newRecord: any = {
          model_id: record.model_id,
          doc_id: record.doc_id,
        };

        if (record.__fields) {
          const orderedFields = [...record.__fields].sort((leftFieldKey: string, rightFieldKey: string) =>
            compareFieldKeysByTabularOrder(leftFieldKey, rightFieldKey, fieldOrderMap)
          );

          for (const field of orderedFields) {
            const value = findBest(record[field])?.value;
            if (field === TABULAR_CELL_FLAGS_PROPERTY) {
              Object.assign(newRecord, getTabularCellReviewColumns(value));
              continue;
            }
            newRecord[field] = value;
          }

          const target = parseModelTarget(record.target);
          if (target.manifest && target.manifest.id !== undefined) {
            const manifest = manifestLabels[target.manifest.id.toString()];
            newRecord.manifest = target.manifest.id;
            newRecord.manifest_uri = manifest?.uri;
            newRecord.manifest_label = manifest?.label;
          }
          if (target.canvas && target.canvas.id !== undefined) {
            const canvas = canvasLabels[target.canvas.id.toString()];
            newRecord.canvas = target.canvas.id;
            newRecord.canvas_uri = canvas?.uri;
            newRecord.canvas_label = canvas?.label;
          }
          return newRecord;
        }
        return false;
      })
      .filter(Boolean)
      .filter(record => !isTabularProject || !isEmptyTabularCsvRow(record as Record<string, unknown>)) as any[];

    return [await ExportFile.csv(mappedList, 'project-data/data.csv')];
  },
};
