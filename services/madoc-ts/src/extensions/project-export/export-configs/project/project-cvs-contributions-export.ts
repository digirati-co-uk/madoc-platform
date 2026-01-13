import { parseModelTarget } from '../../../../utility/parse-model-target';
import { ExportFile } from '../../server-export';
import { ExportConfig, ExportDataOptions, ExportFileDefinition, SupportedExportResource } from '../../types';
import { getValue } from '@iiif/helpers/i18n';

type CachedTarget = { label?: string; uri?: string };
type CachedManifest = { label?: string; uri?: string };

function toModelTargetInput(target: unknown): any[] {
  if (target == null) return [];
  return Array.isArray(target) ? target : [target];
}

function safeParseModelTarget(target: unknown) {
  try {
    const input = toModelTargetInput(target);
    // parseModelTarget expects an array.
    return parseModelTarget(Array.isArray(input) ? input : [input]);
  } catch (err) {
    console.warn('CSV export: failed to parse model target', { err: String(err) });
    return {} as any;
  }
}

const cache: {
  manifests: Record<string, CachedManifest>;
  canvases: Record<string, CachedTarget>;
} = {
  manifests: {},
  canvases: {},
};

function extractOriginalUri(resource: any): string | undefined {
  if (!resource) return undefined;

  if (typeof resource.source === 'string') return resource.source;

  const preferredKeys = [
    'id',
    '@id',
    'originalId',
    'original_id',
    'iiifId',
    'iiif_id',
    'iiifUri',
    'iiif_uri',
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

  for (const key of preferredKeys) {
    const value = (resource as any)[key];
    if (isLikelyUri(value)) return value;
  }
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
    for (const v of Object.values(obj)) {
      if (v && typeof v === 'object') {
        const found = scan(v, depth - 1);
        if (found) return found;
      }
    }
    return undefined;
  };

  return scan(resource, 2);
}

function isBlankString(value: unknown): boolean {
  return typeof value === 'string' && value.trim() === '';
}

function pickFirstDefined(obj: any, keys: string[]): any {
  if (!obj) return undefined;
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const v = obj[key];
      if (v === undefined || v === null) continue;
      if (isBlankString(v)) continue;
      return v;
    }
  }
  return undefined;
}

function getContributionStatus(item: any): string | null {
  const direct = pickFirstDefined(item, [
    'status',
    'approval_status',
    'approvalStatus',
    'review_status',
    'reviewStatus',
    'submission_status',
    'submissionStatus',
    'workflow_state',
    'workflowState',
    'state',
  ]);

  if (typeof direct === 'string' && direct.trim()) return direct;

  if (item?.approved === true) return 'approved';
  if (item?.rejected === true) return 'rejected';
  if (item?.in_review === true || item?.inReview === true) return 'review';

  return null;
}

function getContributorId(item: any): string | number | null {
  const direct = pickFirstDefined(item, [
    'user_id',
    'userId',
    'user',
    'creator_id',
    'creatorId',
    'creator',
    'created_by',
    'createdBy',
    'created_by_id',
    'createdById',
  ]);

  if (typeof direct === 'string' && direct.trim()) return direct;
  if (typeof direct === 'number') return direct;
  const nested =
    pickFirstDefined(item?.user, ['id', '@id', 'user_id', 'userId']) ??
    pickFirstDefined(item?.creator, ['id', '@id', 'user_id', 'userId']) ??
    pickFirstDefined(item?.created_by, ['id', '@id', 'user_id', 'userId']) ??
    pickFirstDefined(item?.createdBy, ['id', '@id', 'user_id', 'userId']);

  if (typeof nested === 'string' && nested.trim()) return nested;
  if (typeof nested === 'number') return nested;

  return null;
}

