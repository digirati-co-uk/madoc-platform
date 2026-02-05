import React, { useEffect, useMemo, useRef, useState } from 'react';
import { CanvasPanel, SimpleViewerProvider } from 'react-iiif-vault';
import type { DefineTabularModelValue, TabularFieldType, TabularModelChange, TabularValidationIssue } from './types';
import { buildTabularModelPayload, validateTabularModel } from './TabularModel';
import { TabularHeadingsTable } from './TabularHeadingsTable';
import { TabularColumnEditor } from './TabularColumnEditor';
import { HomeIcon } from '../../../../shared/icons/HomeIcon';
import { MinusIcon } from '../../../../shared/icons/MinusIcon';
import { PlusIcon } from '../../../../shared/icons/PlusIcon';

const viewerButtonStyle: React.CSSProperties = {
  height: 34,
  minWidth: 34,
  border: '1px solid #d1d5db',
  borderRadius: 6,
  background: '#fff',
  color: '#3b82f6',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
};

function ReferenceImagePanel(props: { manifestId: string; canvasId?: string; imageHeight: number }) {
  const { manifestId, canvasId, imageHeight } = props;
  const runtime = useRef<any>(null);
  const AnySimpleViewerProvider = SimpleViewerProvider as unknown as React.FC<any>;

  const goHome = () => runtime.current?.world?.goHome?.();
  const zoomIn = () => runtime.current?.world?.zoomIn?.();
  const zoomOut = () => runtime.current?.world?.zoomOut?.();

  return (
    <div style={{ border: '1px solid #e5e5e5', borderRadius: 8, background: '#fff', overflow: 'hidden' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 12px',
          borderBottom: '1px solid #eee',
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 600 }}>Reference image</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" title="Home" onClick={goHome} style={viewerButtonStyle}>
            <HomeIcon />
          </button>
          <button type="button" title="Zoom out" onClick={zoomOut} style={viewerButtonStyle}>
            <MinusIcon />
          </button>
          <button type="button" title="Zoom in" onClick={zoomIn} style={viewerButtonStyle}>
            <PlusIcon />
          </button>
        </div>
      </div>

      <div style={{ height: imageHeight, background: '#e5e7eb' }}>
        <AnySimpleViewerProvider manifest={manifestId} canvas={canvasId}>
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
    defaultPreviewRows = 5,
    disabled = false,
  } = props;

  const requestedColumns = value.columns > 0 ? value.columns : defaultColumns;
  const requestedPreviewRows = value.previewRows > 0 ? value.previewRows : defaultPreviewRows;

  const safeColumns = Math.max(minColumns, Math.min(maxColumns, Math.floor(requestedColumns || 0)));
  const safePreviewRows = Math.max(minPreviewRows, Math.min(maxPreviewRows, Math.floor(requestedPreviewRows || 0)));
  const [activeColumn, setActiveColumn] = useState(0);
  const [imageHeight, setImageHeight] = useState(360);

  const safeHeadings = useMemo(
    () => Array.from({ length: safeColumns }, (_, i) => value.headings?.[i] ?? ''),
    [safeColumns, value.headings]
  );

  const safeFieldTypes = useMemo(
    () => Array.from({ length: safeColumns }, (_, i) => value.fieldTypes?.[i]),
    [safeColumns, value.fieldTypes]
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
  const usingDefaults = value.columns <= 0 || value.previewRows <= 0;

  const setColumns = (nextCols: number) => {
    const n = Math.max(minColumns, Math.min(maxColumns, Math.floor(nextCols)));
    onChange({
      ...value,
      columns: n,
      previewRows: safePreviewRows,
      headings: Array.from({ length: n }, (_, i) => safeHeadings[i] ?? ''),
      fieldTypes: Array.from({ length: n }, (_, i) => safeFieldTypes[i]),
      helpText: Array.from({ length: n }, (_, i) => safeHelpText[i]),
      saved: buildSavedFlags(n, false),
    });
  };

  const setPreviewRows = (nextRows: number) => {
    const n = Math.max(minPreviewRows, Math.min(maxPreviewRows, Math.floor(nextRows)));
    onChange({
      ...value,
      columns: safeColumns,
      previewRows: n,
      headings: safeHeadings,
      fieldTypes: safeFieldTypes,
      helpText: safeHelpText,
      saved: buildSavedFlags(safeColumns, false),
    });
  };

  const updateColumn = (index: number, next: { heading: string; fieldType?: TabularFieldType; helpText?: string }) => {
    const headings = safeHeadings.slice();
    const fieldTypes = safeFieldTypes.slice();
    const helpText = safeHelpText.slice();

    headings[index] = next.heading;
    fieldTypes[index] = next.fieldType;
    helpText[index] = next.helpText;

    onChange({
      ...value,
      columns: safeColumns,
      previewRows: safePreviewRows,
      headings,
      fieldTypes,
      helpText,
      saved: buildSavedFlags(safeColumns, false),
    });
  };

  const saveModel = () => {
    if (!canSaveModel) {
      return;
    }

    onChange({
      ...value,
      columns: safeColumns,
      previewRows: safePreviewRows,
      headings: safeHeadings,
      fieldTypes: safeFieldTypes,
      helpText: safeHelpText,
      saved: buildSavedFlags(safeColumns, true),
    });
  };

  const removeColumn = (index: number) => {
    const headings = safeHeadings.slice();
    const fieldTypes = safeFieldTypes.slice();
    const helpText = safeHelpText.slice();

    headings.splice(index, 1);
    fieldTypes.splice(index, 1);
    helpText.splice(index, 1);

    const nextCols = Math.max(minColumns, headings.length);

    onChange({
      ...value,
      columns: nextCols,
      previewRows: safePreviewRows,
      headings,
      fieldTypes,
      helpText,
      saved: buildSavedFlags(nextCols, false),
    });

    setActiveColumn(Math.max(0, Math.min(index, nextCols - 1)));
  };

  const addColumn = () => setColumns(safeColumns + 1);
  const removeLastColumn = () => setColumns(safeColumns - 1);

  return (
    <div style={{ display: 'grid', gap: 12, width: '100%' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: manifestId ? '1fr 1fr 1fr' : '1fr 1fr',
          gap: 10,
          padding: '10px 12px',
          border: '1px solid #e5e5e5',
          borderRadius: 8,
          background: '#fff',
        }}
      >
        <label style={{ display: 'grid', gap: 6 }}>
          <div style={{ fontSize: 12, opacity: 0.9 }}>Columns</div>
          <input
            type="number"
            min={minColumns}
            max={maxColumns}
            value={safeColumns}
            disabled={disabled}
            onChange={e => setColumns(Number(e.target.value))}
            style={{ height: 36, border: '1px solid #d4d4d4', borderRadius: 8, padding: '0 10px', fontSize: 13 }}
          />
        </label>

        <label style={{ display: 'grid', gap: 6 }}>
          <div style={{ fontSize: 12, opacity: 0.9 }}>Preview rows</div>
          <input
            type="number"
            min={minPreviewRows}
            max={maxPreviewRows}
            value={safePreviewRows}
            disabled={disabled}
            onChange={e => setPreviewRows(Number(e.target.value))}
            style={{ height: 36, border: '1px solid #d4d4d4', borderRadius: 8, padding: '0 10px', fontSize: 13 }}
          />
        </label>

        {manifestId ? (
          <label style={{ display: 'grid', gap: 6 }}>
            <div style={{ fontSize: 12, opacity: 0.9 }}>Image height</div>
            <input
              type="range"
              min={240}
              max={720}
              step={20}
              value={imageHeight}
              onChange={e => setImageHeight(Number(e.target.value))}
              style={{ height: 36 }}
            />
          </label>
        ) : null}
      </div>

      {usingDefaults ? (
        <div
          style={{
            padding: '8px 10px',
            border: '1px solid #e5e5e5',
            borderRadius: 8,
            background: '#fff',
            fontSize: 12,
            opacity: 0.85,
          }}
        >
          First-time setup loaded with defaults: {safeColumns} columns and {safePreviewRows} rows.
        </div>
      ) : null}

      {manifestId ? (
        <ReferenceImagePanel manifestId={manifestId} canvasId={canvasId} imageHeight={imageHeight} />
      ) : null}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) 360px',
          gap: 12,
          alignItems: 'start',
        }}
      >
        <div style={{ border: '1px solid #ddd', background: '#fff', overflow: 'hidden' }}>
          <TabularHeadingsTable
            columns={safeColumns}
            visibleRows={safePreviewRows}
            headings={safeHeadings}
            tooltips={safeHelpText}
            onChangeHeadings={next =>
              onChange({
                ...value,
                columns: safeColumns,
                previewRows: safePreviewRows,
                headings: next,
                fieldTypes: safeFieldTypes,
                helpText: safeHelpText,
                saved: buildSavedFlags(safeColumns, false),
              })
            }
            activeColumn={activeColumn}
            onActiveColumnChange={setActiveColumn}
            issues={issues}
            disabled={disabled}
          />
          <div style={{ display: 'flex', gap: 10, padding: 10, borderTop: '1px solid #eee' }}>
            <button type="button" onClick={addColumn} disabled={disabled || safeColumns >= maxColumns}>
              Add column
            </button>
            <button type="button" onClick={removeLastColumn} disabled={disabled || safeColumns <= minColumns}>
              Remove column
            </button>
            <button
              type="button"
              onClick={saveModel}
              disabled={disabled || !canSaveModel}
              style={{ marginLeft: 'auto' }}
            >
              {isModelSaved ? 'Model saved' : canSaveModel ? 'Save model' : 'Fix issues to save'}
            </button>
          </div>
        </div>

        <div>
          <TabularColumnEditor
            index={activeColumn}
            value={{
              heading: safeHeadings[activeColumn] ?? '',
              fieldType: safeFieldTypes[activeColumn],
              helpText: safeHelpText[activeColumn] ?? '',
            }}
            disabled={disabled}
            error={activeError}
            onChange={next => updateColumn(activeColumn, next)}
            onRemove={safeColumns > minColumns ? () => removeColumn(activeColumn) : undefined}
          />
        </div>
      </div>
    </div>
  );
}
