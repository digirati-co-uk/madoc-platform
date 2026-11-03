/** @jest-environment jsdom */
import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { QueryCache, ReactQueryCacheProvider } from 'react-query';
import { FilePreview } from '../../../../src/frontend/shared/components/FilePreview';
import { CSV_PREVIEW_ROW_LIMIT } from '../../../../src/frontend/shared/utility/csv-preview';
import { createDownload } from '../../../../src/utility/create-download';

jest.mock('../../../../src/utility/create-download', () => ({ createDownload: jest.fn() }));
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, values?: Record<string, string | number>) =>
      key.replace(/\{\{(\w+)\}\}/g, (_, name: string) => String(values?.[name] ?? '')),
  }),
}));

let container: HTMLDivElement;
let root: Root;
let cache: QueryCache;

beforeEach(() => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  jest.clearAllMocks();
  container = document.createElement('div');
  root = createRoot(container);
  cache = new QueryCache({ defaultConfig: { queries: { retry: false, staleTime: Infinity } } });
});

afterEach(() => {
  act(() => root.unmount());
  cache.clear();
  Reflect.deleteProperty(globalThis, 'IS_REACT_ACT_ENVIRONMENT');
});

async function render(preview: React.ReactElement) {
  const providerProps = { queryCache: cache, children: preview };
  await act(async () => {
    root.render(<ReactQueryCacheProvider {...providerProps} />);
  });
}

function getButton(text: string): HTMLButtonElement {
  const button = Array.from(container.querySelectorAll('button')).find(item => item.textContent === text);
  if (!button) {
    throw new Error(`Button not found: ${text}`);
  }
  return button;
}

test('renders CSV headers and cells as text while downloading the exact original string', async () => {
  const value = '\uFEFFID,Label,Label,\r\n001,"<img src=x onerror=alert(1)>","line 1\nline 2",\r\n';
  await render(
    <FilePreview fileName="exports/contributions.CSV">{{ type: 'text', contentType: 'text/csv', value }}</FilePreview>
  );
  expect(Array.from(container.querySelectorAll('th')).map(cell => cell.textContent)).toEqual([
    'ID',
    'Label',
    'Label',
    '',
  ]);
  expect(Array.from(container.querySelectorAll('th')).every(cell => cell.scope === 'col')).toBe(true);
  expect(Array.from(container.querySelectorAll('td')).map(cell => cell.textContent)).toEqual([
    '001',
    '<img src=x onerror=alert(1)>',
    'line 1\nline 2',
    '',
  ]);
  expect(container.querySelector('img')).toBeNull();
  expect(container.querySelector('[role="region"]')?.getAttribute('tabindex')).toBe('0');
  act(() => getButton('Download').click());
  expect(createDownload).toHaveBeenCalledWith(value, 'contributions.CSV', 'text/csv');
});

test('detects a CSV content type without a CSV filename and retains text previews otherwise', async () => {
  await render(
    <FilePreview fileName="export" contentType="text/csv; charset=utf-8">
      {{ type: 'text', value: 'ID,Name\n001,Alice' }}
    </FilePreview>
  );
  expect(container.querySelector('td')?.textContent).toBe('001');

  await render(
    <FilePreview fileName="export.json" download={false}>
      {{ type: 'text', value: '{\n  "value": "001"\n}' }}
    </FilePreview>
  );
  expect(container.querySelector('table')).toBeNull();
  expect(container.textContent).toContain('  "value": "001"');
  expect(container.querySelectorAll('button')).toHaveLength(0);
});

test('renders at most the first 100 data rows and explains the preview limit', async () => {
  const value = ['ID', ...Array.from({ length: CSV_PREVIEW_ROW_LIMIT + 1000 }, (_, index) => `id-${index}`)].join('\n');
  await render(<FilePreview fileName="large.csv">{{ type: 'text', value }}</FilePreview>);
  expect(container.querySelectorAll('tbody tr')).toHaveLength(CSV_PREVIEW_ROW_LIMIT);
  expect(container.textContent).toContain('Showing the first 100 data rows.');
  expect(container.textContent).not.toContain('id-100');
  expect(getButton('Download')).toBeDefined();
});

test.each([
  ['', 'This CSV is empty.'],
  ['ID,Name\n', 'This CSV has column headers but no data rows.'],
  ['ID\n"unclosed', 'This CSV could not be displayed as a table.'],
])('handles empty, header-only and invalid CSV (%j)', async (value, message) => {
  await render(<FilePreview fileName="data.csv">{{ type: 'text', value }}</FilePreview>);
  expect(container.querySelectorAll('tbody tr')).toHaveLength(0);
  expect(container.textContent).toContain(message);
  expect(getButton('Download')).toBeDefined();
});

test('loads only when expanded and keeps downloads and collapse behavior', async () => {
  const value = 'ID\n001\n';
  const lazyLoad = jest.fn(async () => ({ type: 'text', value }));
  await render(<FilePreview fileName="lazy.csv" lazyLoad={lazyLoad} />);
  expect(lazyLoad).not.toHaveBeenCalled();
  expect(container.querySelector('table')).toBeNull();
  expect(container.textContent).not.toContain('Download');

  await act(async () => getButton('lazy.csv').click());
  expect(lazyLoad).toHaveBeenCalledTimes(1);
  expect(getButton('lazy.csv').getAttribute('aria-expanded')).toBe('true');
  expect(container.querySelector('td')?.textContent).toBe('001');
  act(() => getButton('Download').click());
  expect(createDownload).toHaveBeenCalledWith(value, 'lazy.csv', undefined);

  act(() => getButton('lazy.csv').click());
  expect(container.querySelector('table')).toBeNull();
  expect(container.textContent).not.toContain('Download');
  await act(async () => getButton('lazy.csv').click());
  expect(lazyLoad).toHaveBeenCalledTimes(1);
  expect(container.querySelector('td')?.textContent).toBe('001');
});

test('prefetches without expanding and offers a download while collapsed', async () => {
  const lazyLoad = jest.fn(async () => ({ type: 'text', contentType: 'text/csv', value: 'ID\n001' }));
  await render(<FilePreview fileName="prefetched" preFetch lazyLoad={lazyLoad} />);
  expect(lazyLoad).toHaveBeenCalledTimes(1);
  expect(container.querySelector('table')).toBeNull();
  expect(getButton('Download')).toBeDefined();
  expect(getButton('prefetched').getAttribute('aria-expanded')).toBe('false');
  await act(async () => getButton('prefetched').click());
  expect(container.querySelector('td')?.textContent).toBe('001');
});

test('keeps the missing-file state for a lazy preview', async () => {
  await render(<FilePreview fileName="missing.csv" lazyLoad={async () => null} />);
  await act(async () => getButton('missing.csv').click());
  expect(container.textContent).toContain('No file found');
  expect(container.textContent).not.toContain('Download');
  expect(container.querySelector('table')).toBeNull();
});
