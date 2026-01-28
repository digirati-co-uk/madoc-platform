import React, { useEffect, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { VaultProvider } from 'react-iiif-vault';
import { CastANetCanvas } from '../../../src/frontend/admin/components/tabular/cast-a-net/CastANetCanvas';
import { CastANet } from '../../../src/frontend/admin/components/tabular/cast-a-net/CastANet';
import { TabularHeadingsTable } from '../../../src/frontend/admin/components/tabular/cast-a-net/TabularHeadingsTable';
import { makeEvenPositions } from '../../../src/frontend/admin/components/tabular/cast-a-net/utils';

// IIIF test manifest/canvas for stories.
const MANIFEST = 'https://iiif.ghentcdh.ugent.be/iiif/manifests/test:primitief_kadaster_leggers:GENT_B_0001-0172';
const CANVAS =
  'https://iiif.ghentcdh.ugent.be/iiif/manifests/test:primitief_kadaster_leggers:GENT_B_0001-0172/canvas/GENT_02_44802_44802_B_0001-0172_pages_11_12';
import type { NetConfig } from '../../../src/frontend/admin/components/tabular/cast-a-net/types';

const meta: Meta<typeof CastANet> = {
  title: 'Admin/Tabular/Cast a Net',
  component: CastANet,
  parameters: {
    layout: 'fullscreen',
  },
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
          onAddColumn={() => setCols(c => c + 1)}
          onRemoveColumn={() => setCols(c => Math.max(1, c - 1))}
        />
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

    return (
      <VaultProvider>
        <div style={{ padding: 12, display: 'grid', gap: 14 }}>
          <CastANetCanvas
            manifestId={MANIFEST}
            canvasId={CANVAS}
            value={net}
            onChange={setNet}
            dimOpacity={dim}
            onChangeDimOpacity={setDim}
            activeCell={activeCell}
          />

          <TabularHeadingsTable
            columns={net.cols}
            headings={headings}
            onChangeHeadings={setHeadings}
            visibleRows={5}
            onAddColumn={addColumn}
            onRemoveColumn={removeColumn}
            onHeadingFocus={({ col }) => setActiveCell({ row: 0, col })}
          />
        </div>
      </VaultProvider>
    );
  },
};
export const Interactive: Story = Combined;
