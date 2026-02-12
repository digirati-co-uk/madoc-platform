import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import slugify from 'slugify';
import { useMutation } from 'react-query';
import { useTranslation } from 'react-i18next';
import { InternationalString } from '@iiif/presentation-3';
import { CreateProject } from '../../../../../types/schemas/create-project';
import { useApi } from '../../../../shared/hooks/use-api';
import { useDefaultLocale, useSite, useSupportedLocales } from '../../../../shared/hooks/use-site';
import { WidePage } from '../../../../shared/layout/WidePage';
import { AdminHeader } from '../../../molecules/AdminHeader';
import { Input, InputContainer, InputLabel } from '../../../../shared/form/Input';
import { Button, ButtonRow, TinyButton } from '../../../../shared/navigation/Button';
import { ErrorMessage } from '../../../../shared/callouts/ErrorMessage';
import { MetadataEditor } from '../../../molecules/MetadataEditor';
import { ContentExplorer } from '../../../../shared/features/ContentExplorer';
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
type IiifPickerMode = 'external' | 'madoc';
const CAST_A_NET_ROWS = 5;
const SHARE_COPY_TIMEOUT = 1800;
const PREVIEW_NUDGE_STEP = 0.25;
const NUDGE_BUTTON_SIZE = 54;
const PREVIEW_CANVAS_HEIGHT = 420;
const PREVIEW_TABLE_HEIGHT = 340;
const PREVIEW_SPLIT_TOTAL_HEIGHT = 760;
const PREVIEW_SPLIT_GAP = 12;
const PREVIEW_SPLIT_DIVIDER_HEIGHT = 18;
const PREVIEW_CANVAS_MIN_HEIGHT = 280;
const PREVIEW_TABLE_MIN_HEIGHT = 180;
const PREVIEW_CANVAS_MAX_HEIGHT =
  PREVIEW_SPLIT_TOTAL_HEIGHT - PREVIEW_SPLIT_DIVIDER_HEIGHT - PREVIEW_TABLE_MIN_HEIGHT - PREVIEW_SPLIT_GAP * 2;

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

