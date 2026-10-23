import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { CsvPreview } from '../../../../src/frontend/shared/components/CsvPreview';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, values?: Record<string, string | number>) =>
      key.replace(/\{\{(\w+)\}\}/g, (_, name: string) => String(values?.[name] ?? '')),
  }),
}));

test('renders a CSV table during SSR without browser APIs or interpreting cell values as HTML', () => {
  const markup = renderToStaticMarkup(
    <CsvPreview fileName="data.csv" value={'ID,Value\n001,<script>alert(1)</script>'} />
  );
  expect(markup).toContain('<table');
  expect(markup).toContain('scope="col"');
  expect(markup).toContain('>001</td>');
  expect(markup).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
  expect(markup).not.toContain('<script>');
});