async function fetchTargets(api: any, manifestIds: number[], canvasIds: number[]) {
  const uniqueManifestIds = Array.from(new Set(manifestIds.filter(id => id !== undefined)));
  const uniqueCanvasIds = Array.from(new Set(canvasIds.filter(id => id !== undefined)));

  const newManifestIds = uniqueManifestIds.filter(id => !cache.manifests[id.toString()]);
  const newCanvasIds = uniqueCanvasIds.filter(id => !cache.canvases[id.toString()]);

  if (newManifestIds.length) {
    const results = await Promise.allSettled(
      newManifestIds.map(async id => ({ id, response: await api.getManifestById(id) }))
    );

    for (const res of results) {
      if (res.status === 'rejected') {
        console.warn('CSV export: manifest lookup failed', { reason: String(res.reason) });
        continue;
      }

      const { id, response } = res.value;
      const manifest = response?.manifest;
      if (!manifest) continue;

      // getManifestById() returns the original URI at response.manifest.source
      const uri =
        typeof response?.manifest?.source === 'string' && response.manifest.source.trim()
          ? response.manifest.source
          : extractOriginalUri(manifest) ?? extractOriginalUri(response);

      cache.manifests[id.toString()] = {
        label: getValue(manifest.label),
        uri,
      };
    }
  }

  if (newCanvasIds.length) {
    const results = await Promise.allSettled(
      newCanvasIds.map(async id => ({ id, response: await api.getCanvasById(id) }))
    );

    for (const res of results) {
      if (res.status === 'rejected') {
        console.warn('CSV export: canvas lookup failed', { reason: String(res.reason) });
        continue;
      }

      const { id, response } = res.value;
      const canvas = response?.canvas;
      if (!canvas) continue;

      // getCanvasById() returns the original URI at response.canvas.source_id
      const uri =
        typeof response?.canvas?.source_id === 'string' && response.canvas.source_id.trim()
          ? response.canvas.source_id
          : extractOriginalUri(canvas) || extractOriginalUri(response);

      cache.canvases[id.toString()] = {
        label: getValue(canvas.label),
        uri,
      };
    }
  }

  return { manifests: cache.manifests, canvases: cache.canvases };
}

export const projectCsvContributionsExport: ExportConfig = {
  type: 'project-csv-contributions-export',
  supportedTypes: ['project'],
  metadata: {
    label: { en: ['Contributions CSV Export'] },
    description: { en: ['Exports one contribution per row, including original IIIF URIs'] },
  },
  configuration: {
    defaultValues: {
      entity: null,
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
            description: 'Optional: filter export to contributions for a single nested entity.',
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
    return config;
  },
  async exportData(
    subject: SupportedExportResource,
    options: ExportDataOptions<any>
  ): Promise<ExportFileDefinition[] | undefined> {
    const entity = isBlankString(options.config.entity) ? null : options.config.entity;
    const statusFilter = options.config.reviews ? 'all' : 'approved';
    const allPublished = await options.api.getProjectFieldsRaw(subject.id, {
      status: statusFilter,
      ...(entity ? { entity } : {}),
    });

    const manifestIds: number[] = [];
    const canvasIds: number[] = [];

    for (const item of allPublished) {
      const t = safeParseModelTarget((item as any).target);
      if (typeof t.manifest?.id === 'number') manifestIds.push(t.manifest.id);
      if (typeof t.canvas?.id === 'number') canvasIds.push(t.canvas.id);
    }

    const { manifests, canvases } = await fetchTargets(options.api, manifestIds, canvasIds);

    const rows = allPublished.map(item => {
      const t = safeParseModelTarget((item as any).target);

      const manifestInternalId = t.manifest?.id;
      const canvasInternalId = t.canvas?.id;

      const manifest = manifestInternalId !== undefined ? manifests[String(manifestInternalId)] : undefined;
      const canvas = canvasInternalId !== undefined ? canvases[String(canvasInternalId)] : undefined;

      const manifestUri = manifest?.uri ?? extractOriginalUri((t as any).manifest) ?? null;
      const canvasUri =
        canvas?.uri ?? extractOriginalUri((t as any).canvas) ?? extractOriginalUri((item as any).target) ?? null;

      const row: any = {
        original_manifest_id: manifestUri,
        original_canvas_id: canvasUri,
        madoc_canvas_id: canvasInternalId ?? null,
        madoc_contribution_id: item.id ?? null,

        contribution_data: (() => {
          if (typeof (item as any).value === 'string') return (item as any).value;
          try {
            return JSON.stringify((item as any).value);
          } catch {
            return String((item as any).value);
          }
        })(),
        capture_model_number: item.model_id ?? null,

        status: getContributionStatus(item) ?? (statusFilter !== 'all' ? statusFilter : null),
        contributor_id: getContributorId(item) ?? null,

        doc_id: item.doc_id ?? null,
        field_key: item.key ?? null,
        revises: item.revises ?? null,
      };
      return row;
    });

    return [await ExportFile.csv(rows, 'project-data/contributions.csv')];
  },
};
