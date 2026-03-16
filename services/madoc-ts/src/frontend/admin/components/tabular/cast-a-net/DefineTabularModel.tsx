import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CanvasPanel, SimpleViewerProvider } from 'react-iiif-vault';
import type { DefineTabularModelValue, TabularFieldType, TabularModelChange, TabularValidationIssue } from './types';
import { buildTabularModelPayload, validateTabularModel } from './TabularModel';
import { TabularHeadingsTable } from './TabularHeadingsTable';
import { TabularColumnEditor } from './TabularColumnEditor';
import { Button } from '@/frontend/shared/navigation/Button';
import { TabularCanvasViewportControls } from '@/frontend/shared/components/TabularCanvasViewportControls';
import { AddIcon } from '@/frontend/shared/icons/AddIcon';
import { MinusIcon } from '@/frontend/shared/icons/MinusIcon';

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
  const runtime = useRef<any>(null);
  const initialZoomAppliedRef = useRef(false);
  const initialZoomFrameRef = useRef<number | null>(null);
  const AnySimpleViewerProvider = SimpleViewerProvider as unknown as React.FC<any>;
  const viewerKey = `${manifestId}::${canvasId ?? ''}`;
  const INITIAL_MODEL_CANVAS_ZOOM_FACTOR = 0.68;

  const goHome = () => runtime.current?.world?.goHome?.();
  const zoomIn = () => runtime.current?.world?.zoomIn?.();
  const zoomOut = () => runtime.current?.world?.zoomOut?.();

  useEffect(() => {
    initialZoomAppliedRef.current = false;
    if (typeof window !== 'undefined' && initialZoomFrameRef.current !== null) {
      window.cancelAnimationFrame(initialZoomFrameRef.current);
      initialZoomFrameRef.current = null;
    }

    return () => {
      if (typeof window !== 'undefined' && initialZoomFrameRef.current !== null) {
        window.cancelAnimationFrame(initialZoomFrameRef.current);
      }
      initialZoomFrameRef.current = null;
    };
  }, [viewerKey]);

  const applyInitialZoom = (currentRuntime: any) => {
    if (!currentRuntime || initialZoomAppliedRef.current) {
      return;
    }

    if (typeof currentRuntime.getViewport === 'function' && typeof currentRuntime.setViewport === 'function') {
      const viewport = currentRuntime.getViewport();
      if (viewport && viewport.width > 0 && viewport.height > 0) {
        const nextWidth = viewport.width * INITIAL_MODEL_CANVAS_ZOOM_FACTOR;
        const nextHeight = viewport.height * INITIAL_MODEL_CANVAS_ZOOM_FACTOR;
        const nextX = viewport.x + (viewport.width - nextWidth) / 2;
        const nextY = viewport.y;
        currentRuntime.setViewport({
          x: nextX,
          y: nextY,
          width: nextWidth,
          height: nextHeight,
        });
      }
    } else {
      currentRuntime.world?.zoomIn?.();
    }

    currentRuntime.updateNextFrame?.();
    initialZoomAppliedRef.current = true;
  };

  return (
    <div className="overflow-hidden rounded-lg border border-[#e5e5e5] bg-white">
      <div className="relative bg-white" style={{ height: imageHeight }}>
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
            runtimeOptions={{ maxOverZoom: 5, visibilityRatio: 1, maxUnderZoom: 1 }}
            onCreated={(preset: any) => {
              runtime.current = preset.runtime;
              if (typeof window !== 'undefined') {
                if (initialZoomFrameRef.current !== null) {
                  window.cancelAnimationFrame(initialZoomFrameRef.current);
                }
                initialZoomFrameRef.current = window.requestAnimationFrame(() => {
                  applyInitialZoom(runtime.current);
                  initialZoomFrameRef.current = null;
                });
              } else {
                applyInitialZoom(runtime.current);
              }
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
    manifestId,
    canvasId,
    minColumns = 1,
    maxColumns = 50,
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
  const defaultFieldType = 'text-field' as TabularFieldType;

  const safeColumns = Math.max(minColumns, Math.min(maxColumns, Math.floor(requestedColumns || 0)));
  const safePreviewRows = Math.max(minPreviewRows, Math.min(maxPreviewRows, Math.floor(requestedPreviewRows || 0)));
  const [activeColumn, setActiveColumn] = useState(0);
  const [imageHeight, setImageHeight] = useState(300);
  const [attemptedSave, setAttemptedSave] = useState(false);
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
    () => Array.from({ length: safeColumns }, () => defaultFieldType),
    [safeColumns, defaultFieldType]
  );

  const safeHelpText = useMemo(
    () => Array.from({ length: safeColumns }, (_, i) => value.helpText?.[i]),
    [safeColumns, value.helpText]
  );

  const safeSaved = useMemo(
    () => Array.from({ length: safeColumns }, (_, i) => value.saved?.[i] ?? false),
    [safeColumns, value.saved]
  );

  const buildSavedFlags = (length: number, saved: boolean) => Array.from({ length }, () => saved);

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

  const canSaveModel = issues.length === 0;
  const isModelSaved = canSaveModel && safeSaved.length > 0 && safeSaved.every(Boolean);

  const payload = useMemo(
    () =>
      buildTabularModelPayload(safeHeadings, {
        fieldTypes: safeFieldTypes,
        helpText: safeHelpText,
        saved: safeSaved,
      }),
    [safeHeadings, safeFieldTypes, safeHelpText, safeSaved]
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
    onChange({
      ...value,
      columns: n,
      previewRows: safePreviewRows,
      headings: Array.from({ length: n }, (_, i) => safeHeadings[i] ?? ''),
      fieldTypes: Array.from({ length: n }, (_, i) => safeFieldTypes[i] ?? defaultFieldType),
      helpText: Array.from({ length: n }, (_, i) => safeHelpText[i]),
      saved: buildSavedFlags(n, false),
    });
  };

  const updateColumn = (index: number, next: { heading: string; fieldType?: TabularFieldType; helpText?: string }) => {
    const headings = safeHeadings.slice();
    const fieldTypes = safeFieldTypes.slice();
    const helpText = safeHelpText.slice();

    headings[index] = next.heading;
    fieldTypes[index] = defaultFieldType;
    helpText[index] = next.helpText;

    onChange({
      ...value,
      columns: safeColumns,
      previewRows: 4,
      headings,
      fieldTypes,
      helpText,
      saved: buildSavedFlags(safeColumns, false),
    });
  };

  const saveModel = () => {
    setAttemptedSave(true);
    if (!canSaveModel) {
      return;
    }

    const nextValue = {
      ...value,
      columns: safeColumns,
      previewRows: safePreviewRows,
      headings: safeHeadings,
      fieldTypes: safeFieldTypes,
      helpText: safeHelpText,
      saved: buildSavedFlags(safeColumns, true),
    };

    onChange(nextValue);
  };

  const addColumn = () => {
    if (safeColumns >= maxColumns) {
      return;
    }
    shouldScrollToNewColumnRef.current = true;
    setActiveColumn(safeColumns);
    setColumns(safeColumns + 1);
  };
  const removeColumnAt = (columnIndex: number) => {
    if (safeColumns <= minColumns) {
      return;
    }

    const nextColumns = safeColumns - 1;
    const headings = safeHeadings.filter((_, index) => index !== columnIndex);
    const fieldTypes = safeFieldTypes.filter((_, index) => index !== columnIndex);
    const helpText = safeHelpText.filter((_, index) => index !== columnIndex);

    onChange({
      ...value,
      columns: nextColumns,
      previewRows: safePreviewRows,
      headings,
      fieldTypes,
      helpText,
      saved: buildSavedFlags(nextColumns, false),
    });
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

    onChange({
      ...value,
      columns: safeColumns,
      previewRows: tableVisibleRows,
      headings: reorderArray(safeHeadings, sourceColumnIndex, targetColumnIndex),
      fieldTypes: reorderArray(safeFieldTypes, sourceColumnIndex, targetColumnIndex),
      helpText: reorderArray(safeHelpText, sourceColumnIndex, targetColumnIndex),
      saved: buildSavedFlags(safeColumns, false),
    });

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
      {attemptedSave && issues.length ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-[10px] text-[13px] text-rose-800">
          {topErrorMessage}
        </div>
      ) : null}

      <div className="grid grid-cols-[280px_minmax(0,1fr)] items-stretch gap-4">
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
                <ul className="list-disc space-y-1 pl-4 text-xs text-[#1f2d5a]">
                  <li>{t('* indicates required fields.')}</li>
                  <li>{t('Heading length up to {{maxHeadingLength}} characters.', { maxHeadingLength })}</li>
                  <li>{t('Min columns {{minColumns}}, max columns {{maxColumns}}.', { minColumns, maxColumns })}</li>
                  <li>{t('Each heading label must be unique in this tabular model.')}</li>
                  <li>
                    {t(
                      'Remove column in heading metadata removes the selected column. The minus button beside the table removes the last column only.'
                    )}
                  </li>
                </ul>
                <div className="mt-2 text-sm">
                  {t(
                    'Click a cell to add a heading. Drag heading cells to reposition columns. Any non-empty cell is treated as a header cell in your capture model.'
                  )}
                </div>
              </div>
            ) : null}
          </div>

          <div className="mt-3">
            <TabularColumnEditor
              index={activeColumn}
              value={{
                heading: safeHeadings[activeColumn] ?? '',
                fieldType: safeFieldTypes[activeColumn],
                helpText: safeHelpText[activeColumn] ?? '',
              }}
              disabled={disabled}
              error={attemptedSave ? activeError : undefined}
              maxHeadingLength={maxHeadingLength}
              onChange={next => updateColumn(activeColumn, next)}
              onRemove={() => removeColumnAt(activeColumn)}
              removeDisabled={safeColumns <= minColumns}
            />
            <div className="mt-2 text-[11px] leading-4 text-slate-600">
              {t(
                'Remove column removes the selected column in the heading metadata. The minus button beside the table removes the last column only.'
              )}
            </div>
          </div>

          <div className="mt-3 flex justify-start">
            <Button $primary type="button" onClick={saveModel} disabled={disabled}>
              {isModelSaved ? 'Model saved' : 'Save model'}
            </Button>
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
                    onChange({
                      ...value,
                      columns: safeColumns,
                      previewRows: tableVisibleRows,
                      headings: next,
                      fieldTypes: safeFieldTypes,
                      helpText: safeHelpText,
                      saved: buildSavedFlags(safeColumns, false),
                    })
                  }
                  activeColumn={activeColumn}
                  onActiveColumnChange={setActiveColumn}
                  onColumnsReorder={reorderColumns}
                  issues={attemptedSave ? issues : []}
                  disabled={disabled}
                />
              </div>
              <div className="flex w-14 flex-col items-center justify-between border-l border-[#eee] bg-[#f3f3f5] px-2 pb-6 pt-14">
                <button
                  type="button"
                  aria-label={t('Add column')}
                  title={t('Add column')}
                  onClick={addColumn}
                  disabled={disabled || safeColumns >= maxColumns}
                >
                  <AddIcon />
                </button>
                <button
                  type="button"
                  aria-label={t('Remove last column')}
                  title={t('Remove last column')}
                  onClick={removeLastColumn}
                  disabled={disabled || safeColumns <= minColumns}
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
