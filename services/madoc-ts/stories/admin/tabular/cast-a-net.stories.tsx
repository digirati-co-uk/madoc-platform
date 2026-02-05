import React, { useEffect, useMemo, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { CanvasPanel, SimpleViewerProvider, useCanvas, VaultProvider } from 'react-iiif-vault';

import { CastANetCanvas } from '../../../src/frontend/admin/components/tabular/cast-a-net/CastANetCanvas';
import { CastANetOverlayAtlas } from '../../../src/frontend/admin/components/tabular/cast-a-net/CastANetOverlayAtlas';
import { buildTabularProjectSetupPayload } from '../../../src/frontend/admin/components/tabular/cast-a-net/CastANetStructure';
import { TabularHeadingsTable } from '../../../src/frontend/admin/components/tabular/cast-a-net/TabularHeadingsTable';
import { buildTabularModelPayload } from '../../../src/frontend/admin/components/tabular/cast-a-net/TabularModel';
import {
  NET_DIM_STEP,
  NET_MAX_DIM_OPACITY,
  clampDimOpacity,
  dimOpacityToPercent,
  makeEvenPositions,
} from '../../../src/frontend/admin/components/tabular/cast-a-net/utils';
import type { NetConfig, TabularCellRef } from '../../../src/frontend/admin/components/tabular/cast-a-net/types';
import { CanvasViewerButton, CanvasViewerControls } from '../../../src/frontend/shared/atoms/CanvasViewerGrid';
import { HomeIcon } from '../../../src/frontend/shared/icons/HomeIcon';
import { MinusIcon } from '../../../src/frontend/shared/icons/MinusIcon';
import { PlusIcon } from '../../../src/frontend/shared/icons/PlusIcon';

// IIIF test manifest/canvas for stories.
const MANIFEST = 'https://iiif.ghentcdh.ugent.be/iiif/manifests/test:primitief_kadaster_leggers:GENT_B_0001-0172';
const CANVAS =
  'https://iiif.ghentcdh.ugent.be/iiif/manifests/test:primitief_kadaster_leggers:GENT_B_0001-0172/canvas/GENT_02_44802_44802_B_0001-0172_pages_11_12';

const meta: Meta<typeof CastANetCanvas> = {
  title: 'Admin/Tabular/Cast a Net',
  component: CastANetCanvas,
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof meta>;

const initial: NetConfig = {
  rows: 4,
  cols: 4,
  top: 10,
  left: 10,
  width: 70,
  height: 70,
  rowPositions: [25, 50, 75],
  colPositions: [25, 50, 75],
};

const CanvasOnlyStory: React.FC = () => {
  const [net, setNet] = useState<NetConfig>(initial);
  const [dim, setDim] = useState(0);

  return (
    <VaultProvider>
      <div style={{ padding: 12 }}>
        <CastANetCanvas
          manifestId={MANIFEST}
          canvasId={CANVAS}
          value={net}
          onChange={setNet}
          dimOpacity={dim}
          onChangeDimOpacity={setDim}
        />
      </div>
    </VaultProvider>
  );
};

export const CanvasOnly: Story = {
  render: () => <CanvasOnlyStory />,
};

const TableOnlyStory: React.FC = () => {
  const [cols, setCols] = useState(6);
  const [headings, setHeadings] = useState<string[]>(() => Array.from({ length: cols }, () => ''));
  const [activeColumn, setActiveColumn] = useState(0);

  useEffect(() => {
    setHeadings(prev => Array.from({ length: cols }, (_, i) => prev[i] ?? ''));
  }, [cols]);

  return (
    <div style={{ padding: 12, maxWidth: 1100 }}>
      <TabularHeadingsTable
        columns={cols}
        headings={headings}
        onChangeHeadings={setHeadings}
        visibleRows={5}
        activeColumn={activeColumn}
        onActiveColumnChange={setActiveColumn}
      />
      <div style={{ display: 'flex', gap: 10, padding: '10px 0' }}>
        <button type="button" onClick={() => setCols(c => c + 1)}>
          Add column
        </button>
        <button type="button" onClick={() => setCols(c => Math.max(1, c - 1))}>
          Remove column
        </button>
      </div>
    </div>
  );
};

export const TableOnly: Story = {
  render: () => <TableOnlyStory />,
};

const DEFAULT_BLANK_COLUMN_INDEXES = [2];

const CombinedStory: React.FC = () => {
  const [net, setNet] = useState<NetConfig>({
    ...initial,
    cols: 6,
    colPositions: makeEvenPositions(6),
  });

  const [headings, setHeadings] = useState<string[]>(() => Array.from({ length: net.cols }, () => ''));
  const [fieldTypes, setFieldTypes] = useState<Array<string | undefined>>(() =>
    Array.from({ length: net.cols }, () => 'text-field')
  );

  const [activeCell, setActiveCell] = useState<TabularCellRef | null>(null);
  const [dim, setDim] = useState(0);
  const blankColumnIndexes = DEFAULT_BLANK_COLUMN_INDEXES;

  useEffect(() => {
    setHeadings(prev => Array.from({ length: net.cols }, (_, i) => prev[i] ?? ''));
    setFieldTypes(prev => Array.from({ length: net.cols }, (_, i) => prev[i] ?? 'text-field'));
  }, [net.cols]);

  const addColumn = () => {
    const cols = net.cols + 1;
    setNet(prev => ({ ...prev, cols, colPositions: makeEvenPositions(cols) }));
  };

  const removeColumn = () => {
    if (net.cols <= 1) return;
    const cols = net.cols - 1;
    setNet(prev => ({ ...prev, cols, colPositions: makeEvenPositions(cols) }));
    setHeadings(prev => prev.slice(0, cols));
    setFieldTypes(prev => prev.slice(0, cols));
  };

  const modelPayload = useMemo(
    () =>
      buildTabularModelPayload(headings, {
        fieldTypes,
        saved: Array.from({ length: headings.length }, (_, i) => blankColumnIndexes.indexOf(i) === -1),
      }),
    [headings, fieldTypes, blankColumnIndexes]
  );

  const tabularSetupPayload = useMemo(
    () => buildTabularProjectSetupPayload(net, modelPayload, { blankColumnIndexes }),
    [net, modelPayload, blankColumnIndexes]
  );
  const [runtime, setRuntime] = useState<any>(null);

  const goHome = () => runtime?.world?.goHome?.();
  const zoomIn = () => runtime?.world?.zoomIn?.();
  const zoomOut = () => runtime?.world?.zoomOut?.();
  const safeDim = clampDimOpacity(dim);
  const dimPercent = dimOpacityToPercent(dim);

  // Avoid TS friction if `canvas` isn't typed on SimpleViewerProvider in this repo.
  const AnySimpleViewerProvider = SimpleViewerProvider as unknown as React.FC<any>;

  return (
    <div style={{ padding: 12, display: 'grid', gap: 14 }}>
      <AnySimpleViewerProvider manifest={MANIFEST} canvas={CANVAS}>
        <div
          style={{
            border: '1px solid #ddd',
            height: 520,
            position: 'relative',
            background: '#fff',
            overflow: 'hidden',
          }}
        >
          {/* Viewer layer */}
          <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
            <CanvasPanel.Viewer
              runtimeOptions={{ maxOverZoom: 5, visibilityRatio: 1, maxUnderZoom: 1 }}
              onCreated={(preset: any) => setRuntime(preset.runtime)}
            >
              <CanvasPanel.RenderCanvas>
                <CastANetOverlayAtlas value={net} onChange={setNet} activeCell={activeCell} dimOpacity={dim} />
              </CanvasPanel.RenderCanvas>
            </CanvasPanel.Viewer>
          </div>

          <CanvasViewerControls style={{ top: 12, right: 12, zIndex: 60 }}>
            <CanvasViewerButton type="button" title="Home" onClick={goHome}>
              <HomeIcon />
            </CanvasViewerButton>
            <CanvasViewerButton type="button" title="Zoom out" onClick={zoomOut}>
              <MinusIcon />
            </CanvasViewerButton>
            <CanvasViewerButton type="button" title="Zoom in" onClick={zoomIn}>
              <PlusIcon />
            </CanvasViewerButton>
          </CanvasViewerControls>

          {/* Opacity control layer */}
          <div
            style={{
              position: 'absolute',
              top: 12,
              left: 12,
              zIndex: 50,
              background: 'rgba(255,255,255,0.95)',
              border: '1px solid #ddd',
              borderRadius: 8,
              padding: '10px 12px',
              display: 'grid',
              gap: 8,
              minWidth: 220,
              pointerEvents: 'auto',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
              <label style={{ fontSize: 12, fontWeight: 600, opacity: 0.95 }}>Canvas opacity</label>
              <span
                style={{
                  fontSize: 11,
                  border: '1px solid #d4d4d8',
                  borderRadius: 999,
                  padding: '2px 8px',
                  background: '#fff',
                }}
              >
                {dimPercent}%
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={NET_MAX_DIM_OPACITY}
              step={NET_DIM_STEP}
              value={safeDim}
              onChange={e => setDim(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#4A64E1' }}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                onClick={() => setDim(0)}
                style={{
                  border: '1px solid #d4d4d8',
                  background: '#fff',
                  borderRadius: 6,
                  padding: '4px 8px',
                  fontSize: 12,
                  cursor: 'pointer',
                }}
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => setDim(clampDimOpacity(safeDim - NET_DIM_STEP))}
                style={{
                  border: '1px solid #d4d4d8',
                  background: '#fff',
                  borderRadius: 6,
                  padding: '4px 8px',
                  fontSize: 12,
                  cursor: 'pointer',
                }}
              >
                -5%
              </button>
              <button
                type="button"
                onClick={() => setDim(clampDimOpacity(safeDim + NET_DIM_STEP))}
                style={{
                  border: '1px solid #d4d4d8',
                  background: '#fff',
                  borderRadius: 6,
                  padding: '4px 8px',
                  fontSize: 12,
                  cursor: 'pointer',
                }}
              >
                +5%
              </button>
            </div>
          </div>
        </div>

        <TabularHeadingsTable
          columns={net.cols}
          headings={headings}
          onChangeHeadings={setHeadings}
          visibleRows={5}
          activeColumn={activeCell?.col ?? 0}
          onActiveColumnChange={col => setActiveCell({ row: 0, col })}
        />
        <div style={{ display: 'flex', gap: 10, padding: '10px 0' }}>
          <button type="button" onClick={addColumn}>
            Add column
          </button>
          <button type="button" onClick={removeColumn}>
            Remove column
          </button>
        </div>

        {/* Debug output INSIDE viewer context so useCanvas() works */}
        <DebugWithDim net={net} headings={headings} dim={dim} tabularSetupPayload={tabularSetupPayload} />
      </AnySimpleViewerProvider>
    </div>
  );
};

export const Combined: Story = {
  render: () => <CombinedStory />,
};

function DebugWithDim({
  net,
  headings,
  dim,
  tabularSetupPayload,
}: {
  net: NetConfig;
  headings: string[];
  dim: number;
  tabularSetupPayload: ReturnType<typeof buildTabularProjectSetupPayload>;
}) {
  const canvas = useCanvas();
  if (!canvas) return null;

  const px = {
    left: (net.left / 100) * canvas.width,
    top: (net.top / 100) * canvas.height,
    width: (net.width / 100) * canvas.width,
    height: (net.height / 100) * canvas.height,
  };

  return (
    <pre
      style={{
        marginTop: 12,
        padding: 12,
        background: '#111',
        color: '#eee',
        borderRadius: 8,
        overflow: 'auto',
        maxWidth: 1100,
      }}
    >
      {JSON.stringify(
        {
          canvas: { id: canvas.id, width: canvas.width, height: canvas.height },
          dimOpacity: clampDimOpacity(dim),
          netPercent: net,
          netPixels: px,
          headings,
          tabularSetupPayload,
        },
        null,
        2
      )}
    </pre>
  );
}

export const Interactive: Story = Combined;
