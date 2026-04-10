import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CanvasPanel, SimpleViewerProvider } from 'react-iiif-vault';
import {
  type TabularColumnEditorValue,
  type DefineTabularModelValue,
  type TabularModelChange,
  type TabularValidationIssue,
} from './types';
import { buildTabularModelPayload, validateTabularModel } from './TabularModel';
import { TabularHeadingsTable } from './TabularHeadingsTable';
import { TabularColumnEditor } from './TabularColumnEditor';
import { TabularCanvasViewportControls } from '@/frontend/shared/components/TabularCanvasViewportControls';
import { AddIcon } from '@/frontend/shared/icons/AddIcon';
import { MinusIcon } from '@/frontend/shared/icons/MinusIcon';
import { resizeAtlasRuntime } from '@/frontend/shared/utility/resize-atlas-runtime';

function reorderArray<T>(items: T[], sourceIndex: number, targetIndex: number): T[] {
  if (sourceIndex === targetIndex) {
    return items;
  }

  const reordered = items.slice();
  const [sourceItem] = reordered.splice(sourceIndex, 1);
  if (sourceItem === undefined) {
    return items;
  }

  reordered.splice(targetIndex, 0, sourceItem);
  return reordered;
}

function ReferenceImagePanel(props: { manifestId: string; canvasId?: string; imageHeight: number }) {
  const { manifestId, canvasId, imageHeight } = props;
  const runtime = useRef<{
    getViewport?: () =>
      | {
          x: number;
          y: number;
          width: number;
          height: number;
        }
      | null
      | undefined;
    setViewport?: (next: { x: number; y: number; width: number; height: number }) => void;
    getRendererScreenPosition?: () =>
      | {
          width: number;
          height: number;
        }
      | undefined;
    updateRendererScreenPosition?: () => void;
    updateControllerPosition?: () => void;
    updateNextFrame?: () => void;
    renderer?: {
      resize?: (width?: number, height?: number) => void;
    };
    resize?: {
      (): void;
      (width?: number, height?: number): void;
      (fromWidth: number, toWidth: number, fromHeight: number, toHeight: number): void;
    };
    world?: {
      width?: number;
      height?: number;
      goHome?: () => void;
      zoomIn?: () => void;
      zoomOut?: () => void;
    };
  } | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const AnySimpleViewerProvider = SimpleViewerProvider as unknown as React.FC<any>;
  const viewerKey = `${manifestId}::${canvasId ?? ''}`;

  const getContainerSize = useCallback(() => {
    const container = containerRef.current;
    if (!container) {
      return null;
    }

    const rect = container.getBoundingClientRect();
    const width = Math.round(rect.width);
    const height = Math.round(rect.height);

    if (width <= 0 || height <= 0) {
      return null;
    }

    return { width, height };
  }, []);

  const resizeRuntimeToContainer = useCallback(() => {
    const size = getContainerSize();
    if (!size) {
      return;
    }

    resizeAtlasRuntime(runtime.current, size);
  }, [getContainerSize]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const container = containerRef.current;
    if (!container) {
      return;
    }

    const applyResize = () => {
      resizeRuntimeToContainer();
    };

    let frameHandle: number | null = null;
    const observer = new ResizeObserver(() => {
      if (frameHandle != null) {
        window.cancelAnimationFrame(frameHandle);
      }

      frameHandle = window.requestAnimationFrame(() => {
        applyResize();
        frameHandle = null;
      });
    });

    observer.observe(container);
    applyResize();

    return () => {
      observer.disconnect();
      if (frameHandle != null) {
        window.cancelAnimationFrame(frameHandle);
      }
    };
  }, [resizeRuntimeToContainer]);

  const goHome = () => runtime.current?.world?.goHome?.();
  const zoomIn = () => runtime.current?.world?.zoomIn?.();
  const zoomOut = () => runtime.current?.world?.zoomOut?.();

  return (
    <div className="overflow-hidden rounded-lg border border-[#e5e5e5] bg-white">
      <div ref={containerRef} className="relative bg-white" style={{ height: imageHeight }}>
        <TabularCanvasViewportControls
          onHome={goHome}
          onZoomOut={zoomOut}
          onZoomIn={zoomIn}
          className="!right-3 !top-3 !z-40"
        />
        <AnySimpleViewerProvider key={viewerKey} manifest={manifestId} startCanvas={canvasId}>
          <CanvasPanel.Viewer
            name={`tabular-model-reference::${manifestId}::${canvasId ?? 'default'}`}
            height={imageHeight}
            resizeHash={imageHeight}
            updateViewportTimeout={180}
            runtimeOptions={{ maxOverZoom: 5, visibilityRatio: 0.7, maxUnderZoom: 1 }}
            homeCover="start"
            onCreated={(preset: { runtime?: typeof runtime.current }) => {
              runtime.current = preset.runtime ?? null;
              resizeRuntimeToContainer();
            }}
          >
            <CanvasPanel.RenderCanvas />
          </CanvasPanel.Viewer>
        </AnySimpleViewerProvider>
      </div>
    </div>
  );
}

