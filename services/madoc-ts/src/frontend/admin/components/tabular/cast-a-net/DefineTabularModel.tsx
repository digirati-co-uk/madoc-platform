import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CanvasPanel, SimpleViewerProvider } from 'react-iiif-vault';
import type { DefineTabularModelValue, TabularFieldType, TabularModelChange, TabularValidationIssue } from './types';
import { buildTabularModelPayload, validateTabularModel } from './TabularModel';
import { TabularHeadingsTable } from './TabularHeadingsTable';
import { TabularColumnEditor } from './TabularColumnEditor';
import { Button } from '../../../../shared/navigation/Button';
import { TabularCanvasViewportControls } from '../../../../shared/components/TabularCanvasViewportControls';
import { AddIcon } from '../../../../shared/icons/AddIcon';
import { MinusIcon } from '../../../../shared/icons/MinusIcon';

function ReferenceImagePanel(props: { manifestId: string; canvasId?: string; imageHeight: number }) {
  const { manifestId, canvasId, imageHeight } = props;
  const runtime = useRef<any>(null);
  const AnySimpleViewerProvider = SimpleViewerProvider as unknown as React.FC<any>;

  const goHome = () => runtime.current?.world?.goHome?.();
  const zoomIn = () => runtime.current?.world?.zoomIn?.();
  const zoomOut = () => runtime.current?.world?.zoomOut?.();

  return (
    <div style={{ border: '1px solid #e5e5e5', borderRadius: 8, background: '#fff', overflow: 'hidden' }}>
      <div style={{ height: imageHeight, background: '#e5e7eb', position: 'relative' }}>
        <TabularCanvasViewportControls
          onHome={goHome}
          onZoomOut={zoomOut}
          onZoomIn={zoomIn}
          style={{ top: 12, right: 12, zIndex: 40 }}
        />
        <AnySimpleViewerProvider manifest={manifestId} startCanvas={canvasId}>
          <CanvasPanel.Viewer
            runtimeOptions={{ maxOverZoom: 5, visibilityRatio: 1, maxUnderZoom: 1 }}
            onCreated={(preset: any) => {
              runtime.current = preset.runtime;
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
  const [isResizeHandleHover, setIsResizeHandleHover] = useState(false);
  const tableScrollRef = useRef<HTMLDivElement>(null);
  const shouldScrollToNewColumnRef = useRef(false);
  const tableVisibleRows = 4;
  const tableHeight = 54 + 42 * tableVisibleRows + 2;

  const safeHeadings = useMemo(
    () => Array.from({ length: safeColumns }, (_, i) => value.headings?.[i] ?? ''),
    [safeColumns, value.headings]
  );

  const safeFieldTypes = useMemo(
    () => Array.from({ length: safeColumns }, (_, i) => value.fieldTypes?.[i] ?? defaultFieldType),
    [safeColumns, value.fieldTypes, defaultFieldType]
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
    fieldTypes[index] = next.fieldType ?? defaultFieldType;
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
  const removeLastColumn = () => setColumns(safeColumns - 1);
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>
      {attemptedSave && issues.length ? (
        <div
          style={{
            padding: '10px 12px',
            border: '1px solid #fecaca',
            borderRadius: 8,
            background: '#fff1f2',
            color: '#9f1239',
            fontSize: 13,
          }}
        >
          {topErrorMessage}
        </div>
      ) : null}

      <div style={{ display: 'grid', gridTemplateColumns: '280px minmax(0, 1fr)', gap: 16, alignItems: 'stretch' }}>
        <div style={{ border: '1px solid #d6d6d6', borderRadius: 4, background: '#f4f4f4', padding: 12 }}>
          <div style={{ fontWeight: 500, fontSize: 16, lineHeight: 1, marginBottom: 14 }}>{t('Tabular document')}</div>
          <div style={{ borderTop: '1px solid #d7d7d7', marginTop: 10, paddingTop: 18 }}>
            <div
              style={{
                padding: 12,
                background: '#dfe5ff',
                borderRadius: 4,
                color: '#1f2d5a',
                fontSize: 14,
                lineHeight: 1.35,
              }}
            >
              Click a cell to add a heading. Any cell with text will be treated as a header cell in your capture model.
            </div>
          </div>

          <div style={{ marginTop: 12 }}>
            <TabularColumnEditor
              index={activeColumn}
              value={{
                heading: safeHeadings[activeColumn] ?? '',
                fieldType: safeFieldTypes[activeColumn],
                helpText: safeHelpText[activeColumn] ?? '',
              }}
              disabled={disabled}
              error={attemptedSave ? activeError : undefined}
              onChange={next => updateColumn(activeColumn, next)}
            />
          </div>

          <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-start' }}>
            <Button $primary type="button" onClick={saveModel} disabled={disabled}>
              {isModelSaved ? 'Model saved' : 'Save model'}
            </Button>
          </div>
        </div>

        <div style={{ display: 'grid', gap: 12 }}>
          {manifestId ? (
            <ReferenceImagePanel manifestId={manifestId} canvasId={canvasId} imageHeight={imageHeight} />
          ) : null}

          {manifestId && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: -4 }}>
              <div
                role="separator"
                aria-orientation="horizontal"
                aria-label={t('Resize image and table')}
                onMouseDown={startResize}
                onMouseEnter={() => setIsResizeHandleHover(true)}
                onMouseLeave={() => setIsResizeHandleHover(false)}
                style={{
                  height: 18,
                  minWidth: 28,
                  border: '1px solid #c8c8c8',
                  borderRadius: 4,
                  background: isResizeHandleHover ? '#e5e7eb' : '#fff',
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
          )}

          <div style={{ border: '1px solid #d6d6d6', background: '#fff', overflow: 'hidden' }}>
            <div style={{ display: 'flex', height: tableHeight }}>
              <div ref={tableScrollRef} style={{ flex: 1, minWidth: 0, overflow: 'auto', padding: 0 }}>
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
                  issues={attemptedSave ? issues : []}
                  disabled={disabled}
                />
              </div>
              <div
                style={{
                  width: 56,
                  borderLeft: '1px solid #eee',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '56px 8px 24px',
                  background: '#f3f3f5',
                }}
              >
                <button type="button" onClick={addColumn} disabled={disabled || safeColumns >= maxColumns}>
                  <AddIcon />
                </button>
                <button type="button" onClick={removeLastColumn} disabled={disabled || safeColumns <= minColumns}>
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
