import { parseModelTarget } from '../../../../utility/parse-model-target';
import { ExportFile } from '../../server-export';
import { ExportConfig, ExportDataOptions, ExportFileDefinition, SupportedExportResource } from '../../types';
import { getValue } from '@iiif/helpers/i18n';

type CachedTarget = { label?: string; uri?: string; index?: number | null };

const cache: {
  manifests: Record<string, CachedTarget>;
  canvases: Record<string, CachedTarget>;
} = {
  manifests: {},
  canvases: {},
};

function extractXywh(target: unknown): string | null {
  if (target == null) return null;

  const toStringTarget = (t: unknown): string | null => {
    if (t === null) return null;
    if (typeof t === 'string') return t;

    if (Array.isArray(t)) {
      return toStringTarget(t[0]);
    }

    if (typeof t === 'object') {
      const o: any = t;

      if (typeof o.id === 'string') return o.id;
      if (typeof o['@id'] === 'string') return o['@id'];

      if (typeof o.selector?.value === 'string') return o.selector.value;

      if (typeof o.target === 'string') return o.target;
      if (Array.isArray(o.target)) return toStringTarget(o.target);

      if (typeof o.source === 'string') return o.source;

      try {
        return JSON.stringify(o);
      } catch {
        return String(o);
      }
    }

    return String(t);
  };

  const text = toStringTarget(target);
  if (!text) return null;

  const m = text.match(/(?:#?xywh[=:])(\d+,\d+,\d+,\d+)/);
  return m?.[1] ?? null;
}

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

      const uri = extractOriginalUri(manifest);
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

      const uri = extractOriginalUri(canvas) || extractOriginalUri(response);

      const index =
        typeof (canvas as any).index === 'number'
          ? (canvas as any).index
          : typeof (canvas as any).position === 'number'
          ? (canvas as any).position
          : typeof (canvas as any).order === 'number'
          ? (canvas as any).order
          : null;

      cache.canvases[id.toString()] = {
        label: getValue(canvas.label),
        uri,
        index,
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
  },
  async exportData(
    subject: SupportedExportResource,
    options: ExportDataOptions<any>
  ): Promise<ExportFileDefinition[] | undefined> {
    const allPublished = await options.api.getProjectFieldsRaw(subject.id, {
      status: options.config.reviews ? 'all' : 'approved',
      entity: options.config.entity,
    });

    const manifestIds: number[] = [];
    const canvasIds: number[] = [];

    for (const item of allPublished) {
      const targetStr =
        typeof (item as any).target === 'string'
          ? (item as any).target
          : typeof (item as any).target?.id === 'string'
          ? (item as any).target.id
          : typeof (item as any).target?.['@id'] === 'string'
          ? (item as any).target['@id']
          : JSON.stringify((item as any).target);

      const t = parseModelTarget(targetStr);
      if (typeof t.manifest?.id === 'number') manifestIds.push(t.manifest.id);
      if (typeof t.canvas?.id === 'number') canvasIds.push(t.canvas.id);
    }

    const { manifests, canvases } = await fetchTargets(options.api, manifestIds, canvasIds);

    const rows = allPublished.map(item => {
      const t = parseModelTarget(
        typeof (item as any).target === 'string'
          ? (item as any).target
          : typeof (item as any).target?.id === 'string'
          ? (item as any).target.id
          : typeof (item as any).target?.['@id'] === 'string'
          ? (item as any).target['@id']
          : JSON.stringify((item as any).target)
      );

      const manifestInternalId = t.manifest?.id;
      const canvasInternalId = t.canvas?.id;

      const manifest = manifestInternalId !== undefined ? manifests[String(manifestInternalId)] : undefined;
      const canvas = canvasInternalId !== undefined ? canvases[String(canvasInternalId)] : undefined;

      return {
        original_manifest_id: manifest?.uri ?? null,
        original_canvas_id: canvas?.uri ?? null,
        canvas_index: canvas?.index ?? null,

        madoc_canvas_id: canvasInternalId ?? null,
        madoc_contribution_id: item.id ?? null,

        contribution_data: typeof item.value === 'string' ? item.value : JSON.stringify(item.value),
        capture_model_number: item.model_id ?? null,
        contribution_coords: extractXywh(item.target),

        status: (item as any).status ?? null,
        contributor_id: (item as any).user_id ?? (item as any).creator_id ?? null,

        doc_id: item.doc_id ?? null,
        field_key: item.key ?? null,
        revises: item.revises ?? null,
      };
    });

    return [await ExportFile.csv(rows, 'project-data/contributions.csv')];
  },
};