const clampToRange = (value: number, min: number, max: number) => {
  return Math.max(min, Math.min(max, value));
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
  const [iiifPickerMode, setIiifPickerMode] = useState<IiifPickerMode>('external');
  const [isResolvingMadocSelection, setIsResolvingMadocSelection] = useState(false);

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
    } catch (e) {
      return { error: (e as any).message };
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
        : Array.from(
            { length: Math.max(1, tabularModel.columns || 1) },
            (_, index) => tabularModel.headings?.[index] ?? ''
          ),
    [tabularPayload, tabularModel.columns, tabularModel.headings]
  );
  const previewTooltips = useMemo(
    () =>
      tabularPayload?.columns?.length
        ? tabularPayload.columns.map(column => column.helpText || '')
        : Array.from(
            { length: Math.max(1, tabularModel.columns || 1) },
            (_, index) => tabularModel.helpText?.[index] ?? ''
          ),
    [tabularPayload, tabularModel.columns, tabularModel.helpText]
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
    setIsResolvingMadocSelection(false);
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
    (result: any) => {
      const first = Array.isArray(result) ? result[0] : result;
      const resource = first?.resource || first;
      const parent = first?.parent || null;

      if (!resource?.id || resource?.type !== 'Canvas') {
        setIiifError(t('Select a canvas from the IIIF browser.'));
        return;
      }

      if (!parent?.id || parent?.type !== 'Manifest') {
        setIiifError(t('Select a canvas from within a manifest.'));
        return;
      }

      setCanvasId(resource.id);
      setManifestId(parent.id);
      setIiifError(null);
      setIiifBrowserSelection(`${resource.id}`);
    },
    [t]
  );

  const onAddMadocCanvas = useCallback(
    async (selectedCanvasId: number) => {
      if (!site?.slug) {
        setIiifError(t('Unable to resolve current site for Madoc browsing.'));
        return;
      }

      setIsResolvingMadocSelection(true);
      setIiifError(null);

      try {
        const { manifests } = await api.getCanvasManifests(selectedCanvasId);
        const selectedManifestId = manifests?.[0];

        if (!selectedManifestId) {
          setIiifError(t('This canvas is not linked to a manifest.'));
          return;
        }

        const origin = typeof window === 'undefined' ? '' : window.location.origin;
        const selectedManifestUrl = `${origin}/s/${site.slug}/madoc/api/manifests/${selectedManifestId}/export/3.0`;
        const selectedCanvasUrl = `${selectedManifestUrl}/c${selectedCanvasId}`;

        setManifestId(selectedManifestUrl);
        setCanvasId(selectedCanvasUrl);
        setIiifError(null);
        setIiifBrowserSelection(selectedCanvasUrl);
      } catch (error) {
        setIiifError((error as any)?.message || t('Unable to load canvas from Madoc.'));
      } finally {
        setIsResolvingMadocSelection(false);
      }
    },
    [api, site?.slug, t]
  );

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
    return {
      saveToLocalStorage: true,
      restoreFromLocalStorage: true,
      localStorageKey: 'iiif-browser-generic',
    };
  }, []);

  const uiOptions: IIIFBrowserProps['ui'] = useMemo(
    () => ({
      defaultPages: {
        about: false,
        bookmarks: false,
        history: false,
        viewSource: false,
        homepage: false,
      },
    }),
    []
  );
  const outputOptions: IIIFBrowserProps['output'] = useMemo<IIIFBrowserProps['output']>(
    () => [
      {
        type: 'callback',
        cb: onAddCanvas,
        format: {
          type: 'custom',
          format(resource, parent, vault) {
            return {
              resource: vault.get(resource),
              parent,
            };
          },
        },
        label: t('Use selected canvas'),
        supportedTypes: ['Canvas'],
      },
    ],
    [onAddCanvas, t]
  );

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
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <Button type="button" $primary={iiifPickerMode === 'external'} onClick={() => setIiifPickerMode('external')}>
          {t('Paste IIIF URL')}
        </Button>
        <Button type="button" $primary={iiifPickerMode === 'madoc'} onClick={() => setIiifPickerMode('madoc')}>
          {t('Browse Madoc content')}
        </Button>
      </div>

      {iiifPickerMode === 'external' ? (
        <div className="tabular-iiif-browser-external">
          <BrowserComponent fallback={<div>{t('Loading IIIF browser...')}</div>}>
            <IsolatedIIIFBrowser
              className="h-[56vh] min-h-[420px] w-full min-w-0 flex-2 border-none"
              navigation={navigationOptions}
              history={historyOptions}
              output={outputOptions}
              ui={uiOptions}
            />
          </BrowserComponent>
        </div>
      ) : (
        <div style={{ border: '1px solid #d6d6d6', borderRadius: 4, background: '#f5f6fa', padding: 12 }}>
          <ContentExplorer
            renderChoice={(selectedCanvasId, resetCanvas) => (
              <div style={{ display: 'grid', gap: 10 }}>
                <div style={{ fontSize: 12, opacity: 0.75 }}>
                  {t('Canvas')}: {selectedCanvasId}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Button
                    type="button"
                    $primary
                    disabled={isResolvingMadocSelection}
                    onClick={() => {
                      void onAddMadocCanvas(selectedCanvasId);
                    }}
                  >
                    {isResolvingMadocSelection ? t('Loading...') : t('Use selected canvas')}
                  </Button>
                  <TinyButton type="button" onClick={resetCanvas}>
                    {t('Select different image')}
                  </TinyButton>
                </div>
              </div>
            )}
          />
        </div>
      )}
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
                      columns={Math.max(1, netConfig.cols)}
                      visibleRows={CAST_A_NET_ROWS}
                      headings={Array.from(
                        { length: Math.max(1, netConfig.cols) },
                        (_, i) => tabularModel.headings?.[i] ?? ''
                      )}
                      tooltips={Array.from(
                        { length: Math.max(1, netConfig.cols) },
                        (_, i) => tabularModel.helpText?.[i] ?? ''
                      )}
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
                    <strong>{t('Columns')}:</strong>{' '}
                    {Math.max(1, tabularPayload?.columns?.length || tabularModel.columns || 1)}
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
                  <div style={{ border: '1px solid #d6d6d6', borderRadius: 4, background: '#fff', overflow: 'hidden' }}>
                    <div
                      style={{
                        padding: '8px 10px',
                        borderBottom: '1px solid #e5e7eb',
                        background: '#f8fafc',
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                    >
                      {t('Project details payload')}
                    </div>
                    <pre
                      style={{
                        margin: 0,
                        padding: 10,
                        fontSize: 12,
                        lineHeight: 1.45,
                        maxHeight: 320,
                        overflow: 'auto',
                        background: '#fff',
                      }}
                    >
                      {stringifyForDisplay(projectDetailsForConfirmation)}
                    </pre>
                  </div>

                  <div style={{ border: '1px solid #d6d6d6', borderRadius: 4, background: '#fff', overflow: 'hidden' }}>
                    <div
                      style={{
                        padding: '8px 10px',
                        borderBottom: '1px solid #e5e7eb',
                        background: '#f8fafc',
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                    >
                      {t('Capture model payload')}
                    </div>
                    <pre
                      style={{
                        margin: 0,
                        padding: 10,
                        fontSize: 12,
                        lineHeight: 1.45,
                        maxHeight: 320,
                        overflow: 'auto',
                        background: '#fff',
                      }}
                    >
                      {stringifyForDisplay(setupPayload?.model ?? tabularPayload)}
                    </pre>
                  </div>

                  <div style={{ border: '1px solid #d6d6d6', borderRadius: 4, background: '#fff', overflow: 'hidden' }}>
                    <div
                      style={{
                        padding: '8px 10px',
                        borderBottom: '1px solid #e5e7eb',
                        background: '#f8fafc',
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                    >
                      {t('Cast a net payload')}
                    </div>
                    <pre
                      style={{
                        margin: 0,
                        padding: 10,
                        fontSize: 12,
                        lineHeight: 1.45,
                        maxHeight: 320,
                        overflow: 'auto',
                        background: '#fff',
                      }}
                    >
                      {stringifyForDisplay(setupPayload?.structure)}
                    </pre>
                  </div>

                  <div style={{ border: '1px solid #d6d6d6', borderRadius: 4, background: '#fff', overflow: 'hidden' }}>
                    <div
                      style={{
                        padding: '8px 10px',
                        borderBottom: '1px solid #e5e7eb',
                        background: '#f8fafc',
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                    >
                      {t('Create project request payload')}
                    </div>
                    <pre
                      style={{
                        margin: 0,
                        padding: 10,
                        fontSize: 12,
                        lineHeight: 1.45,
                        maxHeight: 320,
                        overflow: 'auto',
                        background: '#fff',
                      }}
                    >
                      {stringifyForDisplay(createProjectPayload)}
                    </pre>
                  </div>
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
