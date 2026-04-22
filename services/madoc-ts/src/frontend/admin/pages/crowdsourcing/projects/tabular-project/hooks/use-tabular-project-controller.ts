import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import slugify from 'slugify';
import { useMutation } from 'react-query';
import type { Collection as IIIFCollection, InternationalString } from '@iiif/presentation-3';
import type { TFunction } from 'i18next';
import type { IIIFBrowserProps } from 'iiif-browser';
import type { ApiClient } from '@/gateway/api';
import type { CreateProject } from '@/types/schemas/create-project';
import { offsetTabularCellRef } from '@/frontend/shared/utility/tabular-cell-ref';
import { addTabularRowOffsetAdjustment } from '@/frontend/shared/utility/tabular-row-offset-adjustments';
import {
  TABULAR_WIZARD_CAST_A_NET_ROWS,
  TABULAR_WIZARD_PREVIEW_SPLIT_DIVIDER_HEIGHT,
  TABULAR_WIZARD_PREVIEW_SPLIT_GAP,
  TABULAR_WIZARD_PREVIEW_SPLIT_TOTAL_HEIGHT,
} from '../constants';
import {
  buildTabularModelPayload,
  stringifyTabularDropdownOptions,
} from '../../../../../components/tabular/cast-a-net/TabularModel';
import { buildTabularProjectSetupPayload } from '../../../../../components/tabular/cast-a-net/CastANetStructure';
import {
  type DefineTabularModelValue,
  type NetConfig,
  type TabularCellRef,
  type TabularModelChange,
  type TabularModelPayload,
} from '../../../../../components/tabular/cast-a-net/types';
import type {
  IiifHistoryItem,
  IiifSelectionPayload,
  MadocCollectionSnippet,
  MadocManifestSnippet,
  TabularOutlineSharePayload,
  TabularWizardStep,
} from '../types';
import {
  clampToRange,
  createIiifHomeHistoryItem,
  createMadocHomeCollection,
  decodeOutlinePayload,
  encodeOutlinePayload,
  getErrorMessage,
  getIiifSelectionLabel,
  getIiifSelectionThumbnail,
  getPreferredIntlValue,
  hasIntlValue,
  looksLikeManifestReference,
  netConfigFromSharedStructure,
  normalizeLegacyIiifKeys,
  resolveIiifSelectionIds,
  tabularModelValueFromSharedPayload,
  toArray,
  toSelectionResource,
  toStringValue,
  toTypeValue,
} from '../utils';
import { useResizableHeight } from './use-resizable-height';
import { useSite } from '@/frontend/shared/hooks/use-site';

const STEP_DETAILS = 0;
const STEP_SETTINGS = 1;
const STEP_MODEL = 2;
const STEP_NET = 3;
const STEP_PREVIEW = 4;
const STEP_COMPLETE = 5;

const PREVIEW_CANVAS_MIN_HEIGHT = 280;
const PREVIEW_TABLE_MIN_HEIGHT = 180;
const PREVIEW_CANVAS_MAX_HEIGHT =
  TABULAR_WIZARD_PREVIEW_SPLIT_TOTAL_HEIGHT -
  TABULAR_WIZARD_PREVIEW_SPLIT_DIVIDER_HEIGHT -
  PREVIEW_TABLE_MIN_HEIGHT -
  TABULAR_WIZARD_PREVIEW_SPLIT_GAP * 2;
const MAX_EXTERNAL_SEARCH_RESULTS = 20;

const buildEvenLinePositions = (count: number): number[] => {
  const safeCount = Math.max(1, Math.floor(count || 1));
  if (safeCount <= 1) {
    return [];
  }

  const step = 100 / safeCount;
  return Array.from({ length: safeCount - 1 }, (_, index) => step * (index + 1));
};

const normalizeSingleValuePerLanguage = (
  input: InternationalString | undefined,
  defaultLocale: string
): InternationalString => {
  if (!input) {
    return { [defaultLocale]: [''] };
  }

  const normalized: InternationalString = {};
  for (const [language, value] of Object.entries(input)) {
    const parts = (Array.isArray(value) ? value : [value])
      .map(part => (typeof part === 'string' ? part.trim() : ''))
      .filter(Boolean);

    if (parts.length) {
      normalized[language] = [parts[0]];
    }
  }

  if (Object.keys(normalized).length) {
    return normalized;
  }

  return { [defaultLocale]: [''] };
};

