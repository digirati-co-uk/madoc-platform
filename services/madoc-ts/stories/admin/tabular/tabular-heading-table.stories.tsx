import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { DefineTabularModel } from '../../../src/frontend/admin/components/tabular/cast-a-net/DefineTabularModel';
import type {
  DefineTabularModelValue,
  TabularModelChange,
} from '../../../src/frontend/admin/components/tabular/cast-a-net/types';

const MANIFEST = 'https://iiif.ghentcdh.ugent.be/iiif/manifests/test:primitief_kadaster_leggers:GENT_B_0001-0172';
const CANVAS =
  'https://iiif.ghentcdh.ugent.be/iiif/manifests/test:primitief_kadaster_leggers:GENT_B_0001-0172/canvas/GENT_02_44802_44802_B_0001-0172_pages_11_12';

const meta: Meta<typeof DefineTabularModel> = {
  title: 'Admin/Tabular/Define Tabular Model',
  component: DefineTabularModel,
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof meta>;

function DebugPanel({ res }: { res: TabularModelChange | null }) {
  if (!res) return null;

  return (
    <div style={{ display: 'grid', gap: 10 }}>
      <div
        style={{
          padding: '10px 12px',
          border: '1px solid #e5e5e5',
          borderRadius: 8,
          background: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 10,
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 600 }}>Validation</div>
        <div style={{ fontSize: 12, opacity: 0.85 }}>
          {res.isValid ? 'Valid' : `${res.issues.length} issue${res.issues.length === 1 ? '' : 's'}`}
        </div>
      </div>

      <details style={{ border: '1px solid #e5e5e5', borderRadius: 8, background: '#fff', padding: '10px 12px' }}>
        <summary style={{ cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>Issues</summary>
        <pre style={{ margin: 0, paddingTop: 10, fontSize: 12, overflow: 'auto' }}>
          {JSON.stringify(res.issues, null, 2)}
        </pre>
      </details>

      <details style={{ border: '1px solid #e5e5e5', borderRadius: 8, background: '#fff', padding: '10px 12px' }}>
        <summary style={{ cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>Payload</summary>
        <pre style={{ margin: 0, paddingTop: 10, fontSize: 12, overflow: 'auto' }}>
          {JSON.stringify(res.payload, null, 2)}
        </pre>
      </details>
    </div>
  );
}

const FirstTimeEmptyStory: React.FC = () => {
  const [value, setValue] = useState<DefineTabularModelValue>({
    columns: 0,
    previewRows: 0,
    headings: [],
    fieldTypes: [],
    helpText: [],
    saved: [],
  });

  const [res, setRes] = useState<TabularModelChange | null>(null);

  return (
    <div style={{ display: 'grid', gap: 14, maxWidth: 1200 }}>
      <DefineTabularModel value={value} onChange={setValue} onModelChange={setRes} />
      <DebugPanel res={res} />
    </div>
  );
};

export const FirstTimeEmpty: Story = {
  render: () => <FirstTimeEmptyStory />,
};

const FilledAndSavedStory: React.FC = () => {
  const [value, setValue] = useState<DefineTabularModelValue>({
    columns: 5,
    previewRows: 8,
    headings: ['Name', 'Date', 'Reference', 'Notes', 'Language'],
    fieldTypes: ['text-field', 'dropdown-field', 'text-field', 'html-field', 'international-field'],
    helpText: ['', '', '', '', 'e.g. EN/NL/FR'],
    saved: [true, true, true, true, true],
  });

  const [res, setRes] = useState<TabularModelChange | null>(null);

  return (
    <div style={{ display: 'grid', gap: 14, maxWidth: 1200 }}>
      <DefineTabularModel value={value} onChange={setValue} onModelChange={setRes} />
      <DebugPanel res={res} />
    </div>
  );
};

export const FilledAndSaved: Story = {
  render: () => <FilledAndSavedStory />,
};

const WithErrorsStory: React.FC = () => {
  const [value, setValue] = useState<DefineTabularModelValue>({
    columns: 6,
    previewRows: 8,
    headings: [
      'Name',
      'name',
      '',
      'A very very very very very very very very very very very very very very very long heading',
      'Ref',
      'Ref',
    ],
    fieldTypes: ['text-field', 'text-field', undefined, undefined, 'text-field', undefined],
    helpText: ['', '', '', '', '', ''],
    saved: [true, true, true, true, true, true],
  });

  const [res, setRes] = useState<TabularModelChange | null>(null);

  return (
    <div style={{ display: 'grid', gap: 14, maxWidth: 1200 }}>
      <DefineTabularModel value={value} onChange={setValue} onModelChange={setRes} />
      <DebugPanel res={res} />
    </div>
  );
};

export const WithErrors: Story = {
  render: () => <WithErrorsStory />,
};

const WithReferenceImageStory: React.FC = () => {
  const [value, setValue] = useState<DefineTabularModelValue>({
    columns: 6,
    previewRows: 8,
    headings: ['', '', '', '', '', ''],
    fieldTypes: Array(6).fill(undefined),
    helpText: Array(6).fill(''),
    saved: Array(6).fill(false),
  });

  const [res, setRes] = useState<TabularModelChange | null>(null);

  return (
    <div style={{ display: 'grid', gap: 14, maxWidth: 1200 }}>
      <DefineTabularModel
        value={value}
        onChange={setValue}
        onModelChange={setRes}
        manifestId={MANIFEST}
        canvasId={CANVAS}
      />
      <DebugPanel res={res} />
    </div>
  );
};

export const WithReferenceImage: Story = {
  render: () => <WithReferenceImageStory />,
};
