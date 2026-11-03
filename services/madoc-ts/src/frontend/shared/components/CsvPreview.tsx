import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { parseCsvPreview } from '../utility/csv-preview';

interface CsvPreviewProps {
  value: string;
  fileName: string;
}

export function CsvPreview({ value, fileName }: CsvPreviewProps) {
  const { t } = useTranslation();
  const preview = useMemo(() => parseCsvPreview(value), [value]);

  if (preview.status === 'invalid') {
    return <p className="whitespace-normal p-4 text-gray-600">{t('This CSV could not be displayed as a table.')}</p>;
  }

  if (!preview.headers.length) {
    return <p className="whitespace-normal p-4 text-gray-600">{t('This CSV is empty.')}</p>;
  }

  const columns = Array.from({ length: preview.columnCount }, (_, index) => index);

  return (
    <div className="isolate whitespace-normal">
      <div
        className="max-h-[480px] overflow-auto focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600"
        role="region"
        aria-label={t('CSV preview: {{fileName}}', { fileName })}
        tabIndex={0}
      >
        <table className="w-full border-separate border-spacing-0 text-left text-sm text-gray-900">
          <caption className="sr-only">{fileName}</caption>
          <thead>
            <tr>
              {columns.map(column => (
                <th
                  key={column}
                  scope="col"
                  aria-label={preview.headers[column] || t('Column {{number}}', { number: column + 1 })}
                  className="sticky top-0 z-10 min-w-[10rem] max-w-[24rem] whitespace-pre-wrap border-b border-r border-gray-300 bg-gray-100 px-4 py-3 align-top font-semibold [overflow-wrap:anywhere]"
                >
                  {preview.headers[column]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {preview.rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {columns.map(column => (
                  <td
                    key={column}
                    className="min-w-[10rem] max-w-[24rem] whitespace-pre-wrap border-b border-r border-gray-200 bg-white px-4 py-3 align-top [overflow-wrap:anywhere]"
                  >
                    {row[column]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="m-0 border-t border-gray-200 bg-gray-50 px-4 py-3 text-gray-600">
        {preview.hasMoreRows
          ? t('Showing the first {{count}} data rows. Download the file to view all rows.', {
              count: preview.rows.length,
            })
          : preview.rows.length
            ? t(preview.rows.length === 1 ? 'Showing {{count}} data row.' : 'Showing {{count}} data rows.', {
                count: preview.rows.length,
              })
            : t('This CSV has column headers but no data rows.')}
      </p>
    </div>
  );
}