export function DefineTabularModel(props: {
  value: DefineTabularModelValue;
  onChange: (next: DefineTabularModelValue) => void;
  onModelChange?: (res: TabularModelChange) => void;
  crowdsourcingInstructions?: string;
  onCrowdsourcingInstructionsChange?: (next: string) => void;
  showValidationErrors?: boolean;
  manifestId?: string;
  canvasId?: string;
  minColumns?: number;
  maxColumns?: number;
  maxHeadingLength?: number;
  minPreviewRows?: number;
  maxPreviewRows?: number;
  defaultColumns?: number;
  defaultPreviewRows?: number;
  disabled?: boolean;
}) {
  const {
    value,
    onChange,
    onModelChange,
    crowdsourcingInstructions = '',
    onCrowdsourcingInstructionsChange,
    showValidationErrors = false,
    manifestId,
    canvasId,
    minColumns = 1,
    maxColumns = 100,
    maxHeadingLength = 80,
    minPreviewRows = 1,
    maxPreviewRows = 50,
    defaultColumns = 6,
    defaultPreviewRows = 4,
    disabled = false,
  } = props;
  const { t } = useTranslation();

  const requestedColumns = value.columns > 0 ? value.columns : defaultColumns;
  const requestedPreviewRows = value.previewRows > 0 ? value.previewRows : defaultPreviewRows;

  const safeColumns = Math.max(minColumns, Math.min(maxColumns, Math.floor(requestedColumns || 0)));
  const safePreviewRows = Math.max(minPreviewRows, Math.min(maxPreviewRows, Math.floor(requestedPreviewRows || 0)));
  const [activeColumn, setActiveColumn] = useState(0);
  const [imageHeight, setImageHeight] = useState(300);
  const [isModelHelpExpanded, setIsModelHelpExpanded] = useState(false);
  const [isResizeHandleHover, setIsResizeHandleHover] = useState(false);
  const tableScrollRef = useRef<HTMLDivElement>(null);
  const shouldScrollToNewColumnRef = useRef(false);
  const tableVisibleRows = 4;

  const safeHeadings = useMemo(
    () => Array.from({ length: safeColumns }, (_, i) => value.headings?.[i] ?? ''),
    [safeColumns, value.headings]
  );

  const safeFieldTypes = useMemo(
    () => Array.from({ length: safeColumns }, (_, i) => value.fieldTypes?.[i] ?? 'text-field'),
    [safeColumns, value.fieldTypes]
  );

  const safeHelpText = useMemo(
    () => Array.from({ length: safeColumns }, (_, i) => value.helpText?.[i]),
    [safeColumns, value.helpText]
  );
  const safeDropdownOptionsText = useMemo(
    () => Array.from({ length: safeColumns }, (_, i) => value.dropdownOptionsText?.[i] ?? ''),
    [safeColumns, value.dropdownOptionsText]
  );

  const safeSaved = useMemo(
    () => Array.from({ length: safeColumns }, (_, i) => value.saved?.[i] ?? false),
    [safeColumns, value.saved]
  );

  const buildSavedFlags = (length: number, saved: boolean) => Array.from({ length }, () => saved);
  const applyModelUpdate = (
    nextColumns: number,
    nextPreviewRows: number,
    nextHeadings: string[],
    nextFieldTypes: (string | undefined)[],
    nextHelpText: (string | undefined)[],
    nextDropdownOptionsText: (string | undefined)[]
  ) => {
    onChange({
      ...value,
      columns: nextColumns,
      previewRows: nextPreviewRows,
      headings: nextHeadings,
      fieldTypes: nextFieldTypes,
      helpText: nextHelpText,
      dropdownOptionsText: nextDropdownOptionsText,
      saved: buildSavedFlags(nextColumns, false),
    });
  };

  useEffect(() => {
    if (activeColumn > safeColumns - 1) {
      setActiveColumn(Math.max(0, safeColumns - 1));
    }
  }, [activeColumn, safeColumns]);

  useEffect(() => {
    if (!shouldScrollToNewColumnRef.current) {
      return;
    }
    shouldScrollToNewColumnRef.current = false;
    const container = tableScrollRef.current;
    if (!container) {
      return;
    }
    container.scrollTo({ left: container.scrollWidth, behavior: 'smooth' });
  }, [safeColumns]);

  const issues = useMemo(
    () =>
      validateTabularModel(safeHeadings, {
        minColumns,
        maxColumns,
        maxHeadingLength,
        saved: buildSavedFlags(safeColumns, true),
        fieldTypes: safeFieldTypes,
      }),
    [safeHeadings, safeColumns, safeFieldTypes, minColumns, maxColumns, maxHeadingLength]
  );

  const canAddColumns = !disabled && safeColumns < maxColumns;
  const canRemoveColumns = !disabled && safeColumns > minColumns;

  const payload = useMemo(
    () =>
      buildTabularModelPayload(safeHeadings, {
        fieldTypes: safeFieldTypes,
        helpText: safeHelpText,
        dropdownOptionsText: safeDropdownOptionsText,
        saved: safeSaved,
      }),
    [safeHeadings, safeFieldTypes, safeHelpText, safeDropdownOptionsText, safeSaved]
  );

  useEffect(() => {
    onModelChange?.({ isValid: issues.length === 0, issues, payload });
  }, [issues, payload, onModelChange]);

  const issuesByColumn = useMemo(() => {
    const map = new Map<number, TabularValidationIssue[]>();
    for (const issue of issues) {
      if (issue.columnIndex == null) continue;
      map.set(issue.columnIndex, [...(map.get(issue.columnIndex) ?? []), issue]);
    }
    return map;
  }, [issues]);

  const activeError = issuesByColumn.get(activeColumn)?.[0]?.message;
  const duplicateHeadings = useMemo(() => {
    const counts = new Map<string, { heading: string; count: number }>();
    for (const rawHeading of safeHeadings) {
      const heading = rawHeading.trim();
      if (!heading) {
        continue;
      }
      const key = heading.toLowerCase();
      const existing = counts.get(key);
      if (existing) {
        existing.count += 1;
      } else {
        counts.set(key, { heading, count: 1 });
      }
    }
    return Array.from(counts.values())
      .filter(entry => entry.count > 1)
      .map(entry => entry.heading);
  }, [safeHeadings]);

  const topErrorMessage = useMemo(() => {
    const firstIssue = issues[0];
    if (!firstIssue) {
      return '';
    }

    if (firstIssue.type === 'duplicate-heading') {
      const duplicateHeadingList = duplicateHeadings.map(heading => `'${heading}'`).join(', ');
      if (duplicateHeadingList) {
        return `Duplicate headings found: ${duplicateHeadingList}. These headings are highlighted in the table.`;
      }
      return 'Duplicate headings found. These headings are highlighted in the table.';
    }

    return firstIssue.message;
  }, [issues, duplicateHeadings]);

  const setColumns = (nextCols: number) => {
    const n = Math.max(minColumns, Math.min(maxColumns, Math.floor(nextCols)));
    applyModelUpdate(
      n,
      safePreviewRows,
      Array.from({ length: n }, (_, i) => safeHeadings[i] ?? ''),
      Array.from({ length: n }, (_, i) => safeFieldTypes[i] ?? 'text-field'),
      Array.from({ length: n }, (_, i) => safeHelpText[i]),
      Array.from({ length: n }, (_, i) => safeDropdownOptionsText[i] ?? '')
    );
  };

  const updateColumn = (index: number, next: TabularColumnEditorValue) => {
    const headings = safeHeadings.slice();
    const fieldTypes = safeFieldTypes.slice();
    const helpText = safeHelpText.slice();
    const dropdownOptionsText = safeDropdownOptionsText.slice();

    headings[index] = next.heading;
    fieldTypes[index] = next.fieldType ?? fieldTypes[index] ?? 'text-field';
    helpText[index] = next.helpText;
    dropdownOptionsText[index] = next.dropdownOptionsText ?? '';

    applyModelUpdate(safeColumns, tableVisibleRows, headings, fieldTypes, helpText, dropdownOptionsText);
  };

  const addColumn = () => {
    if (!canAddColumns) {
      return;
    }
    shouldScrollToNewColumnRef.current = true;
    setActiveColumn(safeColumns);
    setColumns(safeColumns + 1);
  };
  const removeColumnAt = (columnIndex: number) => {
    if (!canRemoveColumns) {
      return;
    }

    const nextColumns = safeColumns - 1;
    const headings = safeHeadings.filter((_, index) => index !== columnIndex);
    const fieldTypes = safeFieldTypes.filter((_, index) => index !== columnIndex);
    const helpText = safeHelpText.filter((_, index) => index !== columnIndex);
    const dropdownOptionsText = safeDropdownOptionsText.filter((_, index) => index !== columnIndex);

    applyModelUpdate(nextColumns, safePreviewRows, headings, fieldTypes, helpText, dropdownOptionsText);
    setActiveColumn(Math.min(columnIndex, nextColumns - 1));
  };
  const reorderColumns = (sourceColumnIndex: number, targetColumnIndex: number) => {
    if (sourceColumnIndex === targetColumnIndex) {
      return;
    }
    if (sourceColumnIndex < 0 || sourceColumnIndex >= safeColumns) {
      return;
    }
    if (targetColumnIndex < 0 || targetColumnIndex >= safeColumns) {
      return;
    }

    const orderedColumns = reorderArray(
      Array.from({ length: safeColumns }, (_, index) => index),
      sourceColumnIndex,
      targetColumnIndex
    );
    const nextActiveColumn = orderedColumns.indexOf(activeColumn);

    applyModelUpdate(
      safeColumns,
      tableVisibleRows,
      reorderArray(safeHeadings, sourceColumnIndex, targetColumnIndex),
      reorderArray(safeFieldTypes, sourceColumnIndex, targetColumnIndex),
      reorderArray(safeHelpText, sourceColumnIndex, targetColumnIndex),
      reorderArray(safeDropdownOptionsText, sourceColumnIndex, targetColumnIndex)
    );

    if (nextActiveColumn !== -1) {
      setActiveColumn(nextActiveColumn);
    }
  };
  const removeLastColumn = () => removeColumnAt(safeColumns - 1);
  const startResize = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    const startY = event.clientY;
    const startHeight = imageHeight;
    const minHeight = 220;
    const maxHeight = 520;

    const onMove = (moveEvent: MouseEvent) => {
      const delta = moveEvent.clientY - startY;
      const nextHeight = Math.max(minHeight, Math.min(maxHeight, startHeight + delta));
      setImageHeight(nextHeight);
    };

    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  return (
    <div className="flex w-full flex-col gap-3">
      {showValidationErrors && issues.length ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-[10px] text-[13px] text-rose-800">
          {topErrorMessage}
        </div>
      ) : null}

      <div className="grid grid-cols-[320px_minmax(0,1fr)] items-stretch gap-4">
        <div className="rounded border border-[#d6d6d6] bg-[#f4f4f4] p-3">
          <div className="mb-1 text-2xl font-light">{t('Tabular document')}</div>
          <div className="mt-3 rounded border border-[#ced8ff] bg-[#e8edff] p-3 text-[#1f2d5a]">
            <button
              type="button"
              className="flex w-full items-center justify-between text-left"
              aria-expanded={isModelHelpExpanded}
              aria-controls="tabular-model-help"
              onClick={() => setIsModelHelpExpanded(current => !current)}
            >
              <span className="text-[11px] font-semibold uppercase tracking-wide text-[#3d4f88]">
                {t('Model help')}
              </span>
              <span className="text-xs font-medium text-[#3d4f88]">{isModelHelpExpanded ? t('Hide') : t('Show')}</span>
            </button>
            {isModelHelpExpanded ? (
              <div id="tabular-model-help" className="mt-2">
                <div className="grid gap-1">
                  <ul className="list-disc space-y-1 pl-4 text-sm text-[#1f2d5a]">
                    <li>{t('Headings are limited to {{maxHeadingLength}} characters.', { maxHeadingLength })}</li>
                    <li>{t('Use between {{minColumns}} and {{maxColumns}} columns.', { minColumns, maxColumns })}</li>
                    <li>{t('Each heading must be unique.')}</li>
                  </ul>
                </div>
                <div className="mt-3 grid gap-1">
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-[#3d4f88]">
                    {t('Editing and next steps')}
                  </div>
                  <ul className="list-disc space-y-1 pl-4 text-sm text-[#1f2d5a]">
                    <li>{t('Click a header cell to edit it.')}</li>
                    <li>{t('Drag header cells to reorder columns.')}</li>
                    <li>
                      {t(
                        'Next step: Draw table grid to align this model to the table in your reference image (only if table row tracking is required).'
                      )}
                    </li>
                  </ul>
                </div>
              </div>
            ) : null}
          </div>

          {onCrowdsourcingInstructionsChange ? (
            <div className="mt-3 rounded border border-[#ced8ff] bg-white p-3 text-[#1f2d5a]">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-[#3d4f88]">
                {t('Crowdsourcing instructions')}
              </div>
              <div className="mt-1 text-xs">
                {t('Applies to all rows and columns. Shown to contributors in the capture modal.')}
              </div>
              <textarea
                className="mt-2 w-full rounded border border-[#cfd6e5] bg-white px-2 py-1.5 text-sm text-[#1f2d5a] focus:border-[#4265e9] focus:outline-none focus:ring-2 focus:ring-[#c7d4ff]"
                rows={4}
                value={crowdsourcingInstructions}
                placeholder={t('Enter contributor instructions')}
                disabled={disabled}
                onChange={event => onCrowdsourcingInstructionsChange(event.currentTarget.value)}
              />
            </div>
          ) : null}

          <div className="mt-3">
            <TabularColumnEditor
              index={activeColumn}
              value={{
                heading: safeHeadings[activeColumn] ?? '',
                fieldType: safeFieldTypes[activeColumn],
                helpText: safeHelpText[activeColumn] ?? '',
                dropdownOptionsText: safeDropdownOptionsText[activeColumn] ?? '',
              }}
              disabled={disabled}
              error={showValidationErrors ? activeError : undefined}
              maxHeadingLength={maxHeadingLength}
              onChange={next => updateColumn(activeColumn, next)}
              onRemove={() => removeColumnAt(activeColumn)}
              removeDisabled={safeColumns <= minColumns}
            />
            <div className="mt-2 text-[11px] leading-4 text-slate-600">
              {t('Remove column deletes the selected column. The table minus button removes only the last column.')}
            </div>
          </div>
        </div>

        <div className="grid gap-3">
          {manifestId ? (
            <ReferenceImagePanel manifestId={manifestId} canvasId={canvasId} imageHeight={imageHeight} />
          ) : null}

          {manifestId && (
            <div className="mt-[-4px] flex justify-center">
              <div
                role="separator"
                aria-orientation="horizontal"
                aria-label={t('Resize image and table')}
                onMouseDown={startResize}
                onMouseEnter={() => setIsResizeHandleHover(true)}
                onMouseLeave={() => setIsResizeHandleHover(false)}
                className={`h-[18px] min-w-[28px] cursor-row-resize select-none rounded border border-[#c8c8c8] text-center text-[14px] font-bold leading-[14px] ${
                  isResizeHandleHover ? 'bg-gray-200' : 'bg-white'
                }`}
              >
                =
              </div>
            </div>
          )}

          <div className="overflow-hidden border border-[#d6d6d6] bg-white">
            <div className="flex h-[224px]">
              <div ref={tableScrollRef} className="min-w-0 flex-1 overflow-auto p-0">
                <TabularHeadingsTable
                  columns={safeColumns}
                  visibleRows={tableVisibleRows}
                  headings={safeHeadings}
                  tooltips={safeHelpText}
                  onChangeHeadings={next =>
                    applyModelUpdate(
                      safeColumns,
                      tableVisibleRows,
                      next,
                      safeFieldTypes,
                      safeHelpText,
                      safeDropdownOptionsText
                    )
                  }
                  activeColumn={activeColumn}
                  onActiveColumnChange={setActiveColumn}
                  onColumnsReorder={reorderColumns}
                  canAddColumnFromKeyboard={canAddColumns}
                  onAddColumnFromKeyboard={addColumn}
                  issues={showValidationErrors ? issues : []}
                  disabled={disabled}
                />
              </div>
              <div className="flex w-14 flex-col items-center justify-between border-l border-[#eee] bg-[#f3f3f5] px-2 pb-6 pt-14">
                <button
                  type="button"
                  aria-label={t('Add column')}
                  title={t('Add column')}
                  onClick={addColumn}
                  disabled={!canAddColumns}
                >
                  <AddIcon />
                </button>
                <button
                  type="button"
                  aria-label={t('Remove last column')}
                  title={t('Remove last column')}
                  onClick={removeLastColumn}
                  disabled={!canRemoveColumns}
                >
                  <MinusIcon />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
