import {
  changedRange,
  compileMask,
  editMask,
  maskComplete,
  readMask,
  renderMask,
} from '../../../../src/frontend/shared/utility/input-mask';
import {
  getGuidedValueIssue,
  numberFits,
  resolveGuidedFormat,
  validateTextFieldSettings,
} from '../../../../src/frontend/shared/utility/guided-formats';

function mask(pattern = 'DD-MM-YYYY', custom = false) {
  const compiled = compileMask(pattern, custom);
  if (typeof compiled === 'string') throw new Error(compiled);
  return compiled;
}

it('adds separators without padding or dropping data, including a full paste beginning with 5', () => {
  expect(editMask(mask(), '', 0, 0, '25122024')).toMatchObject({ value: '25-12-2024', accepted: true });
  expect(editMask(mask(), '', 0, 0, '51012024').value).toBe('51-01-2024');
  expect(editMask(mask(), '', 0, 0, '5').value).toBe('5');
  for (const text of ['2024-12-25', '25/12/2024', '251220240', '25-12-2024 junk', ' 25-12-2024']) {
    expect(editMask(mask(), '', 0, 0, text)).toMatchObject({ value: '', accepted: false });
  }
});

it('deletes adjacent data rather than repeatedly restoring a deleted separator', () => {
  expect(editMask(mask(), '25-12-2024', 3, 3, '', 'backward')).toMatchObject({ value: '21-22-024', caret: 1 });
  expect(editMask(mask(), '25-12-2024', 2, 2, '', 'forward')).toMatchObject({ value: '25-22-024', caret: 3 });
  expect(editMask(mask(), '25-12-', 3, 5, '11').value).toBe('25-11-');
  expect(editMask(mask(), '25-12-', 0, 6, '1').value).toBe('1');
});

it('compiles literals, escapes, slot classes and bounded custom patterns', () => {
  expect(editMask(mask('MS-@@', true), '', 0, 0, 'M').value).toBe('MS-M');
  expect(editMask(mask('20##', true), '', 0, 0, '20').value).toBe('2020');
  const custom = mask('MS-@@ \\####.*', true);
  expect(renderMask(custom, ['A', 'b', '1', '2', '3', 'Z'])).toBe('MS-Ab #123.Z');
  expect(readMask(custom, 'MS-Ab #123.Z')).toEqual(['A', 'b', '1', '2', '3', 'Z']);
  expect(maskComplete(custom, 'MS-Ab #123.Z')).toBe(true);
  for (const pattern of ['', 'MS-', '#'.repeat(33), '#'.repeat(49), '##\\'])
    expect(typeof compileMask(pattern, true)).toBe('string');
});

it.each([
  ['date-dmy', '29-02-2000', true],
  ['date-dmy', '29-02-1900', false],
  ['date-dmy', '31-04-2024', false],
  ['date-dmy', '01-01-999', true],
  ['date-ymd', '099-01-01', true],
  ['datetime-dmy-hm', '01-01-999 12:30', true],
  ['datetime-iso-hm', '2024-12-25T14:30', true],
  ['time-hm', '24:00', false],
  ['time-hms', '23:59:59', true],
  ['time-hms', '12:60:00', false],
  ['date-dmy', '25-1', false],
  ['date-my', '13/2024', false],
])('checks complete %s value %s without changing it', (inputFormat, value, valid) => {
  expect(!getGuidedValueIssue(value, { inputFormat })).toBe(valid);
});

it('preserves long numeric strings and zeros with explicit numeric styles', () => {
  const format = resolveGuidedFormat({ inputFormat: 'number-decimal', allowNegative: true })!;
  for (const value of ['000123.4500', '90071992547409930000', '-0.1234567890123456789012345', '.5'])
    expect(numberFits(format, value, true)).toBe(true);
  for (const value of ['1,234.56', '1e-3', '1.2.3', '+2']) expect(numberFits(format, value)).toBe(false);
  for (const value of ['-', '12.']) expect(numberFits(format, value, true)).toBe(false);
});

it('only validates active custom configuration, never samples or defaults', () => {
  expect(validateTextFieldSettings({ inputFormat: 'custom', formatTemplate: '#' })).toEqual({});
  expect(validateTextFieldSettings({ inputFormat: 'custom', formatTemplate: 'fixed' }).formatTemplate).toBeTruthy();
  expect(validateTextFieldSettings({ inputFormat: 'custom', formatTemplate: 'fixed', multiline: true })).toEqual({});
  expect(validateTextFieldSettings({ inputFormat: 'text', formatTemplate: 'fixed' })).toEqual({});
});

it('keeps Unicode literal and letter lengths separate from browser caret offsets', () => {
  const custom = mask('📁-@@-##', true);
  const result = editMask(custom, '', 0, 0, '𐐀B12');
  expect(result.value).toBe('📁-𐐀B-12');
  expect(result.caret).toBe(result.value.length);
  expect(maskComplete(custom, result.value)).toBe(true);
  expect(editMask(custom, result.value, 7, 7, '', 'forward').value).toBe('📁-𐐀B-2');
});

it.each<[string, string, { start: number; end: number; text: string }]>([
  ['😀', '😁', { start: 0, end: 2, text: '😁' }],
  ['𐀀', '𠀀', { start: 0, end: 2, text: '𠀀' }],
  ['A😀Z', 'A😁Z', { start: 1, end: 3, text: '😁' }],
  ['😀𐐀x😀', '😀𐐁x😀', { start: 2, end: 4, text: '𐐁' }],
  ['😀A', '😀😁A', { start: 2, end: 2, text: '😁' }],
  ['😁😀', '😀', { start: 0, end: 2, text: '' }],
  ['A😀', 'A', { start: 1, end: 3, text: '' }],
  ['😀', '😀', { start: 2, end: 2, text: '' }],
])('diffs whole Unicode characters in %s -> %s', (previous, next, expected) => {
  const range = changedRange(previous, next);
  expect(range).toEqual(expected);
  expect(previous.slice(0, range.start) + range.text + previous.slice(range.end)).toBe(next);
});
