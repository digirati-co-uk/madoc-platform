import { CSV_PREVIEW_ROW_LIMIT, isCsvFile, parseCsvPreview } from '../../../../src/frontend/shared/utility/csv-preview';

describe('CSV preview detection', () => {
  test.each([
    ['exports/contributions.CSV', undefined],
    ['export', 'text/csv; charset=utf-8'],
    ['export.txt', ' APPLICATION/CSV '],
    ['export', 'text/comma-separated-values'],
  ])('recognises %s with content type %s', (fileName, contentType) => {
    expect(isCsvFile(fileName, contentType)).toBe(true);
  });

  test('checks all supplied content types without guessing from text contents', () => {
    expect(isCsvFile('export.txt', 'text/plain', 'text/csv')).toBe(true);
    expect(isCsvFile('export.csv.json', 'application/json', 'text/plain')).toBe(false);
  });
});

describe('CSV preview parsing', () => {
  test('preserves string values, BOM, quoting, multiline values and duplicate or blank headers', () => {
    expect(
      parseCsvPreview(
        '\uFEFFID,Label,Label,,Value\r\n001,"comma, here","a ""quote""","line 1\r\nline 2",false\r\n002,,, ,=1+1\r\n'
      )
    ).toEqual({
      status: 'parsed',
      headers: ['ID', 'Label', 'Label', '', 'Value'],
      rows: [
        ['001', 'comma, here', 'a "quote"', 'line 1\r\nline 2', 'false'],
        ['002', '', '', ' ', '=1+1'],
      ],
      columnCount: 5,
      hasMoreRows: false,
    });
  });

  test.each(['\n', '\r\n', '\r'])('ignores only the final %j record separator', newline => {
    expect(parseCsvPreview(`Name,Value${newline}a,${newline},${newline}`)).toMatchObject({
      headers: ['Name', 'Value'],
      rows: [
        ['a', ''],
        ['', ''],
      ],
      hasMoreRows: false,
    });
  });

  test('retains intentional blank rows and a final quoted empty value', () => {
    expect(parseCsvPreview('Value\n\n""\n')).toMatchObject({ rows: [[''], ['']] });
    expect(parseCsvPreview('Value\n""')).toMatchObject({ rows: [['']] });
  });

  test.each(['', '\uFEFF'])('supports empty input %j', value => {
    expect(parseCsvPreview(value)).toEqual({
      status: 'parsed',
      headers: [],
      rows: [],
      columnCount: 0,
      hasMoreRows: false,
    });
  });

  test.each(['ID,Name', 'ID,Name\r\n'])('supports header-only input %j', value => {
    expect(parseCsvPreview(value)).toMatchObject({ headers: ['ID', 'Name'], rows: [], hasMoreRows: false });
  });

  test('keeps extra cells in uneven rows without rewriting headers', () => {
    expect(parseCsvPreview('ID\n001,extra\n002')).toEqual({
      status: 'parsed',
      headers: ['ID'],
      rows: [['001', 'extra'], ['002']],
      columnCount: 2,
      hasMoreRows: false,
    });
  });

  test.each([false, true])('bounds the preview with or without a final line ending (%s)', trailingNewline => {
    const data = Array.from({ length: CSV_PREVIEW_ROW_LIMIT + 5 }, (_, index) => `row-${index}`);
    const preview = parseCsvPreview(['ID', ...data].join('\n') + (trailingNewline ? '\n' : ''));
    expect(preview.status).toBe('parsed');
    if (preview.status !== 'parsed') {
      throw new Error('Expected a parsed preview');
    }
    expect(preview.rows).toHaveLength(CSV_PREVIEW_ROW_LIMIT);
    expect(preview.rows[CSV_PREVIEW_ROW_LIMIT - 1]).toEqual([`row-${CSV_PREVIEW_ROW_LIMIT - 1}`]);
    expect(preview.hasMoreRows).toBe(true);
  });

  test.each(['', '\n', '\r\n'])('does not count a final line ending as an extra data row (%j)', ending => {
    const rows = Array.from({ length: CSV_PREVIEW_ROW_LIMIT }, (_, index) => `${index}`);
    expect(parseCsvPreview(['ID', ...rows].join(ending || '\n') + ending)).toMatchObject({
      rows: rows.map(row => [row]),
      hasMoreRows: false,
    });
  });

  test('reports invalid quoting instead of silently showing partial values', () => {
    expect(parseCsvPreview('ID,Value\n001,"unclosed')).toEqual({ status: 'invalid' });
  });
});
