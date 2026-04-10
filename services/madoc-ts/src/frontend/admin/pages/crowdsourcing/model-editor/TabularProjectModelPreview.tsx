import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useApi } from '@/frontend/shared/hooks/use-api';
import { useSite } from '@/frontend/shared/hooks/use-site';
import { ContentExplorer } from '@/frontend/shared/features/ContentExplorer';
import { BrowserComponent } from '@/frontend/shared/utility/browser-component';
import { Button } from '@/frontend/shared/navigation/Button';
import { offsetTabularCellRef } from '@/frontend/shared/utility/tabular-cell-ref';
import { addTabularRowOffsetAdjustment } from '@/frontend/shared/utility/tabular-row-offset-adjustments';
import { clampToRange, netConfigFromSharedStructure } from '@/frontend/shared/utility/tabular-net-config';
import type { NetConfig, TabularCellRef } from '@/frontend/shared/utility/tabular-types';
import { stringifyTabularDropdownOptions } from '@/frontend/admin/components/tabular/cast-a-net/TabularModel';
import { CastANet } from '@/frontend/admin/components/tabular/cast-a-net/CastANet';
import type { TabularProjectTemplateConfig } from '@/types/tabular-project-template-config';
import { ViewContentFetch } from '../../../molecules/ViewContentFetch';
import {
  TABULAR_WIZARD_CAST_A_NET_ROWS,
  TABULAR_WIZARD_PREVIEW_SPLIT_DIVIDER_HEIGHT,
  TABULAR_WIZARD_PREVIEW_SPLIT_GAP,
  TABULAR_WIZARD_PREVIEW_SPLIT_TOTAL_HEIGHT,
} from '../projects/tabular-project/constants';
import { useResizableHeight } from '../projects/tabular-project/hooks/use-resizable-height';
import { TabularProjectPreviewStep } from '../projects/tabular-project/steps/TabularProjectPreviewStep';
import { ensureCanvasIdForManifest, ensureManifestExportUrl } from '../projects/tabular-project/utils';

const PREVIEW_NUDGE_STEP = 0.25;
const PREVIEW_CANVAS_HEIGHT = 420;
const PREVIEW_CANVAS_MIN_HEIGHT = 280;
const PREVIEW_TABLE_MIN_HEIGHT = 180;
const PREVIEW_CANVAS_MAX_HEIGHT =
  TABULAR_WIZARD_PREVIEW_SPLIT_TOTAL_HEIGHT -
  TABULAR_WIZARD_PREVIEW_SPLIT_DIVIDER_HEIGHT -
  PREVIEW_TABLE_MIN_HEIGHT -
  TABULAR_WIZARD_PREVIEW_SPLIT_GAP * 2;

type TabularColumnWithDropdown = {
  id?: string;
  label?: string;
  type?: string;
  fieldType?: string;
  helpText?: string;
  dropdownOptionsText?: string;
};

type TabularFieldWithOptions = {
  options?: Array<{ value?: string; text?: string; label?: string }>;
};

type TabularPreviewTemplateConfig = TabularProjectTemplateConfig & {
  crowdsourcingInstructions?: string;
};

type TabularProjectModelPreviewProps = {
  projectId?: string;
  templateConfig?: unknown;
};

function buildEvenLinePositions(count: number): number[] {
  const safeCount = Math.max(1, Math.floor(count || 1));
  if (safeCount <= 1) {
    return [];
  }

  const step = 100 / safeCount;
  return Array.from({ length: safeCount - 1 }, (_item, index) => step * (index + 1));
}

function buildFallbackNetConfig(columns: number): NetConfig {
  const safeColumns = Math.max(1, columns);
  return {
    rows: TABULAR_WIZARD_CAST_A_NET_ROWS,
    cols: safeColumns,
    top: 10,
    left: 10,
    width: 80,
    height: 80,
    rowPositions: buildEvenLinePositions(TABULAR_WIZARD_CAST_A_NET_ROWS),
    colPositions: buildEvenLinePositions(safeColumns),
    rowOffsetAdjustments: [],
  };
}