export const TABULAR_PROJECT_STEP_IDS = {
  details: STEP_DETAILS,
  settings: STEP_SETTINGS,
  model: STEP_MODEL,
  net: STEP_NET,
  preview: STEP_PREVIEW,
  complete: STEP_COMPLETE,
} as const;

interface UseTabularProjectControllerOptions {
  api: ApiClient;
  defaultLocale: string;
  siteSlug?: string;
  t: TFunction;
}

interface ProjectMutationResult {
  id?: string | number;
  slug?: string;
  error?: string;
}

export function useTabularProjectController(options: UseTabularProjectControllerOptions) {
  const { api, defaultLocale, siteSlug, t } = options;
  const closeBrowserRef = useRef<null | (() => void)>(null);

  const [step, setStep] = useState(STEP_DETAILS);
  const [maxReachedStep, setMaxReachedStep] = useState(STEP_DETAILS);
  const [label, setLabelState] = useState<InternationalString>({ [defaultLocale]: [''] });
  const [summary, setSummaryState] = useState<InternationalString>({ [defaultLocale]: [''] });
  const [slug, setSlugState] = useState('');
  const [autoSlug, setAutoSlug] = useState(true);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const [isCheckingDetails, setIsCheckingDetails] = useState(false);

  const [enableZoomTracking, setEnableZoomTracking] = useState(false);
  const [crowdsourcingInstructions, setCrowdsourcingInstructions] = useState('');
  const [manifestId, setManifestId] = useState<string | undefined>();
  const [canvasId, setCanvasId] = useState<string | undefined>();
  const [selectedCanvasLabel, setSelectedCanvasLabel] = useState<string | undefined>();
  const [selectedCanvasThumbnail, setSelectedCanvasThumbnail] = useState<string | undefined>();

  const [iiifError, setIiifError] = useState<string | null>(null);
  const [iiifBrowserSelection, setIiifBrowserSelection] = useState<string | null>(null);
  const [iiifHomeCollection, setIiifHomeCollection] = useState<IIIFCollection | null>(null);
  const [iiifHomeLoadError, setIiifHomeLoadError] = useState<string | null>(null);
  const [iiifBrowserVersion, setIiifBrowserVersion] = useState(0);

  const [tabularModel, setTabularModel] = useState<DefineTabularModelValue>({
    columns: 0,
    previewRows: 0,
    headings: [],
  });
  const [tabularPayload, setTabularPayload] = useState<TabularModelPayload | null>(null);
  const [isModelValid, setIsModelValid] = useState(false);
  const [showModelValidationErrors, setShowModelValidationErrors] = useState(false);

  const [netConfig, setNetConfig] = useState<NetConfig>({
    rows: TABULAR_WIZARD_CAST_A_NET_ROWS,
    cols: 5,
    top: 10,
    left: 10,
    width: 80,
    height: 80,
    rowPositions: [],
    colPositions: [],
    rowOffsetAdjustments: [],
  });

  const setSlug = useCallback((value: string) => {
    setSlugState(value);
    setDetailsError(null);
  }, []);

  const setLabel = useCallback(
    (value: InternationalString) => {
      setLabelState(normalizeSingleValuePerLanguage(value, defaultLocale));
    },
    [defaultLocale]
  );

  const setSummary = useCallback(
    (value: InternationalString) => {
      setSummaryState(normalizeSingleValuePerLanguage(value, defaultLocale));
    },
    [defaultLocale]
  );

  const { height: castANetHeight, startResize: startCastANetResize } = useResizableHeight(520, {
    min: 280,
    max: 760,
  });

  const { height: previewCanvasHeight, startResize: startPreviewResize } = useResizableHeight(
    clampToRange(420, PREVIEW_CANVAS_MIN_HEIGHT, PREVIEW_CANVAS_MAX_HEIGHT),
    {
      min: PREVIEW_CANVAS_MIN_HEIGHT,
      max: PREVIEW_CANVAS_MAX_HEIGHT,
    }
  );

  const [isCastANetDividerHover, setIsCastANetDividerHover] = useState(false);
  const [previewActiveCell, setPreviewActiveCell] = useState<TabularCellRef | null>({ row: 0, col: 0 });
  const [previewRows, setPreviewRows] = useState<string[][]>([]);
  const [previewAdditionalRows, setPreviewAdditionalRows] = useState(0);
  const [shareCopied, setShareCopied] = useState<'idle' | 'copied' | 'error'>('idle');
  const [didLoadSharedOutline, setDidLoadSharedOutline] = useState(false);
  const [duplicateProjectId, setDuplicateProjectId] = useState<string | undefined>();

  const [saveProject, { status, data, isSuccess, reset }] = useMutation<ProjectMutationResult, unknown, CreateProject>(
    async (config: CreateProject) => {
      try {
        return await api.createProject(config);
      } catch (error) {
        return { error: getErrorMessage(error, 'Unable to create project.') };
      }
    }
  );

  const isError = !!data?.error;
  const isProjectCompleted = isSuccess && !isError;
  const createdProjectPath = data?.id ? `/projects/${data.id}` : data?.slug ? `/projects/${data.slug}` : null;
  const detailsDone = hasIntlValue(label) && hasIntlValue(summary) && !!slug.trim();
  const hasImage = Boolean(manifestId && canvasId);
  const requiresNetStep = enableZoomTracking && hasImage;
  const modelSaved = tabularModel.saved ? tabularModel.saved.every(Boolean) : false;
  const previewRowOffset = enableZoomTracking && hasImage ? 1 : 0;
  const basePreviewTableRowCount = Math.max(1, (netConfig.rows || TABULAR_WIZARD_CAST_A_NET_ROWS) - previewRowOffset);
  const previewTableRowCount = Math.max(1, basePreviewTableRowCount + previewAdditionalRows);
  const previewTableHeight = Math.max(
    PREVIEW_TABLE_MIN_HEIGHT,
    TABULAR_WIZARD_PREVIEW_SPLIT_TOTAL_HEIGHT -
      previewCanvasHeight -
      TABULAR_WIZARD_PREVIEW_SPLIT_DIVIDER_HEIGHT -
      TABULAR_WIZARD_PREVIEW_SPLIT_GAP * 2
  );
  const modelColumnCount = Math.max(1, tabularModel.columns || 1);
  const netColumnCount = Math.max(1, netConfig.cols);
  const configuredColumnCount = Math.max(1, tabularPayload?.columns?.length || modelColumnCount);
  const primaryLabel = getPreferredIntlValue(label, defaultLocale);
  const primarySummary = getPreferredIntlValue(summary, defaultLocale);

  const site = useSite();
  const siteId = site?.id;

  useEffect(() => {
    if (autoSlug) {
      const textLabel = getPreferredIntlValue(label, defaultLocale);
      setSlug(slugify(textLabel, { lower: true }));
    }
  }, [autoSlug, label, defaultLocale, setSlug]);

  useEffect(() => {
    if (!modelSaved) {
      return;
    }

    const colsFromSavedModel = Math.max(1, Math.floor(tabularModel.columns || tabularPayload?.columns?.length || 0));
    const targetRows = TABULAR_WIZARD_CAST_A_NET_ROWS;

    setNetConfig(prev => {
      const colsChanged = prev.cols !== colsFromSavedModel;
      const rowsChanged = prev.rows !== targetRows;
      const colPositionCountChanged = (prev.colPositions || []).length !== Math.max(0, colsFromSavedModel - 1);
      const rowPositionCountChanged = (prev.rowPositions || []).length !== Math.max(0, targetRows - 1);
      const shouldResetCols = colsChanged || colPositionCountChanged;
      const shouldResetRows = rowsChanged || rowPositionCountChanged;

      if (!shouldResetCols && !shouldResetRows) {
        return prev;
      }

      return {
        ...prev,
        cols: colsFromSavedModel,
        rows: targetRows,
        colPositions: shouldResetCols ? buildEvenLinePositions(colsFromSavedModel) : prev.colPositions,
        rowPositions: shouldResetRows ? buildEvenLinePositions(targetRows) : prev.rowPositions,
        rowOffsetAdjustments: shouldResetRows ? [] : prev.rowOffsetAdjustments,
      };
    });
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
  const previewFieldTypes = useMemo(
    () =>
      tabularPayload?.columns?.length
        ? tabularPayload.columns.map(column => column.type || column.fieldType || 'text-field')
        : Array.from({ length: modelColumnCount }, (_, index) => tabularModel.fieldTypes?.[index] ?? 'text-field'),
    [tabularPayload, modelColumnCount, tabularModel.fieldTypes]
  );
  const previewDropdownOptionsText = useMemo(
    () =>
      tabularPayload?.columns?.length
        ? tabularPayload.columns.map(column => {
            if (column.dropdownOptionsText) {
              return column.dropdownOptionsText;
            }

            return column.id
              ? stringifyTabularDropdownOptions(tabularPayload.captureModelFields?.[column.id]?.options)
              : '';
          })
        : Array.from({ length: modelColumnCount }, (_, index) => tabularModel.dropdownOptionsText?.[index] ?? ''),
    [tabularPayload, modelColumnCount, tabularModel.dropdownOptionsText]
  );

  const netHeadings = useMemo(
    () => Array.from({ length: netColumnCount }, (_, index) => tabularModel.headings?.[index] ?? ''),
    [netColumnCount, tabularModel.headings]
  );

  const netTooltips = useMemo(
    () => Array.from({ length: netColumnCount }, (_, index) => tabularModel.helpText?.[index] ?? ''),
    [netColumnCount, tabularModel.helpText]
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
    const maxRow = previewTableRowCount - 1;
    const maxCol = Math.max(1, previewColumns.length || 1) - 1;

    if (!previewActiveCell) {
      setPreviewActiveCell({ row: 0, col: 0 });
      return;
    }

    if (previewActiveCell.row > maxRow || previewActiveCell.col > maxCol) {
      setPreviewActiveCell({
        row: Math.min(previewActiveCell.row, maxRow),
        col: Math.min(previewActiveCell.col, maxCol),
      });
    }
  }, [previewActiveCell, previewTableRowCount, previewColumns.length]);

  useEffect(() => {
    if (shareCopied !== 'copied' || typeof window === 'undefined') {
      return;
    }

    const timeout = window.setTimeout(() => setShareCopied('idle'), 1800);
    return () => window.clearTimeout(timeout);
  }, [shareCopied]);

  useEffect(() => {
    if (!siteSlug || typeof window === 'undefined') {
      return;
    }

    let cancelled = false;

    const loadMadocHomeResources = async () => {
      setIiifHomeLoadError(null);

      try {
        const allCollections: MadocCollectionSnippet[] = [];
        let collectionPage = 1;
        let collectionTotalPages = 1;

        while (collectionPage <= collectionTotalPages && collectionPage <= 20) {
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

        while (manifestPage <= manifestTotalPages && manifestPage <= 40) {
          const response = await api.getManifests(manifestPage);
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

        const nextHomeCollection = createMadocHomeCollection({
          siteSlug,
          collections: allCollections,
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
      }
    };

    void loadMadocHomeResources();

    return () => {
      cancelled = true;
    };
  }, [api, siteSlug, t]);

  useEffect(() => {
    if (didLoadSharedOutline || typeof window === 'undefined') {
      return;
    }

    setDidLoadSharedOutline(true);

    const searchParams = new URLSearchParams(window.location.search);
    const outlineValue = searchParams.get('outline');
    const isDuplicateFlow = searchParams.get('duplicate') === '1';
    const sourceProjectId = searchParams.get('duplicateProjectId') || searchParams.get('sourceProjectId');
    const normalizedSourceProjectId = sourceProjectId ? sourceProjectId.trim() : '';

    if (isDuplicateFlow && normalizedSourceProjectId && /^\d+$/.test(normalizedSourceProjectId)) {
      setDuplicateProjectId(normalizedSourceProjectId);
    }

    if (!outlineValue) {
      return;
    }

    const shared = decodeOutlinePayload(outlineValue);
    if (!shared) {
      setIiifError(t('The shared outline could not be loaded.'));
      return;
    }

    if (shared.label) {
      if (!isDuplicateFlow) {
        setLabel(shared.label);
      }
    }

    if (shared.summary) {
      setSummary(shared.summary);
    }

    if (typeof shared.slug === 'string') {
      if (!isDuplicateFlow) {
        setSlug(shared.slug);
        setAutoSlug(false);
      }
    }

    if (typeof shared.enableZoomTracking === 'boolean') {
      setEnableZoomTracking(shared.enableZoomTracking);
    }

    if (typeof shared.crowdsourcingInstructions === 'string') {
      setCrowdsourcingInstructions(shared.crowdsourcingInstructions);
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
      setStep(isDuplicateFlow ? STEP_DETAILS : STEP_PREVIEW);
    }
  }, [didLoadSharedOutline, setLabel, setSlug, setSummary, t]);

  const clearImageSelection = useCallback(() => {
    setManifestId(undefined);
    setCanvasId(undefined);
    setSelectedCanvasLabel(undefined);
    setSelectedCanvasThumbnail(undefined);
    setIiifError(null);
    setIiifBrowserSelection(null);

    if (step === STEP_NET) {
      setStep(STEP_SETTINGS);
    }
  }, [step]);

  const setBrowserCloseHandler = useCallback((close?: () => void) => {
    closeBrowserRef.current = close || null;
  }, []);

  const setupPayload = useMemo(() => {
    if (!tabularPayload) {
      return null;
    }

    return buildTabularProjectSetupPayload(netConfig, tabularPayload);
  }, [netConfig, tabularPayload]);

  const iiifSelection = useMemo(() => ({ manifestId, canvasId }), [manifestId, canvasId]);
  const templateOptions = useMemo(
    () => ({
      enableZoomTracking,
      crowdsourcingInstructions,
      iiif: iiifSelection,
    }),
    [enableZoomTracking, crowdsourcingInstructions, iiifSelection]
  );

  const createProjectPayload = useMemo<CreateProject | null>(() => {
    if (!setupPayload) {
      return null;
    }

    const templateOptionsWithSetup = { ...templateOptions, tabular: setupPayload };

    return {
      label,
      summary,
      slug,
      template: 'tabular-project',
      template_options: templateOptionsWithSetup,
      template_config: { ...templateOptionsWithSetup },
      duplicate_project_id: duplicateProjectId,
      remote_template: null,
    };
  }, [duplicateProjectId, label, summary, slug, templateOptions, setupPayload]);

  const shareUrl = useMemo(() => {
    if (typeof window === 'undefined' || !setupPayload) {
      return '';
    }

    const outline: TabularOutlineSharePayload = {
      label,
      summary,
      slug,
      ...templateOptions,
      tabular: setupPayload,
    };

    const encoded = encodeOutlinePayload(outline);
    if (!encoded) {
      return '';
    }

    return `${window.location.origin}${window.location.pathname}?outline=${encodeURIComponent(encoded)}`;
  }, [label, summary, slug, templateOptions, setupPayload]);

  const canTrackPreviewOnCanvas = Boolean(
    enableZoomTracking &&
    hasImage &&
    setupPayload?.structure?.columnWidthsPctOfPage?.length &&
    setupPayload?.structure?.rowHeightsPctOfPage?.length
  );
  const canFollowPreviewOnCanvas = Boolean(
    hasImage &&
    setupPayload?.structure?.columnWidthsPctOfPage?.length &&
    setupPayload?.structure?.rowHeightsPctOfPage?.length
  );

  const previewCanvasActiveCell = useMemo<TabularCellRef | null>(() => {
    if (!canFollowPreviewOnCanvas) {
      return null;
    }

    return offsetTabularCellRef(previewActiveCell, previewRowOffset);
  }, [canFollowPreviewOnCanvas, previewActiveCell, previewRowOffset]);

  const copyShareLink = useCallback(async () => {
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
  }, [shareUrl]);

  const nudgePreviewNet = useCallback(
    (x: number, y: number) => {
      setNetConfig(prev => {
        const nextLeft = clampToRange(prev.left + x, 0, 100 - prev.width);
        const fallbackAnchorRow = Math.max(0, Math.floor(prev.rows || 0));
        const anchorRow = previewCanvasActiveCell?.row ?? fallbackAnchorRow;
        if (Number.isFinite(anchorRow) && anchorRow >= 0 && y !== 0) {
          return {
            ...prev,
            left: nextLeft,
            rowOffsetAdjustments: addTabularRowOffsetAdjustment(prev.rowOffsetAdjustments, anchorRow, y),
          };
        }
        return {
          ...prev,
          left: nextLeft,
        };
      });
    },
    [previewCanvasActiveCell]
  );

  const addPreviewRow = useCallback(() => {
    setPreviewAdditionalRows(prev => prev + 1);
  }, []);

  const removePreviewRow = useCallback(() => {
    setPreviewAdditionalRows(prev => {
      const nextRowCount = basePreviewTableRowCount + prev - 1;
      if (nextRowCount < 1) {
        return prev;
      }
      return prev - 1;
    });
  }, [basePreviewTableRowCount]);

  const canRemovePreviewRow = previewTableRowCount > 1;

  const moveNextFromModel = useCallback(() => {
    setShowModelValidationErrors(true);
    if (!isModelValid) {
      return;
    }
    setShowModelValidationErrors(false);

    const nextColumns = Math.max(1, Math.floor(tabularModel.columns || tabularModel.headings?.length || 1));
    const nextHeadings = Array.from({ length: nextColumns }, (_, index) => tabularModel.headings?.[index] ?? '');
    const nextFieldTypes = Array.from(
      { length: nextColumns },
      (_, index) => tabularModel.fieldTypes?.[index] ?? 'text-field'
    );
    const nextHelpText = Array.from({ length: nextColumns }, (_, index) => tabularModel.helpText?.[index]);
    const nextDropdownOptionsText = Array.from(
      { length: nextColumns },
      (_, index) => tabularModel.dropdownOptionsText?.[index] ?? ''
    );
    const nextSavedFlags = Array.from({ length: nextColumns }, () => true);

    setTabularModel(current => ({
      ...current,
      columns: nextColumns,
      headings: nextHeadings,
      fieldTypes: nextFieldTypes,
      helpText: nextHelpText,
      dropdownOptionsText: nextDropdownOptionsText,
      saved: nextSavedFlags,
    }));

    setTabularPayload(
      buildTabularModelPayload(nextHeadings, {
        fieldTypes: nextFieldTypes,
        helpText: nextHelpText,
        dropdownOptionsText: nextDropdownOptionsText,
        saved: nextSavedFlags,
      })
    );

    if (requiresNetStep) {
      setStep(STEP_NET);
      return;
    }

    setStep(STEP_PREVIEW);
  }, [isModelValid, requiresNetStep, tabularModel]);

  useEffect(() => {
    if (isProjectCompleted) {
      setStep(STEP_COMPLETE);
    }
  }, [isProjectCompleted]);

  useEffect(() => {
    setMaxReachedStep(previous => (step > previous ? step : previous));
  }, [step]);

  const steps = useMemo<TabularWizardStep[]>(
    () => [
      { id: STEP_DETAILS, label: t('Project details') },
      { id: STEP_SETTINGS, label: t('Additional settings') },
      { id: STEP_MODEL, label: t('Define tabular model') },
      { id: STEP_NET, label: t('Draw table grid'), disabled: !requiresNetStep },
      { id: STEP_PREVIEW, label: t('Preview') },
      { id: STEP_COMPLETE, label: t('Complete') },
    ],
    [t, requiresNetStep]
  );

  const goToStep = useCallback(
    (id: number, disabled?: boolean) => {
      if (disabled) {
        return;
      }

      if (isProjectCompleted && id !== STEP_COMPLETE) {
        return;
      }

      if (id <= maxReachedStep) {
        setStep(id);
      }
    },
    [isProjectCompleted, maxReachedStep]
  );

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
        siteSlug,
      });

      if (!resolvedManifestId || !resolvedCanvasId) {
        setIiifError(t('Select a canvas from within a manifest.'));
        return;
      }

      const resolvedLabel = getIiifSelectionLabel(resource, defaultLocale);
      const resolvedThumbnail = getIiifSelectionThumbnail(resource);

      setCanvasId(resolvedCanvasId);
      setManifestId(resolvedManifestId);
      setSelectedCanvasLabel(resolvedLabel || undefined);
      setSelectedCanvasThumbnail(resolvedThumbnail || undefined);
      setIiifError(null);
      setIiifBrowserSelection(resolvedLabel || resourceId);
      closeBrowserRef.current?.();
    },
    [defaultLocale, siteSlug, t]
  );

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
    const madocApiRoot =
      typeof window !== 'undefined' && siteSlug ? `${window.location.origin}/s/${siteSlug}/madoc/api` : undefined;

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
      localStorageKey: 'iiif-browser-tabular-project-v2',
      initialHistory,
      initialHistoryCursor: 0,
      seedCollections: iiifHomeCollection ? [iiifHomeCollection] : [],
      collectionUrlMapping: madocApiRoot && iiifHomeCollection ? { [madocApiRoot]: iiifHomeCollection.id } : {},
      collectionUrlMappingParams: {},
      preprocessManifest: async manifest => {
        const normalized = normalizeLegacyIiifKeys(manifest);
        return normalized.value;
      },
    };
  }, [iiifHomeCollection, iiifHomeHistoryItem, siteSlug]);

  const rootCollection =
    typeof window !== 'undefined' && siteSlug
      ? `${window.location.origin}/s/${siteSlug}/madoc/api/collections/root`
      : iiifHomeCollection?.id || 'iiif://home';

  const searchOptions: IIIFBrowserProps['search'] = useMemo(() => {
    if (!siteSlug || typeof window === 'undefined') {
      return undefined;
    }

    return {
      enableWithinCollection: false,
      enableExternal: true,
      combination: {
        mode: 'externalFirst',
        maxExternalResults: MAX_EXTERNAL_SEARCH_RESULTS,
      },
      typesense: {
        //
        apiKey: 'xyz',
        host: window.location.hostname,
        // port: Number(window.location.port || (window.location.protocol === 'https:' ? '443' : '80')),
        protocol: window.location.protocol.replace(':', '') as 'http' | 'https',
        path: `/s/${siteSlug}/madoc/api/typesense`,
        collection: `madoc_site_${siteId}`,
        searchParams: {
          query_by: 'resource_label,search_text,metadata_label,metadata_pairs',
          per_page: MAX_EXTERNAL_SEARCH_RESULTS,
        },
        mapHitToResult(hit) {
          const doc = hit.document;
          const manifestIds = doc.manifest_ids as string[] | undefined;
          const manifestHitId =
            manifestIds && manifestIds.length > 0
              ? manifestIds[0]
              : typeof doc.manifest_id === 'string'
                ? doc.manifest_id.split(':').pop()
                : null;

          const resourceUrl = manifestHitId
            ? `${window.location.origin}/s/${siteSlug}/madoc/api/manifests/${manifestHitId}/export/3.0`
            : String(doc.resource_id ?? doc.id);

          const highlightSummary =
            hit.highlights
              ?.map(h => h.snippet?.trim())
              .filter(Boolean)
              .join(' · ') ?? null;

          return {
            id: String(doc.id),
            label: String(doc.resource_label ?? doc.sort_label ?? 'Untitled'),
            thumbnail: doc.thumbnail ? String(doc.thumbnail) : null,
            summary: highlightSummary,
            kind: 'external' as const,
            resourceId: resourceUrl,
            resourceType: 'Manifest',
            metadata: doc,
          };
        },
      },
      externalSectionLabel: 'Madoc search results',
    };
  }, [siteSlug, siteId]);

  const uiOptions: IIIFBrowserProps['ui'] = useMemo(
    () => ({
      homeLink: rootCollection,
      defaultPages: {
        about: false,
        bookmarks: false,
        history: false,
        viewSource: false,
        homepage: false,
      },
    }),
    [rootCollection]
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

  const onModelChange = useCallback((res: TabularModelChange) => {
    setTabularPayload(res.payload);
    setIsModelValid(res.isValid);
  }, []);

  const saveDetailsStep = useCallback(async () => {
    if (isCheckingDetails) {
      return;
    }

    reset();
    const nextSlug = slug.trim();

    if (!nextSlug) {
      setDetailsError(t('Slug is required.'));
      return;
    }

    if (nextSlug !== slug) {
      setSlug(nextSlug);
    }

    setDetailsError(null);
    setIsCheckingDetails(true);

    try {
      let existingProject: { id?: number | string } | null = null;

      if (/^\d+$/.test(nextSlug)) {
        let page = 1;
        let totalPages = 1;

        while (page <= totalPages && page <= 500) {
          const response = await api.getProjects(page);
          const found = response.projects.find(project => project.slug === nextSlug);
          if (found) {
            existingProject = found;
            break;
          }

          totalPages = Math.max(1, response.pagination.totalPages || 1);
          page += 1;
        }
      } else {
        try {
          existingProject = (await api.getProject(nextSlug, { published: false })) || null;
        } catch (error) {
          if (
            !(typeof error === 'object' && error && 'status' in error && (error as { status?: unknown }).status === 404)
          ) {
            throw error;
          }
        }
      }

      if (existingProject?.id) {
        setDetailsError(
          t('Slug is already used. Project slugs must be unique per site, please select an alternative value.')
        );
        return;
      }

      setStep(STEP_SETTINGS);
    } catch (error) {
      setDetailsError(getErrorMessage(error, t('Unable to validate slug right now. Please try again.')));
    } finally {
      setIsCheckingDetails(false);
    }
  }, [api, isCheckingDetails, reset, setSlug, slug, t]);

  const saveSettingsStep = useCallback(() => {
    reset();
    setStep(STEP_MODEL);
  }, [reset]);

  const saveNetStep = useCallback(() => {
    reset();
    setStep(STEP_PREVIEW);
  }, [reset]);

  const savePreviewStep = useCallback(() => {
    setStep(STEP_COMPLETE);
  }, []);

  const completeProject = useCallback(() => {
    if (!createProjectPayload) {
      return;
    }

    saveProject(createProjectPayload);
  }, [createProjectPayload, saveProject]);

  return {
    stepIds: TABULAR_PROJECT_STEP_IDS,
    step,
    maxReachedStep,
    setStep,
    steps,
    isProjectCompleted,
    goToStep,

    label,
    summary,
    slug,
    setLabel,
    setSummary,
    setSlug,
    disableAutoSlug: () => setAutoSlug(false),
    detailsDone,
    detailsError,
    isCheckingDetails,
    saveDetailsStep,

    enableZoomTracking,
    setEnableZoomTracking,
    crowdsourcingInstructions,
    setCrowdsourcingInstructions,
    hasImage,
    manifestId,
    canvasId,
    selectedCanvasLabel,
    selectedCanvasThumbnail,
    iiifBrowserSelection,
    iiifError,
    clearImageSelection,
    setBrowserCloseHandler,
    saveSettingsStep,

    tabularModel,
    setTabularModel,
    isModelValid,
    showModelValidationErrors,
    onModelChange,
    moveNextFromModel,

    requiresNetStep,
    netConfig,
    setNetConfig,
    castANetHeight,
    startCastANetResize,
    isCastANetDividerHover,
    setIsCastANetDividerHover,
    netColumnCount,
    netHeadings,
    netTooltips,
    saveNetStep,

    shareUrl,
    shareCopied,
    copyShareLink,
    canTrackPreviewOnCanvas,
    previewCanvasHeight,
    startPreviewResize,
    previewCanvasActiveCell,
    previewColumns,
    previewTooltips,
    previewFieldTypes,
    previewDropdownOptionsText,
    previewTableRowCount,
    previewRows,
    setPreviewRows,
    previewActiveCell,
    setPreviewActiveCell,
    previewTableHeight,
    nudgePreviewNet,
    addPreviewRow,
    removePreviewRow,
    canRemovePreviewRow,
    savePreviewStep,

    iiifHomeLoadError,
    iiifBrowserVersion,
    navigationOptions,
    historyOptions,
    searchOptions,
    outputOptions,
    uiOptions,

    createdProjectPath,
    primaryLabel,
    primarySummary,
    configuredColumnCount,
    createProjectPayload,
    isError,
    errorMessage: data?.error,
    status,
    completeProject,

    reset,
  };
}
