import type { Collection as IIIFCollection, InternationalString } from '@iiif/presentation-3';
import type {
  DefineTabularModelValue,
  NetConfig,
  TabularModelPayload,
  TabularProjectSetupPayload,
} from '../../../../components/tabular/cast-a-net/types';
import {
  clampToRange as clampToRangeShared,
  netConfigFromSharedStructure as netConfigFromSharedStructureShared,
} from '@/frontend/shared/utility/tabular-net-config';
import { TABULAR_WIZARD_CAST_A_NET_ROWS } from './constants';
import type {
  IiifHistoryItem,
  IiifSelectionResource,
  MadocCollectionSnippet,
  MadocManifestSnippet,
  TabularOutlineSharePayload,
} from './types';

const IIIF_HOME_COLLECTION_PREFIX = 'iiif://madoc-tabular-home';

const madocManifestUrnPattern = /^urn:madoc:manifest:(\d+)$/i;
const madocManifestPathPattern = /\/manifests\/(\d+)(?:\/|$)/i;
const madocCanvasUrnPattern = /^urn:madoc:canvas:(\d+)$/i;
const madocCanvasPathPattern = /\/canvases\/(\d+)(?:\/|$)/i;
const madocCanvasExportPathPattern = /\/c(\d+)(?:\/|$)/i;
const numberPattern = /^\d+$/;
const manifestExportPattern = /\/manifests\/\d+\/export\//i;

export const hasIntlValue = (value?: InternationalString) => {
  return Boolean(getPreferredIntlValue(value));
};

export const clampToRange = clampToRangeShared;

export const getPreferredIntlValue = (value?: InternationalString, preferredLocale?: string) => {
  if (!value) {
    return '';
  }

  const preferred = preferredLocale ? value[preferredLocale] : undefined;
  if (preferred?.length) {
    const preferredText = preferred.join(' ').trim();
    if (preferredText) {
      return preferredText;
    }
  }

  for (const parts of Object.values(value)) {
    if (!parts?.length) {
      continue;
    }
    const text = parts.join(' ').trim();
    if (text) {
      return text;
    }
  }

  return '';
};

export const collectionRouteForId = (id: string) => {
  return `/collection?id=${encodeURIComponent(id)}`;
};

export const loadingRouteForId = (id: string) => {
  return `/loading?id=${encodeURIComponent(id)}`;
};

export const internationalStringToSearchValue = (value?: InternationalString) => {
  if (!value) {
    return '';
  }

  return Object.values(value).flat().join(' ').trim().toLowerCase();
};

export const isObjectRecord = (value: unknown): value is Record<string, unknown> => {
  return !!value && typeof value === 'object' && !Array.isArray(value);
};

export const normalizeLegacyIiifKeys = <T>(value: T): { value: T; changed: boolean } => {
  if (Array.isArray(value)) {
    let changed = false;
    const next = value.map(item => {
      const normalized = normalizeLegacyIiifKeys(item);
      if (normalized.changed) {
        changed = true;
      }
      return normalized.value;
    });

    return {
      value: (changed ? next : value) as T,
      changed,
    };
  }

  if (!isObjectRecord(value)) {
    return { value, changed: false };
  }

  let changed = false;
  const next: Record<string, unknown> = {};

  for (const [key, child] of Object.entries(value)) {
    const normalized = normalizeLegacyIiifKeys(child);
    if (normalized.changed) {
      changed = true;
    }
    next[key] = normalized.value;
  }

  if (typeof value['@id'] === 'string' && typeof value.id !== 'string') {
    next.id = value['@id'];
    changed = true;
  }

  if (typeof value['@type'] === 'string' && typeof value.type !== 'string') {
    next.type = value['@type'];
    changed = true;
  }

  return {
    value: (changed ? next : value) as T,
    changed,
  };
};

export const toSelectionResource = (value: unknown): IiifSelectionResource => {
  if (value == null) {
    return {};
  }

  if (typeof value === 'string' || typeof value === 'number') {
    return { id: value };
  }

  if (typeof value === 'object') {
    return value as IiifSelectionResource;
  }

  return {};
};

const toDisplayUrl = (value?: string) => {
  return toAbsoluteUrlIfPath(value) || value;
};

export const toStringValue = (value: unknown): string | undefined => {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed ? trimmed : undefined;
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    return `${value}`;
  }
  return undefined;
};