function parseCanvasIdForExplorer(canvasId?: string): number | undefined {
  if (!canvasId) {
    return undefined;
  }

  const directNumeric = Number.parseInt(canvasId, 10);
  if (Number.isFinite(directNumeric)) {
    return directNumeric;
  }

  const match = canvasId.match(/\/c(\d+)(?:\/|$)/i) || canvasId.match(/\/canvases\/(\d+)(?:\/|$)/i);
  if (!match?.[1]) {
    return undefined;
  }

  const parsed = Number.parseInt(match[1], 10);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function toTemplateConfig(value: unknown): TabularPreviewTemplateConfig | undefined {
  if (!value || typeof value !== 'object') {
    return undefined;
  }

  return value as TabularPreviewTemplateConfig;
}

export function TabularProjectModelPreview({ projectId, templateConfig }: TabularProjectModelPreviewProps) {
  const { t } = useTranslation();
  const api = useApi();
  const site = useSite();
  const closeBrowserRef = useRef<(() => void) | null>(null);
  const resolvedTemplateConfig = useMemo(() => toTemplateConfig(templateConfig), [templateConfig]);

  const columns = useMemo(
    () => (resolvedTemplateConfig?.tabular?.model?.columns || []) as TabularColumnWithDropdown[],
    [resolvedTemplateConfig?.tabular?.model?.columns]
  );
  const initialManifestId = resolvedTemplateConfig?.iiif?.manifestId;
  const initialCanvasId = resolvedTemplateConfig?.iiif?.canvasId;
  const [manifestId, setManifestId] = useState<string | undefined>(initialManifestId);
  const [canvasId, setCanvasId] = useState<string | undefined>(initialCanvasId);
  const [iiifSelectionError, setIiifSelectionError] = useState<string | null>(null);

  const initialNetConfig = useMemo(() => {
    const fromTemplate = netConfigFromSharedStructure(resolvedTemplateConfig?.tabular?.structure);
    if (fromTemplate) {
      return fromTemplate;
    }
    return buildFallbackNetConfig(columns.length);
  }, [columns.length, resolvedTemplateConfig?.tabular?.structure]);
  const [netConfig, setNetConfig] = useState<NetConfig>(initialNetConfig);

  const { height: previewCanvasHeight, startResize: startPreviewResize } = useResizableHeight(
    clampToRange(PREVIEW_CANVAS_HEIGHT, PREVIEW_CANVAS_MIN_HEIGHT, PREVIEW_CANVAS_MAX_HEIGHT),
    {
      min: PREVIEW_CANVAS_MIN_HEIGHT,
      max: PREVIEW_CANVAS_MAX_HEIGHT,
    }
  );

  const [isDividerHover, setIsDividerHover] = useState(false);
  const [previewActiveCell, setPreviewActiveCell] = useState<TabularCellRef | null>({ row: 0, col: 0 });
  const [previewRows, setPreviewRows] = useState<string[][]>([]);
  const [previewAdditionalRows, setPreviewAdditionalRows] = useState(0);
  const hasImage = Boolean(manifestId && canvasId);
  const enableZoomTracking = resolvedTemplateConfig?.enableZoomTracking !== false;
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
  const previewColumns = useMemo(
    () => (columns.length ? columns.map(column => column.label || '') : [t('Column 1')]),
    [columns, t]
  );
  const previewTooltips = useMemo(
    () => (columns.length ? columns.map(column => column.helpText || '') : ['']),
    [columns]
  );
  const previewFieldTypes = useMemo(
    () => (columns.length ? columns.map(column => column.type || column.fieldType || 'text-field') : ['text-field']),
    [columns]
  );
  const previewDropdownOptionsText = useMemo(
    () =>
      columns.length
        ? columns.map(column => {
            if (column.dropdownOptionsText) {
              return column.dropdownOptionsText;
            }

            if (!column.id) {
              return '';
            }

            const field = resolvedTemplateConfig?.tabular?.model?.captureModelFields?.[
              column.id
            ] as TabularFieldWithOptions;
            const normalizedOptions = (field?.options || []).flatMap(option => {
              const value = (option.value || option.text || '').trim();
              if (!value) {
                return [];
              }

              const text = (option.text || option.value || '').trim() || value;
              const label = option.label?.trim() || undefined;
              return [{ value, text, ...(label ? { label } : {}) }];
            });
            return stringifyTabularDropdownOptions(normalizedOptions);
          })
        : [''],
    [columns, resolvedTemplateConfig?.tabular?.model?.captureModelFields]
  );
  const canTrackPreviewOnCanvas = Boolean(enableZoomTracking && hasImage && netConfig.rows > 0 && netConfig.cols > 0);
  const previewCanvasActiveCell = useMemo(() => {
    if (!hasImage || netConfig.rows < 1 || netConfig.cols < 1) {
      return null;
    }

    return offsetTabularCellRef(previewActiveCell, previewRowOffset);
  }, [hasImage, netConfig.cols, netConfig.rows, previewActiveCell, previewRowOffset]);
  const currentCanvasForExplorer = parseCanvasIdForExplorer(canvasId);

  useEffect(() => {
    setNetConfig(initialNetConfig);
  }, [initialNetConfig]);

  useEffect(() => {
    setManifestId(initialManifestId);
    setCanvasId(initialCanvasId);
  }, [initialCanvasId, initialManifestId]);

  useEffect(() => {
    const rowCount = previewTableRowCount;
    const colCount = Math.max(1, previewColumns.length || 1);

    setPreviewRows(prev =>
      Array.from({ length: rowCount }, (_row, rowIndex) =>
        Array.from({ length: colCount }, (_col, colIndex) => prev[rowIndex]?.[colIndex] ?? '')
      )
    );
  }, [previewColumns.length, previewTableRowCount]);

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
  }, [previewActiveCell, previewColumns.length, previewTableRowCount]);

  const onRegisterBrowserClose = useCallback((close?: () => void) => {
    closeBrowserRef.current = close || null;
  }, []);

  const onSelectCanvas = useCallback(
    async (selectedCanvasId: number) => {
      const projectIdAsNumber = projectId ? Number.parseInt(projectId, 10) : undefined;
      const hasProjectId = typeof projectIdAsNumber === 'number' && Number.isFinite(projectIdAsNumber);
      let nextManifestId = manifestId;

      try {
        const response = await api.getCanvasManifests(
          selectedCanvasId,
          hasProjectId ? { project_id: projectIdAsNumber } : undefined
        );
        const linkedManifest = response.manifests?.[0];
        if (typeof linkedManifest === 'number') {
          nextManifestId = ensureManifestExportUrl(String(linkedManifest), site?.slug);
        }
      } catch {
        // Keep existing manifest fallback if lookup fails.
      }

      if (!nextManifestId) {
        setIiifSelectionError(t('Could not resolve a manifest for this canvas.'));
        return;
      }

      const nextCanvasId = ensureCanvasIdForManifest(String(selectedCanvasId), nextManifestId);
      setManifestId(nextManifestId);
      setCanvasId(nextCanvasId);
      setIiifSelectionError(null);
      closeBrowserRef.current?.();
    },
    [api, manifestId, projectId, site?.slug, t]
  );

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
    setPreviewAdditionalRows(previous => previous + 1);
  }, []);

  const removePreviewRow = useCallback(() => {
    setPreviewAdditionalRows(previous => {
      const nextRowCount = basePreviewTableRowCount + previous - 1;
      if (nextRowCount < 1) {
        return previous;
      }
      return previous - 1;
    });
  }, [basePreviewTableRowCount]);

  const canRemovePreviewRow = previewTableRowCount > 1;
  const iiifBrowser = (
    <div className="min-h-[420px]">
      <ContentExplorer
        projectId={projectId}
        canvasId={currentCanvasForExplorer}
        renderChoice={(selectedCanvasId, reset) => (
          <div className="grid gap-3 p-2">
            <BrowserComponent fallback={<div>{t('Loading...')}</div>}>
              <div className="rounded border border-gray-200 bg-white p-2">
                <ViewContentFetch id={selectedCanvasId} />
              </div>
            </BrowserComponent>
            <div className="flex flex-wrap gap-2">
              <Button $primary onClick={() => void onSelectCanvas(selectedCanvasId)}>
                {t('Use this image')}
              </Button>
              <Button onClick={reset}>{t('Select a different image')}</Button>
            </div>
            {iiifSelectionError ? (
              <div className="rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
                {iiifSelectionError}
              </div>
            ) : null}
          </div>
        )}
      />
    </div>
  );

  return (
    <TabularProjectPreviewStep
      t={t}
      shareUrl=""
      shareCopied="idle"
      crowdsourcingInstructions={resolvedTemplateConfig?.crowdsourcingInstructions}
      canTrackPreviewOnCanvas={canTrackPreviewOnCanvas}
      hasImage={hasImage}
      manifestId={manifestId}
      canvasId={canvasId}
      netConfig={netConfig}
      previewCanvasHeight={previewCanvasHeight}
      previewCanvasActiveCell={previewCanvasActiveCell}
      previewColumns={previewColumns}
      previewTooltips={previewTooltips}
      previewFieldTypes={previewFieldTypes}
      previewDropdownOptionsText={previewDropdownOptionsText}
      previewTableRowCount={previewTableRowCount}
      previewRows={previewRows}
      previewActiveCell={previewActiveCell}
      previewTableHeight={previewTableHeight}
      isDividerHover={isDividerHover}
      iiifBrowser={iiifBrowser}
      onCopyShareLink={() => undefined}
      onNudgePreviewNet={(x, y) => nudgePreviewNet(x, y)}
      onNetConfigChange={setNetConfig}
      onRegisterBrowserClose={onRegisterBrowserClose}
      onStartResize={startPreviewResize}
      onDividerHoverChange={setIsDividerHover}
      onPreviewRowsChange={setPreviewRows}
      onPreviewActiveCellChange={setPreviewActiveCell}
      canRemovePreviewRow={canRemovePreviewRow}
      onAddRow={addPreviewRow}
      onRemoveRow={removePreviewRow}
      CastANetComponent={CastANet}
    />
  );
}
