import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import slugify from 'slugify';
import { useMutation } from 'react-query';
import { useTranslation } from 'react-i18next';
import type { Collection as IIIFCollection, InternationalString, Manifest as IIIFManifest } from '@iiif/presentation-3';
import { CreateProject } from '../../../../../types/schemas/create-project';
import { useApi } from '../../../../shared/hooks/use-api';
import { useDefaultLocale, useSite, useSupportedLocales } from '../../../../shared/hooks/use-site';
import { WidePage } from '../../../../shared/layout/WidePage';
import { AdminHeader } from '../../../molecules/AdminHeader';
import { Input, InputContainer, InputLabel } from '../../../../shared/form/Input';
import { Button, ButtonRow, TinyButton } from '../../../../shared/navigation/Button';
import { ErrorMessage } from '../../../../shared/callouts/ErrorMessage';
import { MetadataEditor } from '../../../molecules/MetadataEditor';
import { buildTabularProjectSetupPayload } from '../../../components/tabular/cast-a-net/CastANetStructure';
import type {
  TabularCellRef,
  DefineTabularModelValue,
  NetConfig,
  TabularModelPayload,
  TabularProjectSetupPayload,
} from '../../../components/tabular/cast-a-net/types';
import { madocLazy } from '../../../../shared/utility/madoc-lazy';
import type { IIIFBrowserProps } from 'iiif-browser';
import 'iiif-browser/dist/index.css';
import { VaultProvider } from 'react-iiif-vault';
import { BrowserComponent } from '../../../../shared/utility/browser-component';
import type { Root } from 'react-dom/client';
import { ModalButton } from '../../../../shared/components/Modal';
import { SuccessMessage } from '../../../../shared/callouts/SuccessMessage';
import { TabularHeadingsTable } from '../../../components/tabular/cast-a-net/TabularHeadingsTable';
import { TabularPreviewTable } from '../../../components/tabular/cast-a-net/TabularPreviewTable';
import { makeEvenPositions } from '../../../components/tabular/cast-a-net/utils';
import { LinkIcon } from '../../../../shared/icons/LinkIcon';

const DefineTabularModelLazy = madocLazy(async () => {
  const imported = await import('../../../components/tabular/cast-a-net/DefineTabularModel');
  return { default: imported.DefineTabularModel };
});

const CastANetLazy = madocLazy(async () => {
  const imported = await import('../../../components/tabular/cast-a-net/CastANet');
  return { default: imported.CastANet };
});

const IsolatedIIIFBrowser: React.FC<IIIFBrowserProps> = props => {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const rootRef = useRef<Root | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!hostRef.current) return;
      const [{ createRoot }, browserModule] = await Promise.all([import('react-dom/client'), import('iiif-browser')]);
      if (cancelled || !hostRef.current) return;

      if (!rootRef.current) {
        rootRef.current = createRoot(hostRef.current);
      }

      rootRef.current.render(
        <VaultProvider>
          <browserModule.IIIFBrowser {...props} />
        </VaultProvider>
      );
    })();

    return () => {
      cancelled = true;
    };
  }, [props]);

  useEffect(() => {
    return () => {
      if (rootRef.current) {
        rootRef.current.unmount();
        rootRef.current = null;
      }
    };
  }, []);

  return <div ref={hostRef} />;
};

const STEP_DETAILS = 0;
const STEP_SETTINGS = 1;
const STEP_MODEL = 2;
const STEP_NET = 3;
const STEP_PREVIEW = 4;
const STEP_COMPLETE = 5;
const CAST_A_NET_ROWS = 5;
const SHARE_COPY_TIMEOUT = 1800;
const PREVIEW_NUDGE_STEP = 0.25;
const NUDGE_BUTTON_SIZE = 54;
const PREVIEW_CANVAS_HEIGHT = 420;
const PREVIEW_SPLIT_TOTAL_HEIGHT = 760;
const PREVIEW_SPLIT_GAP = 12;
const PREVIEW_SPLIT_DIVIDER_HEIGHT = 18;
const PREVIEW_CANVAS_MIN_HEIGHT = 280;
const PREVIEW_TABLE_MIN_HEIGHT = 180;
const PREVIEW_CANVAS_MAX_HEIGHT =
  PREVIEW_SPLIT_TOTAL_HEIGHT - PREVIEW_SPLIT_DIVIDER_HEIGHT - PREVIEW_TABLE_MIN_HEIGHT - PREVIEW_SPLIT_GAP * 2;
const MAX_MADOC_COLLECTION_HOME_PAGES = 20;
const MAX_MADOC_MANIFEST_HOME_PAGES = 40;
const IIIF_HOME_COLLECTION_PREFIX = 'iiif://madoc-tabular-home';
const IIIF_HOME_LOCAL_STORAGE_KEY = 'iiif-browser-tabular-project-v2';

const nudgeButtonStyle: React.CSSProperties = {
  height: NUDGE_BUTTON_SIZE,
  width: NUDGE_BUTTON_SIZE,
  border: '1px solid #d4d6df',
  borderRadius: 8,
  background: '#fff',
  cursor: 'pointer',
  fontSize: 22,
  lineHeight: '1',
};

const hasIntlValue = (value?: InternationalString) => {
  if (!value) return false;
  const first = Object.values(value)[0];
  return Boolean(first && first.join('').trim());
};

type IiifSelectionLink = {
  id?: string | number;
  type?: string | number;
};

type IiifSelectionLinkValue = IiifSelectionLink | string | number;

type IiifSelectionResource = {
  id?: string | number;
  type?: string | number;
  partOf?: IiifSelectionLinkValue | IiifSelectionLinkValue[];
};

type IiifSelectionPayload = IiifSelectionResource & {
  resource?: IiifSelectionResource | string | number;
  parent?: IiifSelectionResource | string | number | null;
};

type TabularOutlineSharePayload = {
  label?: InternationalString;
  summary?: InternationalString;
  slug?: string;
  enableZoomTracking?: boolean;
  iiif?: {
    manifestId?: string;
    canvasId?: string;
  };
  tabular?: TabularProjectSetupPayload;
};

type IiifHistoryItem = {
  url: string;
  route: string;
  resource: string | null;
  metadata?: {
    type?: string;
    label?: InternationalString;
  };
  timestamp?: string | null;
};

const clampToRange = (value: number, min: number, max: number) => {
  return Math.max(min, Math.min(max, value));
};

const collectionRouteForId = (id: string) => {
  return `/collection?id=${encodeURIComponent(id)}`;
};

const loadingRouteForId = (id: string) => {
  return `/loading?id=${encodeURIComponent(id)}`;
};

const internationalStringToSearchValue = (value?: InternationalString) => {
  if (!value) {
    return '';
  }

  return Object.values(value).flat().join(' ').trim().toLowerCase();
};

const isObjectRecord = (value: unknown): value is Record<string, unknown> => {
  return !!value && typeof value === 'object' && !Array.isArray(value);
};