export const toTypeValue = (value: unknown) => {
  return (toStringValue(value) || '').toLowerCase();
};

export const toArray = <T>(value: T | T[] | undefined | null): T[] => {
  if (value == null) {
    return [];
  }
  return Array.isArray(value) ? value : [value];
};

const toInternationalString = (value: unknown): InternationalString | undefined => {
  if (!isObjectRecord(value)) {
    return undefined;
  }

  const entries = Object.entries(value)
    .map(([locale, localeValue]) => {
      if (Array.isArray(localeValue)) {
        const text = localeValue
          .map(part => toStringValue(part))
          .filter(Boolean)
          .map(part => part as string);
        return [locale, text] as const;
      }

      const single = toStringValue(localeValue);
      return [locale, single ? [single] : []] as const;
    })
    .filter(([, localeValue]) => localeValue.length > 0);

  if (!entries.length) {
    return undefined;
  }

  return Object.fromEntries(entries) as InternationalString;
};

const getIiifImageIdFromBody = (value: unknown, visited: WeakSet<object>): string | undefined => {
  for (const candidate of toArray(value)) {
    if (candidate == null) {
      continue;
    }

    if (typeof candidate === 'string' || typeof candidate === 'number') {
      const directId = toStringValue(candidate);
      if (directId) {
        return toDisplayUrl(directId);
      }
      continue;
    }

    if (!isObjectRecord(candidate)) {
      continue;
    }
    if (visited.has(candidate)) {
      continue;
    }
    visited.add(candidate);

    const candidateType = toTypeValue(candidate.type ?? candidate['@type']);
    const candidateId = toStringValue(candidate.id ?? candidate['@id']);
    const isImageLike =
      !candidateType ||
      candidateType === 'image' ||
      candidateType === 'contentresource' ||
      candidateType === 'specificresource';

    if (candidateId && isImageLike) {
      return toDisplayUrl(candidateId);
    }

    const nestedBody =
      getIiifImageIdFromBody(candidate.body, visited) ||
      getIiifImageIdFromBody(candidate.item, visited) ||
      getIiifImageIdFromBody(candidate.items, visited);

    if (nestedBody) {
      return nestedBody;
    }
  }

  return undefined;
};

const getIiifImageIdFromCanvasItems = (value: unknown): string | undefined => {
  const visited = new WeakSet<object>();

  for (const page of toArray(value)) {
    if (!isObjectRecord(page)) {
      continue;
    }

    for (const annotation of toArray(page.items)) {
      if (!isObjectRecord(annotation)) {
        continue;
      }

      const bodyId = getIiifImageIdFromBody(annotation.body, visited);
      if (bodyId) {
        return bodyId;
      }
    }
  }

  return undefined;
};

export const getIiifSelectionLabel = (resource?: IiifSelectionResource, preferredLocale?: string) => {
  if (!resource) {
    return '';
  }

  const rawLabel = (resource as Record<string, unknown>).label;

  if (typeof rawLabel === 'string') {
    return rawLabel.trim();
  }

  if (Array.isArray(rawLabel)) {
    const value = rawLabel
      .map(part => toStringValue(part))
      .filter(Boolean)
      .join(' ')
      .trim();
    return value;
  }

  const normalizedLabel = toInternationalString(rawLabel);
  return getPreferredIntlValue(normalizedLabel, preferredLocale);
};

export const getIiifSelectionThumbnail = (resource?: IiifSelectionResource) => {
  if (!resource) {
    return undefined;
  }

  const visited = new WeakSet<object>();
  const record = resource as Record<string, unknown>;
  const thumbnailFromField = getIiifImageIdFromBody(record.thumbnail, visited);
  if (thumbnailFromField) {
    return thumbnailFromField;
  }

  const thumbnailFromItems = getIiifImageIdFromCanvasItems(record.items);
  if (thumbnailFromItems) {
    return thumbnailFromItems;
  }

  return getIiifImageIdFromBody(record.body, visited);
};

export const stripQueryAndHash = (value: string) => {
  return value.split('#')[0].split('?')[0];
};

export const toAbsoluteUrlIfPath = (value?: string) => {
  if (!value || !value.startsWith('/') || typeof window === 'undefined') {
    return value;
  }

  try {
    return new URL(value, window.location.origin).toString();
  } catch {
    return value;
  }
};

