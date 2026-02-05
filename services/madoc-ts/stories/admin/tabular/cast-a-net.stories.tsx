import React, { useEffect, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { CanvasPanel, SimpleViewerProvider, useCanvas, VaultProvider } from 'react-iiif-vault';

import { CastANetCanvas } from '../../../src/frontend/admin/components/tabular/cast-a-net/CastANetCanvas';
import { CastANetOverlayAtlas } from '../../../src/frontend/admin/components/tabular/cast-a-net/CastANetOverlayAtlas';
import { TabularHeadingsTable } from '../../../src/frontend/admin/components/tabular/cast-a-net/TabularHeadingsTable';
import { clamp, makeEvenPositions } from '../../../src/frontend/admin/components/tabular/cast-a-net/utils';
import type { NetConfig } from '../../../src/frontend/admin/components/tabular/cast-a-net/types';

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

export const CanvasOnly: Story = {
  render: () => {
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
  },
};

export const TableOnly: Story = {
  render: () => {
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
  },
};

export const Combined: Story = {
  render: () => {
    const [net, setNet] = useState<NetConfig>({
      ...initial,
      cols: 6,
      colPositions: makeEvenPositions(6),
    });

    const [headings, setHeadings] = useState<string[]>(() => Array.from({ length: net.cols }, () => ''));

    const [activeCell, setActiveCell] = useState<{ row: number; col: number } | null>(null);
    const [dim, setDim] = useState(0);

    useEffect(() => {
      setHeadings(prev => Array.from({ length: net.cols }, (_, i) => prev[i] ?? ''));
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
    };

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
              <CanvasPanel.Viewer runtimeOptions={{ visibilityRatio: 1, maxUnderZoom: 1 }}>
                <CanvasPanel.RenderCanvas>
                  <CastANetOverlayAtlas value={net} onChange={setNet} activeCell={activeCell} dimOpacity={dim} />
                </CanvasPanel.RenderCanvas>
              </CanvasPanel.Viewer>
            </div>

            {/* Opacity control layer */}
            <div
              style={{
                position: 'absolute',
                top: 12,
                left: 12,
                zIndex: 50,
                background: 'rgba(255,255,255,0.85)',
                border: '1px solid #ddd',
                borderRadius: 8,
                padding: '10px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                pointerEvents: 'auto',
              }}
            >
              <label style={{ fontSize: 12, opacity: 0.9 }}>Canvas opacity</label>
              <input
                type="range"
                min={0}
                max={0.85}
                step={0.05}
                value={dim}
                onChange={e => setDim(Number(e.target.value))}
                style={{ width: 140 }}
              />
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
          <DebugWithDim net={net} headings={headings} dim={dim} />
        </AnySimpleViewerProvider>
      </div>
    );
  },
};

function DebugWithDim({ net, headings, dim }: { net: NetConfig; headings: string[]; dim: number }) {
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
          dimOpacity: clamp(dim, 0, 0.85),
          netPercent: net,
          netPixels: px,
          headings,
        },
        null,
        2
      )}
    </pre>
  );
}

export const Interactive: Story = Combined;