const normalizeLegacyIiifKeys = <T,>(value: T): { value: T; changed: boolean } => {
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

const toSelectionResource = (value: unknown): IiifSelectionResource => {
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

const toStringValue = (value: unknown): string | undefined => {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed ? trimmed : undefined;
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    return `${value}`;
  }
  return undefined;
};

const toTypeValue = (value: unknown) => {
  return (toStringValue(value) || '').toLowerCase();
};

const toArray = <T,>(value: T | T[] | undefined | null): T[] => {
  if (value == null) {
    return [];
  }
  return Array.isArray(value) ? value : [value];
};

const stripQueryAndHash = (value: string) => {
  return value.split('#')[0].split('?')[0];
};

const toAbsoluteUrlIfPath = (value?: string) => {
  if (!value || !value.startsWith('/') || typeof window === 'undefined') {
    return value;
  }

  try {
    return new URL(value, window.location.origin).toString();
  } catch {
    return value;
  }
};

const madocManifestUrnPattern = /^urn:madoc:manifest:(\d+)$/i;
const madocManifestPathPattern = /\/manifests\/(\d+)(?:\/|$)/i;
const madocCanvasUrnPattern = /^urn:madoc:canvas:(\d+)$/i;
const madocCanvasPathPattern = /\/canvases\/(\d+)(?:\/|$)/i;
const madocCanvasExportPathPattern = /\/c(\d+)(?:\/|$)/i;
const numberPattern = /^\d+$/;
const manifestExportPattern = /\/manifests\/\d+\/export\//i;

const getMadocManifestId = (value?: string): number | undefined => {
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

const getMadocCanvasId = (value?: string): number | undefined => {
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

const looksLikeManifestReference = (id?: string, type?: string) => {
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

const deriveManifestFromCanvasId = (canvasId?: string) => {
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

const ensureManifestExportUrl = (manifestId: string, siteSlug?: string) => {
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

const ensureCanvasIdForManifest = (canvasId: string, manifestId: string) => {
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

const resolveIiifSelectionIds = (options: { manifestId?: string; canvasId?: string; siteSlug?: string }) => {
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

const normalizeIiifInputUrl = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }
  return toAbsoluteUrlIfPath(trimmed) || trimmed;
};

const createMadocCollectionExportUrl = (siteSlug: string, collectionId: number) => {
  if (typeof window === 'undefined') {
    return undefined;
  }
  return `${window.location.origin}/s/${siteSlug}/madoc/api/collections/${collectionId}/export/3.0`;
};

type MadocCollectionSnippet = {
  id: number;
  label: InternationalString;
  thumbnail: string | null;
};

type MadocManifestSnippet = {
  id: number;
  label: InternationalString;
  thumbnail: string | null;
};

const createMadocHomeCollection = (options: {
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

const createIiifHomeHistoryItem = (homeCollection: IIIFCollection): IiifHistoryItem => {
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

const encodeOutlinePayload = (payload: TabularOutlineSharePayload) => {
  try {
    if (typeof window === 'undefined') return '';
    return window.btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
  } catch {
    return '';
  }
};

const decodeOutlinePayload = (raw: string): TabularOutlineSharePayload | null => {
  try {
    if (typeof window === 'undefined') return null;
    const decoded = decodeURIComponent(escape(window.atob(raw)));
    return JSON.parse(decoded) as TabularOutlineSharePayload;
  } catch {
    return null;
  }
};

const stringifyForDisplay = (value: unknown) => {
  try {
    return JSON.stringify(value ?? null, null, 2);
  } catch {
    return '{}';
  }
};

const getErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error === 'object' && error && 'message' in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === 'string' && message.trim()) {
      return message;
    }
  }

  return fallback;
};

const payloadCardStyle: React.CSSProperties = {
  border: '1px solid #d6d6d6',
  borderRadius: 4,
  background: '#fff',
  overflow: 'hidden',
};

const payloadCardHeaderStyle: React.CSSProperties = {
  padding: '8px 10px',
  borderBottom: '1px solid #e5e7eb',
  background: '#f8fafc',
  fontSize: 12,
  fontWeight: 600,
};

const payloadCardBodyStyle: React.CSSProperties = {
  margin: 0,
  padding: 10,
  fontSize: 12,
  lineHeight: 1.45,
  maxHeight: 320,
  overflow: 'auto',
  background: '#fff',
};

const PayloadCard: React.FC<{ title: string; value: unknown }> = ({ title, value }) => {
  return (
    <div style={payloadCardStyle}>
      <div style={payloadCardHeaderStyle}>{title}</div>
      <pre style={payloadCardBodyStyle}>{stringifyForDisplay(value)}</pre>
    </div>
  );
};

const toRelativePositions = (parts: number[], total: number, count: number) => {
  if (count <= 1) return [];

  if (!parts.length || total <= 0) {
    return makeEvenPositions(count);
  }

  let cumulative = 0;
  const positions: number[] = [];
  for (let index = 0; index < count - 1; index++) {
    cumulative += parts[index] ?? 0;
    const ratio = (cumulative / total) * 100;
    positions.push(clampToRange(ratio, 0, 100));
  }
  return positions;
};

const netConfigFromSharedStructure = (tabular?: TabularProjectSetupPayload['structure']): NetConfig | null => {
  if (!tabular) {
    return null;
  }

  const fallbackLeft = tabular.topLeft?.x ?? 10;
  const fallbackTop = tabular.topLeft?.y ?? 10;
  const fallbackWidth = (tabular.topRight?.x ?? 90) - fallbackLeft;
  const widthFromMargins = 100 - (tabular.marginsPct?.left ?? fallbackLeft) - (tabular.marginsPct?.right ?? 10);
  const totalWidth = clampToRange(widthFromMargins > 0 ? widthFromMargins : fallbackWidth, 1, 100);

  const totalHeightFromRows = tabular.rowHeightsPctOfPage.reduce((sum, rowHeight) => sum + rowHeight, 0);
  const heightFromMargins = 100 - (tabular.marginsPct?.top ?? fallbackTop) - (tabular.marginsPct?.bottom ?? 10);
  const totalHeight = clampToRange(heightFromMargins > 0 ? heightFromMargins : totalHeightFromRows, 1, 100);

  const left = clampToRange(tabular.marginsPct?.left ?? fallbackLeft, 0, 100 - totalWidth);
  const top = clampToRange(tabular.marginsPct?.top ?? fallbackTop, 0, 100 - totalHeight);

  const cols = Math.max(1, tabular.columnCount || tabular.columnWidthsPctOfPage.length || 1);
  const rows = Math.max(1, tabular.rowHeightsPctOfPage.length || 1);

  return {
    rows,
    cols,
    top,
    left,
    width: totalWidth,
    height: totalHeight,
    rowPositions: toRelativePositions(tabular.rowHeightsPctOfPage, totalHeight, rows),
    colPositions: toRelativePositions(tabular.columnWidthsPctOfPage, totalWidth, cols),
  };
};

const tabularModelValueFromSharedPayload = (payload: TabularModelPayload): DefineTabularModelValue => {
  const columns = Math.max(1, payload.columns?.length || 1);

  return {
    columns,
    previewRows: CAST_A_NET_ROWS,
    headings: Array.from({ length: columns }, (_, index) => payload.columns[index]?.label ?? ''),
    fieldTypes: Array.from(
      { length: columns },
      (_, index) => payload.columns[index]?.type ?? payload.columns[index]?.fieldType
    ),
    helpText: Array.from({ length: columns }, (_, index) => payload.columns[index]?.helpText ?? ''),
    saved: Array.from({ length: columns }, (_, index) => payload.columns[index]?.saved ?? true),
  };
};

export const TabularProjectWizard: React.FC = () => {
  const api = useApi();
  const { t } = useTranslation();
  const defaultLocale = useDefaultLocale();
  const availableLanguages = useSupportedLocales();
  const site = useSite();
  const [step, setStep] = useState(STEP_DETAILS);
  const [label, setLabel] = useState<InternationalString>({ [defaultLocale]: [''] });
  const [summary, setSummary] = useState<InternationalString>({ [defaultLocale]: [''] });
  const [slug, setSlug] = useState('');
  const [autoSlug, setAutoSlug] = useState(true);

  const [enableZoomTracking, setEnableZoomTracking] = useState(false);
  const [manifestId, setManifestId] = useState<string | undefined>();
  const [canvasId, setCanvasId] = useState<string | undefined>();
  const [iiifError, setIiifError] = useState<string | null>(null);
  const [iiifBrowserSelection, setIiifBrowserSelection] = useState<string | null>(null);
  const [iiifMadocSearchInput, setIiifMadocSearchInput] = useState('');
  const [iiifMadocSearchQuery, setIiifMadocSearchQuery] = useState('');
  const [iiifPasteUrl, setIiifPasteUrl] = useState('');
  const [iiifStartupUrl, setIiifStartupUrl] = useState<string | null>(null);
  const [iiifHomeCollection, setIiifHomeCollection] = useState<IIIFCollection | null>(null);
  const [isLoadingIiifHome, setIsLoadingIiifHome] = useState(false);
  const [iiifHomeLoadError, setIiifHomeLoadError] = useState<string | null>(null);
  const [iiifBrowserModalError, setIiifBrowserModalError] = useState<string | null>(null);
  const [iiifBrowserVersion, setIiifBrowserVersion] = useState(0);
  const [viewerManifestId, setViewerManifestId] = useState<string | undefined>();
  const viewerManifestBlobRef = useRef<string | null>(null);

  const [tabularModel, setTabularModel] = useState<DefineTabularModelValue>({
    columns: 0,
    previewRows: 0,
    headings: [],
  });
  const [tabularPayload, setTabularPayload] = useState<TabularModelPayload | null>(null);
  const [isModelValid, setIsModelValid] = useState(false);

  const [netConfig, setNetConfig] = useState<NetConfig>({
    rows: CAST_A_NET_ROWS,
    cols: 5,
    top: 10,
    left: 10,
    width: 80,
    height: 80,
    rowPositions: [],
    colPositions: [],
  });
  const [castANetHeight, setCastANetHeight] = useState(520);
  const [previewCanvasHeight, setPreviewCanvasHeight] = useState(
    clampToRange(PREVIEW_CANVAS_HEIGHT, PREVIEW_CANVAS_MIN_HEIGHT, PREVIEW_CANVAS_MAX_HEIGHT)
  );
  const [isCastANetDividerHover, setIsCastANetDividerHover] = useState(false);
  const [previewActiveCell, setPreviewActiveCell] = useState<TabularCellRef | null>(null);
  const [previewRows, setPreviewRows] = useState<string[][]>([]);
  const [previewAdditionalRows, setPreviewAdditionalRows] = useState(0);
  const [shareCopied, setShareCopied] = useState<'idle' | 'copied' | 'error'>('idle');
  const [didLoadSharedOutline, setDidLoadSharedOutline] = useState(false);

  const [saveProject, { status, data, isSuccess, reset }] = useMutation(async (config: CreateProject) => {
    try {
      return await api.createProject(config);
    } catch (error) {
      return { error: getErrorMessage(error, 'Unable to create project.') };
    }
  });

  const isError = !!data?.error;
  const isProjectCompleted = isSuccess && !isError;
  const createdProjectPath = data?.id ? `/projects/${data.id}` : data?.slug ? `/projects/${data.slug}` : null;
  const detailsDone = hasIntlValue(label) && hasIntlValue(summary) && !!slug.trim();
  const hasImage = Boolean(manifestId && canvasId);
  const requiresNetStep = enableZoomTracking && hasImage;
  const modelSaved = tabularModel.saved ? tabularModel.saved.every(Boolean) : false;
  const previewRowOffset = enableZoomTracking && hasImage ? 1 : 0;
  const basePreviewTableRowCount = Math.max(1, (netConfig.rows || CAST_A_NET_ROWS) - previewRowOffset);
  const previewTableRowCount = basePreviewTableRowCount + previewAdditionalRows;
  const previewTableHeight = Math.max(
    PREVIEW_TABLE_MIN_HEIGHT,
    PREVIEW_SPLIT_TOTAL_HEIGHT - previewCanvasHeight - PREVIEW_SPLIT_DIVIDER_HEIGHT - PREVIEW_SPLIT_GAP * 2
  );
  const modelColumnCount = Math.max(1, tabularModel.columns || 1);
  const netColumnCount = Math.max(1, netConfig.cols);
  const configuredColumnCount = Math.max(1, tabularPayload?.columns?.length || modelColumnCount);
  const primaryLabel = Object.values(label)[0]?.join('').trim() || '';
  const primarySummary = Object.values(summary)[0]?.join('').trim() || '';

  useEffect(() => {
    if (autoSlug) {
      const textLabel = Object.values(label)[0]?.join('') || '';
      setSlug(slugify(textLabel, { lower: true }));
    }
  }, [autoSlug, label]);

  useEffect(() => {
    if (!modelSaved) {
      return;
    }

    const colsFromSavedModel = Math.max(1, Math.floor(tabularModel.columns || tabularPayload?.columns?.length || 0));

    setNetConfig(prev => ({
      ...prev,
      cols: colsFromSavedModel,
      rows: CAST_A_NET_ROWS,
    }));
  }, [modelSaved, tabularModel.columns, tabularPayload]);

  const previewColumns = useMemo(
    () =>
      tabularPayload?.columns?.length
        ? tabularPayload.columns.map(column => column.label || '')
        : Array.from({ length: modelColumnCount }, (_, index) => tabularModel.headings?.[index] ?? ''),
    [tabularPayload, modelColumnCount, tabularModel.headings]
  );
  const previewTooltips = useMemo(
    () =>
      tabularPayload?.columns?.length
        ? tabularPayload.columns.map(column => column.helpText || '')
        : Array.from({ length: modelColumnCount }, (_, index) => tabularModel.helpText?.[index] ?? ''),
    [tabularPayload, modelColumnCount, tabularModel.helpText]
  );

  useEffect(() => {
    const rowCount = previewTableRowCount;
    const colCount = Math.max(1, previewColumns.length || 1);

    setPreviewRows(prev =>
      Array.from({ length: rowCount }, (_row, rowIndex) =>
        Array.from({ length: colCount }, (_col, colIndex) => prev[rowIndex]?.[colIndex] ?? '')
      )
    );
  }, [previewTableRowCount, previewColumns.length]);

  useEffect(() => {
    if (!previewActiveCell) {
      return;
    }

    const maxRow = previewTableRowCount - 1;
    const maxCol = Math.max(1, previewColumns.length || 1) - 1;

    if (previewActiveCell.row > maxRow || previewActiveCell.col > maxCol) {
      setPreviewActiveCell(null);
    }
  }, [previewActiveCell, previewTableRowCount, previewColumns.length]);

  useEffect(() => {
    if (shareCopied !== 'copied' || typeof window === 'undefined') {
      return;
    }

    const timeout = window.setTimeout(() => setShareCopied('idle'), SHARE_COPY_TIMEOUT);
    return () => window.clearTimeout(timeout);
  }, [shareCopied]);

  useEffect(() => {
    if (viewerManifestBlobRef.current) {
      URL.revokeObjectURL(viewerManifestBlobRef.current);
      viewerManifestBlobRef.current = null;
    }

    if (!manifestId || typeof window === 'undefined') {
      setViewerManifestId(undefined);
      return;
    }

    let cancelled = false;
    setViewerManifestId(manifestId);

    (async () => {
      try {
        const response = await fetch(manifestId);
        if (!response.ok) {
          return;
        }

        const manifestJson = (await response.json()) as unknown;
        if (!isObjectRecord(manifestJson)) {
          return;
        }

        const normalized = normalizeLegacyIiifKeys(manifestJson);
        const originalManifestId = typeof manifestJson.id === 'string' ? manifestJson.id : undefined;
        const normalizedManifest = isObjectRecord(normalized.value)
          ? ({ ...normalized.value, id: manifestId } as IIIFManifest)
          : null;

        if (!normalizedManifest || (!normalized.changed && originalManifestId === manifestId)) {
          return;
        }

        const blobUrl = URL.createObjectURL(
          new Blob([JSON.stringify(normalizedManifest)], { type: 'application/ld+json' })
        );

        if (cancelled) {
          URL.revokeObjectURL(blobUrl);
          return;
        }

        viewerManifestBlobRef.current = blobUrl;
        setViewerManifestId(blobUrl);
      } catch {
        // Use the original manifest URL when normalization fetch fails.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [manifestId]);

  useEffect(() => {
    return () => {
      if (viewerManifestBlobRef.current) {
        URL.revokeObjectURL(viewerManifestBlobRef.current);
        viewerManifestBlobRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!site?.slug || typeof window === 'undefined') {
      return;
    }

    let cancelled = false;
    const query = iiifMadocSearchQuery.trim();
    const queryLowerCase = query.toLowerCase();

    const loadMadocHomeResources = async () => {
      setIsLoadingIiifHome(true);
      setIiifHomeLoadError(null);

      try {
        const allCollections: MadocCollectionSnippet[] = [];
        let collectionPage = 1;
        let collectionTotalPages = 1;

        while (collectionPage <= collectionTotalPages && collectionPage <= MAX_MADOC_COLLECTION_HOME_PAGES) {
          const response = await api.getCollections(collectionPage);
          allCollections.push(
            ...response.collections.map(collection => ({
              id: collection.id,
              label: collection.label,
              thumbnail: collection.thumbnail,
            }))
          );
          collectionTotalPages = Math.max(1, response.pagination.totalPages || 1);
          collectionPage += 1;
        }

        const allManifests: MadocManifestSnippet[] = [];
        let manifestPage = 1;
        let manifestTotalPages = 1;

        while (manifestPage <= manifestTotalPages && manifestPage <= MAX_MADOC_MANIFEST_HOME_PAGES) {
          const response = await api.getManifests(manifestPage, { query: query || undefined });
          allManifests.push(
            ...response.manifests.map(manifest => ({
              id: manifest.id,
              label: manifest.label,
              thumbnail: manifest.thumbnail,
            }))
          );
          manifestTotalPages = Math.max(1, response.pagination.totalPages || 1);
          manifestPage += 1;
        }

        if (cancelled) {
          return;
        }

        const filteredCollections = query
          ? allCollections.filter(collection =>
              internationalStringToSearchValue(collection.label).includes(queryLowerCase)
            )
          : allCollections;

        const nextHomeCollection = createMadocHomeCollection({
          siteSlug: site.slug,
          query,
          collections: filteredCollections,
          manifests: allManifests,
        });

        setIiifHomeCollection(nextHomeCollection);
        setIiifHomeLoadError(null);
        setIiifBrowserVersion(version => version + 1);
      } catch (error) {
        if (cancelled) {
          return;
        }

        setIiifHomeCollection(null);
        setIiifHomeLoadError(getErrorMessage(error, t('Unable to load Madoc manifests and collections.')));
      } finally {
        if (!cancelled) {
          setIsLoadingIiifHome(false);
        }
      }
    };

    void loadMadocHomeResources();

    return () => {
      cancelled = true;
    };
  }, [api, iiifMadocSearchQuery, site?.slug, t]);

  useEffect(() => {
    if (didLoadSharedOutline || typeof window === 'undefined') {
      return;
    }
    setDidLoadSharedOutline(true);

    const outlineValue = new URLSearchParams(window.location.search).get('outline');
    if (!outlineValue) {
      return;
    }

    const shared = decodeOutlinePayload(outlineValue);
    if (!shared) {
      setIiifError(t('The shared outline could not be loaded.'));
      return;
    }

    if (shared.label) {
      setLabel(shared.label);
    }
    if (shared.summary) {
      setSummary(shared.summary);
    }
    if (typeof shared.slug === 'string') {
      setSlug(shared.slug);
      setAutoSlug(false);
    }
    if (typeof shared.enableZoomTracking === 'boolean') {
      setEnableZoomTracking(shared.enableZoomTracking);
    }
    if (shared.iiif?.manifestId) {
      setManifestId(shared.iiif.manifestId);
    }
    if (shared.iiif?.canvasId) {
      setCanvasId(shared.iiif.canvasId);
    }
    if (shared.tabular?.model) {
      setTabularPayload(shared.tabular.model);
      setTabularModel(tabularModelValueFromSharedPayload(shared.tabular.model));
      setIsModelValid(true);
    }
    if (shared.tabular?.structure) {
      const restoredNet = netConfigFromSharedStructure(shared.tabular.structure);
      if (restoredNet) {
        setNetConfig(restoredNet);
      }
    }
    if (shared.tabular?.model) {
      setStep(STEP_PREVIEW);
    }
  }, [didLoadSharedOutline, t]);

  const clearImageSelection = () => {
    setManifestId(undefined);
    setCanvasId(undefined);
    setIiifError(null);
    setIiifBrowserSelection(null);
    if (step === STEP_NET) {
      setStep(STEP_SETTINGS);
    }
  };

  const startCastANetResize = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    const startY = event.clientY;
    const startHeight = castANetHeight;
    const minHeight = 360;
    const maxHeight = 760;

    const onMove = (moveEvent: MouseEvent) => {
      const delta = moveEvent.clientY - startY;
      const nextHeight = Math.max(minHeight, Math.min(maxHeight, startHeight + delta));
      setCastANetHeight(nextHeight);
    };

    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const startPreviewResize = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    const startY = event.clientY;
    const startHeight = previewCanvasHeight;

    const onMove = (moveEvent: MouseEvent) => {
      const delta = moveEvent.clientY - startY;
      const nextHeight = clampToRange(startHeight + delta, PREVIEW_CANVAS_MIN_HEIGHT, PREVIEW_CANVAS_MAX_HEIGHT);
      setPreviewCanvasHeight(nextHeight);
    };

    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const setupPayload = useMemo(() => {
    if (!tabularPayload) return null;
    return buildTabularProjectSetupPayload(netConfig, tabularPayload);
  }, [netConfig, tabularPayload]);

  const projectDetailsForConfirmation = useMemo(
    () => ({
      label,
      summary,
      slug,
      enableZoomTracking,
      iiif: {
        manifestId: manifestId ?? null,
        canvasId: canvasId ?? null,
      },
    }),
    [label, summary, slug, enableZoomTracking, manifestId, canvasId]
  );

  const createProjectPayload = useMemo<CreateProject | null>(() => {
    if (!setupPayload) {
      return null;
    }

    return {
      label,
      summary,
      slug,
      template: 'tabular-project',
      template_options: {
        enableZoomTracking,
        iiif: { manifestId, canvasId },
        tabular: setupPayload,
      },
      template_config: {
        enableZoomTracking,
        iiif: { manifestId, canvasId },
        tabular: setupPayload,
      },
      remote_template: null,
    };
  }, [label, summary, slug, enableZoomTracking, manifestId, canvasId, setupPayload]);

  const shareUrl = useMemo(() => {
    if (typeof window === 'undefined' || !setupPayload) return '';
    const outline: TabularOutlineSharePayload = {
      label,
      summary,
      slug,
      enableZoomTracking,
      iiif: { manifestId, canvasId },
      tabular: setupPayload,
    };
    const encoded = encodeOutlinePayload(outline);
    if (!encoded) return '';
    return `${window.location.origin}${window.location.pathname}?outline=${encodeURIComponent(encoded)}`;
  }, [label, summary, slug, enableZoomTracking, manifestId, canvasId, setupPayload]);

  const canTrackPreviewOnCanvas = Boolean(
    enableZoomTracking &&
    hasImage &&
    setupPayload?.structure?.columnWidthsPctOfPage?.length &&
    setupPayload?.structure?.rowHeightsPctOfPage?.length
  );

  const previewCanvasActiveCell = useMemo<TabularCellRef | null>(() => {
    if (!canTrackPreviewOnCanvas || !previewActiveCell) {
      return null;
    }

    return {
      row: previewActiveCell.row + previewRowOffset,
      col: previewActiveCell.col,
    };
  }, [canTrackPreviewOnCanvas, previewActiveCell, previewRowOffset]);

  const copyShareLink = async () => {
    if (!shareUrl) {
      return;
    }

    if (typeof navigator === 'undefined' || !navigator.clipboard?.writeText) {
      setShareCopied('error');
      return;
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setShareCopied('copied');
    } catch {
      setShareCopied('error');
    }
  };

  const nudgePreviewNet = (x: number, y: number) => {
    setNetConfig(prev => {
      const nextLeft = clampToRange(prev.left + x, 0, 100 - prev.width);
      const nextTop = clampToRange(prev.top + y, 0, 100 - prev.height);
      return {
        ...prev,
        left: nextLeft,
        top: nextTop,
      };
    });
  };

  const addPreviewRow = () => {
    setPreviewAdditionalRows(prev => prev + 1);
  };

  const moveNextFromModel = () => {
    if (!isModelValid || !modelSaved) {
      return;
    }
    if (requiresNetStep) {
      setStep(STEP_NET);
    } else {
      setStep(STEP_PREVIEW);
    }
  };

  useEffect(() => {
    if (isProjectCompleted) {
      setStep(STEP_COMPLETE);
    }
  }, [isProjectCompleted]);

  const steps = useMemo(
    () => [
      { id: STEP_DETAILS, label: t('Project details') },
      { id: STEP_SETTINGS, label: t('Additional settings') },
      { id: STEP_MODEL, label: t('Define tabular model') },
      { id: STEP_NET, label: t('Cast a net'), disabled: !requiresNetStep },
      { id: STEP_PREVIEW, label: t('Preview') },
      { id: STEP_COMPLETE, label: t('Complete') },
    ],
    [t, requiresNetStep]
  );

  const goToStep = (id: number, disabled?: boolean) => {
    if (disabled) return;
    if (isProjectCompleted && id !== STEP_COMPLETE) return;
    if (id <= step) {
      setStep(id);
    }
  };

  const onAddCanvas = useCallback(
    (result: IiifSelectionPayload | IiifSelectionPayload[]) => {
      const first = Array.isArray(result) ? result[0] : result;
      const resource = toSelectionResource(first?.resource || first);
      const parent = toSelectionResource(first?.parent || null);
      const resourceId = toStringValue(resource.id);
      const resourceType = toTypeValue(resource.type);
      const parentId = toStringValue(parent.id);
      const parentType = toTypeValue(parent.type);
      const isCanvasSelection = !resourceType || resourceType === 'canvas';

      if (!resourceId || !isCanvasSelection) {
        setIiifError(t('Select a canvas from the IIIF browser.'));
        return;
      }

      const manifestFromParent = looksLikeManifestReference(parentId, parentType) ? parentId : undefined;
      const manifestFromPartOf = toArray(resource.partOf)
        .map(part => toSelectionResource(part))
        .map(part => ({ id: toStringValue(part.id), type: toTypeValue(part.type) }))
        .find(part => looksLikeManifestReference(part.id, part.type))?.id;

      const { manifestId: resolvedManifestId, canvasId: resolvedCanvasId } = resolveIiifSelectionIds({
        manifestId: manifestFromParent || manifestFromPartOf,
        canvasId: resourceId,
        siteSlug: site?.slug,
      });

      if (!resolvedManifestId || !resolvedCanvasId) {
        setIiifError(t('Select a canvas from within a manifest.'));
        return;
      }

      setCanvasId(resolvedCanvasId);
      setManifestId(resolvedManifestId);
      setIiifError(null);
      setIiifBrowserSelection(resolvedCanvasId);
    },
    [site?.slug, t]
  );

  const searchMadocResources = useCallback(() => {
    setIiifBrowserModalError(null);
    setIiifStartupUrl(null);
    setIiifMadocSearchQuery(iiifMadocSearchInput.trim());
  }, [iiifMadocSearchInput]);

  const clearMadocSearch = useCallback(() => {
    setIiifBrowserModalError(null);
    setIiifStartupUrl(null);
    setIiifMadocSearchInput('');
    setIiifMadocSearchQuery('');
  }, []);

  const openIiifUrl = useCallback(() => {
    const normalizedUrl = normalizeIiifInputUrl(iiifPasteUrl);
    if (!normalizedUrl) {
      setIiifBrowserModalError(t('Paste a valid IIIF URL to open.'));
      return;
    }

    setIiifBrowserModalError(null);
    setIiifStartupUrl(normalizedUrl);
    setIiifBrowserVersion(version => version + 1);
  }, [iiifPasteUrl, t]);

  const iiifHomeHistoryItem = useMemo(() => {
    if (!iiifHomeCollection) {
      return null;
    }
    return createIiifHomeHistoryItem(iiifHomeCollection);
  }, [iiifHomeCollection]);

  const navigationOptions: IIIFBrowserProps['navigation'] = useMemo(() => {
    return {
      clickToSelect: true,
      doubleClickToNavigate: true,
      clickToNavigate: false,
      markedResources: [],
      canSelectOnlyAllowedDomains: false,
      multiSelect: false,
      allowNavigationToBuiltInPages: false,
      canNavigateToCanvas: true,
      canNavigateToManifest: true,
      canNavigateToCollection: true,
      canSelectCollection: false,
      canSelectManifest: false,
      canSelectCanvas: true,
    } satisfies IIIFBrowserProps['navigation'];
  }, []);

  const historyOptions: IIIFBrowserProps['history'] = useMemo(() => {
    const initialHistory: IiifHistoryItem[] = [];
    const normalizedStartupUrl = iiifStartupUrl ? normalizeIiifInputUrl(iiifStartupUrl) : undefined;

    if (normalizedStartupUrl) {
      initialHistory.push({
        url: normalizedStartupUrl,
        route: loadingRouteForId(normalizedStartupUrl),
        resource: null,
        timestamp: new Date().toISOString(),
      });
    }

    if (iiifHomeHistoryItem) {
      initialHistory.push(iiifHomeHistoryItem);
    }

    if (!initialHistory.length) {
      initialHistory.push({
        url: 'iiif://home',
        route: '/',
        resource: null,
        timestamp: new Date().toISOString(),
      });
    }

    return {
      saveToLocalStorage: false,
      restoreFromLocalStorage: false,
      localStorageKey: IIIF_HOME_LOCAL_STORAGE_KEY,
      initialHistory,
      initialHistoryCursor: 0,
      seedCollections: iiifHomeCollection ? [iiifHomeCollection] : [],
      preprocessManifest: async manifest => {
        const normalized = normalizeLegacyIiifKeys(manifest);
        return normalized.value;
      },
    };
  }, [iiifHomeCollection, iiifHomeHistoryItem, iiifStartupUrl]);

  const uiOptions: IIIFBrowserProps['ui'] = useMemo(
    () => ({
      defaultPages: {
        about: false,
        bookmarks: false,
        history: false,
        viewSource: false,
        homepage: false,
      },
      homeLink: iiifHomeCollection?.id || 'iiif://home',
    }),
    [iiifHomeCollection?.id]
  );
  const outputOptions: IIIFBrowserProps['output'] = useMemo<IIIFBrowserProps['output']>(
    () => [
      {
        type: 'callback',
        cb: onAddCanvas,
        format: {
          type: 'custom',
          format(resource, parent, vault) {
            const fromVault = (value: unknown) => {
              try {
                return vault.get(value as Parameters<typeof vault.get>[0]);
              } catch {
                return null;
              }
            };

            return {
              resource: fromVault(resource) || resource,
              parent: fromVault(parent) || parent,
            };
          },
        },
        label: t('Use selected canvas'),
        supportedTypes: ['Canvas'],
      },
    ],
    [onAddCanvas, t]
  );

  const iiifHomeStats = useMemo(() => {
    const items = (iiifHomeCollection?.items || []) as Array<{ type?: string }>;
    const collections = items.filter(item => item?.type === 'Collection').length;
    const manifests = items.filter(item => item?.type === 'Manifest').length;

    return {
      collections,
      manifests,
    };
  }, [iiifHomeCollection]);

  const iiifBrowser = (
    <div className="tabular-iiif-browser-modal" style={{ minHeight: 420 }}>
      <style>
        {`
          .tabular-iiif-browser-external .grid-lg,
          .tabular-iiif-browser-external .grid-md,
          .tabular-iiif-browser-external .grid-sm {
            display: grid;
            gap: 12px;
          }

          .tabular-iiif-browser-external button,
          .tabular-iiif-browser-external [role="button"],
          .tabular-iiif-browser-external a {
            color: #1f2d5a;
          }

          .tabular-iiif-browser-external button:disabled,
          .tabular-iiif-browser-external [role="button"][aria-disabled="true"] {
            color: #64748b;
          }
        `}
      </style>
      <div
        style={{
          display: 'grid',
          gap: 10,
          marginBottom: 12,
          padding: 10,
          border: '1px solid #d7dbe8',
          borderRadius: 4,
          background: '#f8fafc',
        }}
      >
        <div style={{ display: 'grid', gap: 8 }}>
          <div style={{ fontSize: 12, fontWeight: 600 }}>{t('Search Madoc manifests and collections')}</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 8 }}>
            <Input
              type="text"
              value={iiifMadocSearchInput}
              onChange={event => setIiifMadocSearchInput(event.currentTarget.value)}
              placeholder={t('Search by title')}
            />
            <Button type="button" onClick={searchMadocResources} disabled={isLoadingIiifHome}>
              {isLoadingIiifHome ? t('Loading...') : t('Search')}
            </Button>
            <TinyButton type="button" onClick={clearMadocSearch} disabled={isLoadingIiifHome}>
              {t('Clear')}
            </TinyButton>
          </div>
          <div style={{ fontSize: 12, opacity: 0.8 }}>
            {isLoadingIiifHome
              ? t('Loading Madoc resources...')
              : t('Showing {{collections}} collections and {{manifests}} manifests', {
                  collections: iiifHomeStats.collections,
                  manifests: iiifHomeStats.manifests,
                })}
          </div>
        </div>

        <div style={{ borderTop: '1px solid #d7dbe8', paddingTop: 10, display: 'grid', gap: 8 }}>
          <div style={{ fontSize: 12, fontWeight: 600 }}>{t('Open a IIIF URL directly')}</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 8 }}>
            <Input
              type="text"
              value={iiifPasteUrl}
              onChange={event => setIiifPasteUrl(event.currentTarget.value)}
              placeholder={t('Paste manifest, collection, or canvas URL')}
            />
            <Button type="button" onClick={openIiifUrl}>
              {t('Open URL')}
            </Button>
          </div>
        </div>
      </div>

      {iiifHomeLoadError ? <ErrorMessage>{iiifHomeLoadError}</ErrorMessage> : null}
      {iiifBrowserModalError ? <ErrorMessage>{iiifBrowserModalError}</ErrorMessage> : null}

      <div className="tabular-iiif-browser-external">
        <BrowserComponent fallback={<div>{t('Loading IIIF browser...')}</div>}>
          <IsolatedIIIFBrowser
            key={`tabular-iiif-browser-${iiifBrowserVersion}`}
            className="h-[56vh] min-h-[420px] w-full min-w-0 flex-2 border-none"
            navigation={navigationOptions}
            history={historyOptions}
            output={outputOptions}
            ui={uiOptions}
          />
        </BrowserComponent>
      </div>
    </div>
  );

  return (
    <>
      <AdminHeader
        breadcrumbs={[
          { label: t('Site admin'), link: '/' },
          { label: t('Projects'), link: '/projects' },
          { label: t('Create project'), link: '/projects/create' },
          { label: t('Tabular project'), link: '/projects/create/tabular-project', active: true },
        ]}
        title={t('Create tabular project')}
        subtitle={t('Build a tabular model project')}
        noMargin
      />

      <div
        style={{
          background: '#273668',
          color: '#fff',
          padding: '18px 32px 14px',
          marginBottom: 24,
          borderTop: '1px solid rgba(255,255,255,0.08)',
          borderBottom: '1px solid rgba(0,0,0,0.25)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, overflowX: 'auto' }}>
          {steps.map((item, index) => {
            const isDone = step > item.id || (item.id === STEP_COMPLETE && isProjectCompleted);
            const isActive = step === item.id || (item.id === STEP_COMPLETE && isProjectCompleted);
            const isLockedByCompletion = isProjectCompleted && item.id !== STEP_COMPLETE;
            const isDisabled = !!item.disabled || isLockedByCompletion;
            const circleStyle: React.CSSProperties = {
              height: 24,
              width: 24,
              borderRadius: '50%',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: isDone ? '#8DA0FF' : isActive ? '#ffffff' : '#cdd4ea',
              color: isDone ? '#fff' : isActive ? '#273668' : '#273668',
              border: isActive && !isDone ? '2px solid #8DA0FF' : '2px solid transparent',
              fontSize: 12,
              fontWeight: 600,
              flex: '0 0 auto',
              opacity: isDisabled ? 0.5 : 1,
            };
            const lineStyle: React.CSSProperties = {
              height: 2,
              width: 44,
              background: isDone ? '#8DA0FF' : '#4a5b9e',
              opacity: isDisabled ? 0.4 : 1,
              flex: '0 0 auto',
            };
            return (
              <React.Fragment key={item.id}>
                <button
                  type="button"
                  onClick={() => goToStep(item.id, isDisabled)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    background: 'transparent',
                    border: 'none',
                    color: 'inherit',
                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                    padding: 0,
                    textAlign: 'left',
                  }}
                >
                  <span style={circleStyle}>{isDone ? '✓' : ''}</span>
                  <span style={{ display: 'grid', gap: 2 }}>
                    <span style={{ fontSize: 16, fontWeight: isActive ? 600 : 500 }}>{item.label}</span>
                    {isDone && !isDisabled && item.id !== STEP_COMPLETE ? (
                      <span style={{ fontSize: 12, textDecoration: 'underline', opacity: 0.9 }}>
                        {t('Click to edit')}
                      </span>
                    ) : null}
                  </span>
                </button>
                {index < steps.length - 1 ? <span style={lineStyle} /> : null}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      <WidePage>
        {step === STEP_DETAILS ? (
          <>
            <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 12 }}>{t('Project details')}</div>
            <InputContainer wide>
              <InputLabel htmlFor="label">{t('Label')}</InputLabel>
              <MetadataEditor
                fluid
                id={'label'}
                fields={label}
                onSave={output => setLabel(output.toInternationalString())}
                availableLanguages={availableLanguages}
                metadataKey={'label'}
              />
            </InputContainer>

            <InputContainer wide>
              <InputLabel htmlFor="summary">{t('Description')}</InputLabel>
              <MetadataEditor
                fluid
                id={'summary'}
                fields={summary}
                onSave={output => setSummary(output.toInternationalString())}
                availableLanguages={availableLanguages}
                metadataKey={'summary'}
                defaultLocale={defaultLocale}
              />
            </InputContainer>

            <InputContainer wide>
              <InputLabel htmlFor="slug">{t('Slug')}</InputLabel>
              <Input
                type="text"
                value={slug}
                onFocus={() => setAutoSlug(false)}
                onChange={e => setSlug(e.currentTarget.value)}
                id={'slug'}
              />
            </InputContainer>

            <ButtonRow>
              <Button
                $primary
                disabled={!detailsDone}
                onClick={() => {
                  reset();
                  setStep(STEP_SETTINGS);
                }}
              >
                {t('Save')}
              </Button>
            </ButtonRow>
          </>
        ) : null}

        {step === STEP_SETTINGS ? (
          <>
            <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 20 }}>{t('Additional settings')}</div>
            <div style={{ marginBottom: 20 }}>
              <div>{t('Select to enable the zoom tracking option for your tabular model')}</div>
              <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 10, maxWidth: 600 }}>
                {t(
                  'Zoom tracking enables the application to support contributor users as they  navigate through the tabular data structure. The zoom tracking will  attempt to move the image focus to reflect the user’s current location  in the table structure. To provide this option to the user, casting a  grid on a reference image is necessary..'
                )}
              </div>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input
                  style={{ margin: 0 }}
                  type="checkbox"
                  checked={enableZoomTracking}
                  onChange={e => setEnableZoomTracking(e.currentTarget.checked)}
                />
                <span style={{ fontSize: 13 }}>{t('Use zoom tracking')}</span>
              </label>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>{t('Reference image (optional)')}</div>
              <div style={{ fontSize: 12, opacity: 0.75 }}>
                {t(
                  'Select an image to guide configuration. This is required when zoom tracking is on; optional when zoom tracking is off.'
                )}
              </div>

              {hasImage ? (
                <SuccessMessage>
                  <div style={{ display: 'flex', flexDirection: 'column', rowGap: 4 }}>
                    <div>
                      {t('Selected manifest')}: <strong>{manifestId}</strong>
                    </div>
                    <div>
                      {t('Selected canvas')}: <strong>{canvasId}</strong>
                    </div>
                    <TinyButton onClick={clearImageSelection}>{t('Clear selection')}</TinyButton>
                  </div>
                </SuccessMessage>
              ) : null}

              {!hasImage && iiifBrowserSelection ? (
                <div style={{ fontSize: 12, opacity: 0.75 }}>{iiifBrowserSelection}</div>
              ) : null}

              {iiifError ? <ErrorMessage>{iiifError}</ErrorMessage> : null}

              {enableZoomTracking && !hasImage ? (
                <div style={{ fontSize: 12, opacity: 0.75 }}>
                  {t('Select a reference canvas to enable zoom tracking and Cast a net.')}
                </div>
              ) : null}

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ModalButton title={t('Browse IIIF resources')} modalSize="lg" render={() => iiifBrowser}>
                  <Button>{t('Browse manifests')}</Button>
                </ModalButton>
                {hasImage ? <span style={{ fontSize: 12, opacity: 0.75 }}>{t('Canvas selected')}</span> : null}
              </div>
            </div>

            <ButtonRow>
              <Button
                $primary
                disabled={enableZoomTracking && !hasImage}
                onClick={() => {
                  reset();
                  setStep(STEP_MODEL);
                }}
              >
                {t('Save')}
              </Button>
            </ButtonRow>
          </>
        ) : null}

        {step === STEP_MODEL ? (
          <div style={{ paddingBottom: 16 }}>
            <BrowserComponent fallback={<div>{t('Loading...')}</div>}>
              <DefineTabularModelLazy
                value={tabularModel}
                onChange={setTabularModel}
                onModelChange={res => {
                  setTabularPayload(res.payload);
                  setIsModelValid(res.isValid);
                }}
                manifestId={manifestId}
                canvasId={canvasId}
              />
            </BrowserComponent>

            {!modelSaved ? (
              <div style={{ marginTop: 12, fontSize: 12, opacity: 0.7 }}>{t('Save the model to continue.')}</div>
            ) : null}

            <ButtonRow style={{ marginTop: 16 }}>
              <Button $primary disabled={!isModelValid || !modelSaved} onClick={moveNextFromModel}>
                {t('Save')}
              </Button>
            </ButtonRow>
          </div>
        ) : null}

        {step === STEP_NET ? (
          <>
            <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 12 }}>{t('Cast a net')}</div>
            {requiresNetStep ? (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '280px minmax(0, 1fr)',
                  gap: 16,
                  alignItems: 'stretch',
                  paddingBottom: 16,
                }}
              >
                <div style={{ border: '1px solid #d6d6d6', borderRadius: 4, background: '#f4f4f4', padding: 12 }}>
                  <div
                    style={{
                      padding: 12,
                      background: '#dfe5ff',
                      borderRadius: 4,
                      color: '#1f2d5a',
                      fontSize: 14,
                      lineHeight: 1.35,
                      marginBottom: 14,
                    }}
                  >
                    {t(
                      'Adjust the grid so it matches the table in the example image. Align the pink band with the headings defined earlier.'
                    )}
                    <br />
                    <br />
                    {t('Use the non-editable table below as reference for your row and column layout.')}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-start' }}>
                    <ModalButton title={t('Browse IIIF resources')} modalSize="lg" render={() => iiifBrowser}>
                      <TinyButton>{t('Select a different image')}</TinyButton>
                    </ModalButton>
                    <TinyButton onClick={clearImageSelection}>{t('Remove selected image')}</TinyButton>
                    <Button
                      $primary
                      onClick={() => {
                        reset();
                        setStep(STEP_PREVIEW);
                      }}
                    >
                      {t('Save')}
                    </Button>
                  </div>
                </div>

                <div style={{ display: 'grid', gap: 12 }}>
                  <BrowserComponent fallback={<div>{t('Loading...')}</div>}>
                    <CastANetLazy
                      manifestId={manifestId}
                      canvasId={canvasId}
                      value={netConfig}
                      onChange={setNetConfig}
                      height={castANetHeight}
                    />
                  </BrowserComponent>

                  <div style={{ display: 'flex', justifyContent: 'center', marginTop: -4 }}>
                    <div
                      role="separator"
                      aria-orientation="horizontal"
                      aria-label={t('Resize cast-a-net and table')}
                      onMouseDown={startCastANetResize}
                      onMouseEnter={() => setIsCastANetDividerHover(true)}
                      onMouseLeave={() => setIsCastANetDividerHover(false)}
                      style={{
                        height: 18,
                        minWidth: 28,
                        border: '1px solid #c8c8c8',
                        borderRadius: 4,
                        background: isCastANetDividerHover ? '#e5e7eb' : '#fff',
                        fontWeight: 700,
                        lineHeight: '14px',
                        textAlign: 'center',
                        cursor: 'row-resize',
                        userSelect: 'none',
                      }}
                    >
                      =
                    </div>
                  </div>

                  <div style={{ border: '1px solid #d6d6d6', background: '#fff', overflow: 'auto' }}>
                    <TabularHeadingsTable
                      columns={netColumnCount}
                      visibleRows={CAST_A_NET_ROWS}
                      headings={Array.from({ length: netColumnCount }, (_, i) => tabularModel.headings?.[i] ?? '')}
                      tooltips={Array.from({ length: netColumnCount }, (_, i) => tabularModel.helpText?.[i] ?? '')}
                      onChangeHeadings={() => {
                        // Intentionally read-only in Cast a net step.
                      }}
                      activeColumn={-1}
                      issues={[]}
                      disabled
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ padding: 12, fontSize: 13 }}>{t('Select a reference canvas to use Cast a net.')}</div>
            )}
          </>
        ) : null}

        {step === STEP_PREVIEW ? (
          <>
            <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 12 }}>{t('Preview')}</div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '280px minmax(0, 1fr)',
                gap: 16,
                alignItems: 'stretch',
                paddingBottom: 16,
              }}
            >
              <div style={{ border: '1px solid #d6d6d6', borderRadius: 4, background: '#f4f4f4', padding: 12 }}>
                <div
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}
                >
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{t('Share project outline')}</div>
                  {shareUrl ? (
                    <button
                      type="button"
                      onClick={copyShareLink}
                      title={t('Copy share link')}
                      style={{
                        height: 30,
                        width: 30,
                        border: '1px solid #d4d6df',
                        borderRadius: 4,
                        background: '#fff',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#283452',
                        cursor: 'pointer',
                      }}
                    >
                      <LinkIcon style={{ fontSize: 18 }} />
                    </button>
                  ) : null}
                </div>
                {shareUrl ? (
                  <div style={{ marginBottom: 12 }}>
                    <input
                      type="text"
                      value={shareUrl}
                      readOnly
                      onFocus={event => event.currentTarget.select()}
                      style={{
                        width: '100%',
                        border: '1px solid #cfd6e5',
                        borderRadius: 4,
                        fontSize: 12,
                        padding: '8px 10px',
                        color: '#1f2d5a',
                        background: '#fff',
                      }}
                    />
                    <div style={{ marginTop: 6, fontSize: 12 }}>
                      <a href={shareUrl} target="_blank" rel="noreferrer">
                        {t('Open shared outline')}
                      </a>
                    </div>
                    {shareCopied === 'copied' ? (
                      <div style={{ marginTop: 6, fontSize: 12, color: '#166534' }}>{t('Share link copied.')}</div>
                    ) : null}
                    {shareCopied === 'error' ? (
                      <div style={{ marginTop: 6, fontSize: 12, color: '#b91c1c' }}>
                        {t('Copy failed. Please copy the link manually.')}
                      </div>
                    ) : null}
                  </div>
                ) : null}

                <div
                  style={{
                    padding: 12,
                    background: '#dfe5ff',
                    borderRadius: 4,
                    color: '#1f2d5a',
                    fontSize: 14,
                    lineHeight: 1.35,
                    marginBottom: 12,
                  }}
                >
                  {t(
                    'Review all project details, capture model data, and cast-a-net contract before creating the project.'
                  )}
                </div>

                {canTrackPreviewOnCanvas ? (
                  <div style={{ marginTop: 14, paddingTop: 10, borderTop: '1px solid #d6d6d6' }}>
                    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>{t('Nudge zoom tracking')}</div>
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: `${NUDGE_BUTTON_SIZE}px ${NUDGE_BUTTON_SIZE}px ${NUDGE_BUTTON_SIZE}px`,
                        gridTemplateRows: `${NUDGE_BUTTON_SIZE}px ${NUDGE_BUTTON_SIZE}px ${NUDGE_BUTTON_SIZE}px`,
                        gap: 10,
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => nudgePreviewNet(0, -PREVIEW_NUDGE_STEP)}
                        style={{ ...nudgeButtonStyle, gridColumn: 2, gridRow: 1 }}
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => nudgePreviewNet(-PREVIEW_NUDGE_STEP, 0)}
                        style={{ ...nudgeButtonStyle, gridColumn: 1, gridRow: 2 }}
                      >
                        ←
                      </button>
                      <button
                        type="button"
                        onClick={() => nudgePreviewNet(PREVIEW_NUDGE_STEP, 0)}
                        style={{ ...nudgeButtonStyle, gridColumn: 3, gridRow: 2 }}
                      >
                        →
                      </button>
                      <button
                        type="button"
                        onClick={() => nudgePreviewNet(0, PREVIEW_NUDGE_STEP)}
                        style={{ ...nudgeButtonStyle, gridColumn: 2, gridRow: 3 }}
                      >
                        ↓
                      </button>
                    </div>
                    <div style={{ marginTop: 6, fontSize: 11, opacity: 0.8 }}>
                      {t('Nudge updates are saved with this project setup.')}
                    </div>
                  </div>
                ) : null}
              </div>

              <div
                style={{
                  display: 'grid',
                  gap: PREVIEW_SPLIT_GAP,
                  height: PREVIEW_SPLIT_TOTAL_HEIGHT,
                  overflow: 'hidden',
                }}
              >
                {hasImage ? (
                  <BrowserComponent fallback={<div>{t('Loading...')}</div>}>
                    <CastANetLazy
                      manifestId={manifestId!}
                      canvasId={canvasId}
                      value={netConfig}
                      onChange={setNetConfig}
                      height={previewCanvasHeight}
                      activeCell={previewCanvasActiveCell}
                      previewOverlayOnly
                    />
                  </BrowserComponent>
                ) : (
                  <div
                    style={{
                      border: '1px solid #d6d6d6',
                      borderRadius: 4,
                      height: '100%',
                      display: 'grid',
                      placeItems: 'center',
                      fontSize: 13,
                      opacity: 0.75,
                    }}
                  >
                    <div style={{ display: 'grid', gap: 10, textAlign: 'center', justifyItems: 'center' }}>
                      <div>{t('Select a reference image to preview zoom tracking.')}</div>
                      {!enableZoomTracking ? (
                        <ModalButton title={t('Browse IIIF resources')} modalSize="lg" render={() => iiifBrowser}>
                          <Button>{t('Browse manifests')}</Button>
                        </ModalButton>
                      ) : null}
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'center', marginTop: -4 }}>
                  <div
                    role="separator"
                    aria-orientation="horizontal"
                    aria-label={t('Resize preview canvas and table')}
                    onMouseDown={startPreviewResize}
                    onMouseEnter={() => setIsCastANetDividerHover(true)}
                    onMouseLeave={() => setIsCastANetDividerHover(false)}
                    style={{
                      height: PREVIEW_SPLIT_DIVIDER_HEIGHT,
                      minWidth: 28,
                      border: '1px solid #c8c8c8',
                      borderRadius: 4,
                      background: isCastANetDividerHover ? '#e5e7eb' : '#fff',
                      fontWeight: 700,
                      lineHeight: '14px',
                      textAlign: 'center',
                      cursor: 'row-resize',
                      userSelect: 'none',
                    }}
                  >
                    =
                  </div>
                </div>

                <TabularPreviewTable
                  headings={previewColumns}
                  tooltips={previewTooltips}
                  rows={previewTableRowCount}
                  values={previewRows}
                  onChange={setPreviewRows}
                  activeCell={previewActiveCell}
                  onActiveCellChange={setPreviewActiveCell}
                  onAddRow={addPreviewRow}
                  addRowLabel={t('+ Add row')}
                  containerHeight={previewTableHeight}
                  containerWidth="100%"
                />
              </div>
            </div>
            <ButtonRow>
              <Button $primary disabled={!createProjectPayload} onClick={() => setStep(STEP_COMPLETE)}>
                {t('Save')}
              </Button>
            </ButtonRow>
          </>
        ) : null}

        {step === STEP_COMPLETE || isProjectCompleted ? (
          <>
            <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>{t('Complete')}</div>
            {isProjectCompleted ? (
              <>
                <SuccessMessage $banner>{t('Project completed.')}</SuccessMessage>
                {createdProjectPath ? (
                  <ButtonRow>
                    <Button $primary as="a" href={createdProjectPath}>
                      {t('Go to project')}
                    </Button>
                  </ButtonRow>
                ) : null}
              </>
            ) : (
              <>
                <div
                  style={{
                    border: '1px solid #d6d6d6',
                    borderRadius: 4,
                    background: '#f9fafc',
                    padding: 12,
                    marginBottom: 12,
                    fontSize: 13,
                    display: 'grid',
                    gap: 6,
                  }}
                >
                  <div>
                    <strong>{t('Label')}:</strong> {primaryLabel}
                  </div>
                  <div>
                    <strong>{t('Description')}:</strong> {primarySummary}
                  </div>
                  <div>
                    <strong>{t('Slug')}:</strong> {slug}
                  </div>
                  <div>
                    <strong>{t('Zoom tracking')}:</strong> {enableZoomTracking ? t('Enabled') : t('Disabled')}
                  </div>
                  <div>
                    <strong>{t('Reference image')}:</strong> {hasImage ? t('Selected') : t('Not selected')}
                  </div>
                  <div>
                    <strong>{t('Columns')}:</strong> {configuredColumnCount}
                  </div>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                    gap: 12,
                    marginBottom: 16,
                  }}
                >
                  <PayloadCard title={t('Project details payload')} value={projectDetailsForConfirmation} />
                  <PayloadCard title={t('Capture model payload')} value={setupPayload?.model ?? tabularPayload} />
                  <PayloadCard title={t('Cast a net payload')} value={setupPayload?.structure} />
                  <PayloadCard title={t('Create project request payload')} value={createProjectPayload} />
                </div>

                {isError ? <ErrorMessage $banner>{data.error || 'Unknown error'}</ErrorMessage> : null}

                <ButtonRow>
                  <Button
                    $primary
                    disabled={status === 'loading' || isProjectCompleted || !createProjectPayload}
                    onClick={() => {
                      if (createProjectPayload) {
                        saveProject(createProjectPayload);
                      }
                    }}
                  >
                    {t('Complete')}
                  </Button>
                </ButtonRow>
              </>
            )}
          </>
        ) : null}
      </WidePage>
    </>
  );
};