export const getMadocManifestId = (value?: string): number | undefined => {
  if (!value) {
    return undefined;
  }

  const candidate = stripQueryAndHash(value);

  if (numberPattern.test(candidate)) {
    return Number(candidate);
  }

  const urnMatch = candidate.match(madocManifestUrnPattern);
  if (urnMatch?.[1]) {
    return Number(urnMatch[1]);
  }

  const pathMatch = candidate.match(madocManifestPathPattern);
  if (pathMatch?.[1]) {
    return Number(pathMatch[1]);
  }

  return undefined;
};

export const getMadocCanvasId = (value?: string): number | undefined => {
  if (!value) {
    return undefined;
  }

  const candidate = stripQueryAndHash(value);

  if (numberPattern.test(candidate)) {
    return Number(candidate);
  }

  const urnMatch = candidate.match(madocCanvasUrnPattern);
  if (urnMatch?.[1]) {
    return Number(urnMatch[1]);
  }

  const pathMatch = candidate.match(madocCanvasPathPattern);
  if (pathMatch?.[1]) {
    return Number(pathMatch[1]);
  }

  const exportMatch = candidate.match(madocCanvasExportPathPattern);
  if (exportMatch?.[1]) {
    return Number(exportMatch[1]);
  }

  return undefined;
};

export const looksLikeManifestReference = (id?: string, type?: string) => {
  if (!id) {
    return false;
  }

  if (type === 'manifest') {
    return true;
  }

  const candidate = stripQueryAndHash(id);
  return (
    madocManifestUrnPattern.test(candidate) ||
    manifestExportPattern.test(candidate) ||
    /\/manifests\/\d+\/?$/i.test(candidate)
  );
};

export const deriveManifestFromCanvasId = (canvasId?: string) => {
  if (!canvasId) {
    return undefined;
  }

  const candidate = stripQueryAndHash(canvasId);
  const match = candidate.match(/^(.*)\/c\d+\/?$/i);
  if (!match?.[1]) {
    return undefined;
  }

  return match[1];
};

export const ensureManifestExportUrl = (manifestId: string, siteSlug?: string) => {
  const asAbsolute = toAbsoluteUrlIfPath(manifestId) || manifestId;
  const candidate = stripQueryAndHash(asAbsolute);

  if (manifestExportPattern.test(candidate)) {
    return candidate;
  }

  const manifestNumericId = getMadocManifestId(candidate);
  if (manifestNumericId && siteSlug && typeof window !== 'undefined') {
    return `${window.location.origin}/s/${siteSlug}/madoc/api/manifests/${manifestNumericId}/export/3.0`;
  }

  if (/\/manifests\/\d+$/i.test(candidate)) {
    return `${candidate}/export/3.0`;
  }

  return candidate;
};

export const ensureCanvasIdForManifest = (canvasId: string, manifestId: string) => {
  const resolvedCanvas = stripQueryAndHash(toAbsoluteUrlIfPath(canvasId) || canvasId);
  const manifestBase = manifestId.replace(/\/+$/, '');

  if (resolvedCanvas.startsWith(`${manifestBase}/c`)) {
    return resolvedCanvas;
  }

  const canvasNumericId = getMadocCanvasId(resolvedCanvas);
  if (canvasNumericId) {
    return `${manifestBase}/c${canvasNumericId}`;
  }

  return resolvedCanvas;
};

export const resolveIiifSelectionIds = (options: { manifestId?: string; canvasId?: string; siteSlug?: string }) => {
  const canvasCandidate = options.canvasId ? stripQueryAndHash(options.canvasId) : undefined;
  const manifestCandidate =
    options.manifestId && options.manifestId.trim()
      ? stripQueryAndHash(options.manifestId)
      : deriveManifestFromCanvasId(canvasCandidate);

  if (!canvasCandidate) {
    return {
      manifestId: undefined,
      canvasId: undefined,
    };
  }

  const resolvedManifestId = manifestCandidate
    ? ensureManifestExportUrl(manifestCandidate, options.siteSlug)
    : undefined;
  const resolvedCanvasId = resolvedManifestId
    ? ensureCanvasIdForManifest(canvasCandidate, resolvedManifestId)
    : stripQueryAndHash(toAbsoluteUrlIfPath(canvasCandidate) || canvasCandidate);

  return {
    manifestId: resolvedManifestId,
    canvasId: resolvedCanvasId,
  };
};

