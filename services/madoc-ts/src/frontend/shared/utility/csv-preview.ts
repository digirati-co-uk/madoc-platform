import Papa from 'papaparse';

export const CSV_PREVIEW_ROW_LIMIT = 100;

export type CsvPreviewResult =
  | { status: 'invalid' }
  | {
      status: 'parsed';
      headers: string[];
      rows: string[][];
      columnCount: number;
      hasMoreRows: boolean;
    };

export function isCsvFile(fileName: string, ...contentTypes: Array<string | undefined>): boolean {
  return (
    /\.csv$/i.test(fileName) ||
    contentTypes.some(contentType =>
      ['text/csv', 'application/csv', 'text/comma-separated-values'].includes(
        contentType?.split(';')[0].trim().toLowerCase() || ''
      )
    )
  );
}

export function parseCsvPreview(value: string): CsvPreviewResult {
  const result = Papa.parse<string[]>(value, {
    delimiter: ',',
    header: false,
    dynamicTyping: false,
    skipEmptyLines: false,
    // Keep the header and one extra data row to detect a truncated preview.
    preview: CSV_PREVIEW_ROW_LIMIT + 2,
  });

  if (result.errors.length) {
    return { status: 'invalid' };
  }

  const records = result.data;
  const lastRecord = records[records.length - 1];
  // Papa emits an extra empty record for a final line ending. Remove only that
  // record, preserving intentional blank rows, quoted empty values and cells.
  if (!result.meta.truncated && /[\r\n]$/.test(value) && lastRecord?.length === 1 && lastRecord[0] === '') {
    records.pop();
  }

  const headers = records[0] || [];
  const rows = records.slice(1, CSV_PREVIEW_ROW_LIMIT + 1);

  return {
    status: 'parsed',
    headers,
    rows,
    columnCount: rows.reduce((count, row) => Math.max(count, row.length), headers.length),
    hasMoreRows: records.length > CSV_PREVIEW_ROW_LIMIT + 1,
  };
}