export const normalizeIiifInputUrl = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }
  return toAbsoluteUrlIfPath(trimmed) || trimmed;
};

export const createMadocCollectionExportUrl = (siteSlug: string, collectionId: number) => {
  if (typeof window === 'undefined') {
    return undefined;
  }
  return `${window.location.origin}/s/${siteSlug}/madoc/api/collections/${collectionId}/export/3.0`;
};

export const createMadocHomeCollection = (options: {
  siteSlug: string;
  query?: string;
  collections: MadocCollectionSnippet[];
  manifests: MadocManifestSnippet[];
}): IIIFCollection => {
  const queryToken = encodeURIComponent(options.query?.trim() || 'all');
  const id = `${IIIF_HOME_COLLECTION_PREFIX}/${options.siteSlug}/${queryToken}`;
  const label = options.query?.trim()
    ? ({ en: [`Madoc content: ${options.query.trim()}`] } as InternationalString)
    : ({ en: ['Madoc content'] } as InternationalString);

  const collectionItems = options.collections
    .map(collection => {
      const url = createMadocCollectionExportUrl(options.siteSlug, collection.id);
      if (!url) {
        return null;
      }

      return {
        id: url,
        type: 'Collection',
        label: hasIntlValue(collection.label)
          ? collection.label
          : ({ en: [`Collection ${collection.id}`] } as InternationalString),
      };
    })
    .filter(Boolean) as Array<{ id: string; type: 'Collection'; label: InternationalString }>;

  const manifestItems = options.manifests
    .map(manifest => {
      const url = ensureManifestExportUrl(`${manifest.id}`, options.siteSlug);
      if (!url) {
        return null;
      }

      return {
        id: url,
        type: 'Manifest',
        label: hasIntlValue(manifest.label)
          ? manifest.label
          : ({ en: [`Manifest ${manifest.id}`] } as InternationalString),
      };
    })
    .filter(Boolean) as Array<{ id: string; type: 'Manifest'; label: InternationalString }>;

  return {
    id,
    type: 'Collection',
    label,
    items: [...collectionItems, ...manifestItems],
  };
};

export const createIiifHomeHistoryItem = (homeCollection: IIIFCollection): IiifHistoryItem => {
  return {
    url: homeCollection.id,
    route: collectionRouteForId(homeCollection.id),
    resource: homeCollection.id,
    metadata: {
      type: 'Collection',
      label: homeCollection.label,
    },
    timestamp: new Date().toISOString(),
  };
};

export const encodeOutlinePayload = (payload: TabularOutlineSharePayload) => {
  try {
    if (typeof window === 'undefined') return '';
    return window.btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
  } catch {
    return '';
  }
};

export const decodeOutlinePayload = (raw: string): TabularOutlineSharePayload | null => {
  try {
    if (typeof window === 'undefined') return null;
    const decoded = decodeURIComponent(escape(window.atob(raw)));
    return JSON.parse(decoded) as TabularOutlineSharePayload;
  } catch {
    return null;
  }
};

export const stringifyForDisplay = (value: unknown) => {
  try {
    return JSON.stringify(value ?? null, null, 2);
  } catch {
    return '{}';
  }
};

export const getErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error === 'object' && error && 'message' in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === 'string' && message.trim()) {
      return message;
    }
  }

  return fallback;
};

export const netConfigFromSharedStructure = (tabular?: TabularProjectSetupPayload['structure']): NetConfig | null => {
  return netConfigFromSharedStructureShared(tabular, {
    useEvenlySpacedFallbackPositions: true,
  });
};

export const tabularModelValueFromSharedPayload = (payload: TabularModelPayload): DefineTabularModelValue => {
  const columns = Math.max(1, payload.columns?.length || 1);

  return {
    columns,
    previewRows: TABULAR_WIZARD_CAST_A_NET_ROWS,
    headings: Array.from({ length: columns }, (_, index) => payload.columns[index]?.label ?? ''),
    fieldTypes: Array.from(
      { length: columns },
      (_, index) => payload.columns[index]?.type ?? payload.columns[index]?.fieldType
    ),
    helpText: Array.from({ length: columns }, (_, index) => payload.columns[index]?.helpText ?? ''),
    saved: Array.from({ length: columns }, (_, index) => payload.columns[index]?.saved ?? true),
  };
};
