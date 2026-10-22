import {
  getTextFieldFormatHint,
  isValidTextFieldValue,
} from '../../../../src/frontend/shared/utility/text-field-format';
import { formatDateFieldInput, isValidDateFieldValue } from '../../../../src/frontend/shared/utility/date-field-format';

it.each(['', 'plain text', 'circa 1900', '000123.4500', 'invalid date'])(
  'keeps old text configurations unrestricted: %s',
  value => {
    expect(isValidTextFieldValue(value)).toBe(true);
    expect(isValidTextFieldValue(value, 'text')).toBe(true);
    expect(getTextFieldFormatHint()).toBeUndefined();
  }
);

it.each(['', '0', '-12.5', '+.5', '000123.4500', '90071992547409930000', '1.234567890123456789', '1e-3'])(
  'accepts numeric strings without conversion: %s',
  value => {
    expect(isValidTextFieldValue(value, 'number')).toBe(true);
  }
);
it.each(['-', '12,5', '12x', '1e', 'Infinity', 'NaN', ' 12 '])(
  'identifies incomplete or non-numeric text: %s',
  value => {
    expect(isValidTextFieldValue(value, 'number')).toBe(false);
  }
);
it.each(['', '00:00', '23:59', '14:30:05', '14:30:05.123'])('accepts 24-hour time: %s', value => {
  expect(isValidTextFieldValue(value, 'time')).toBe(true);
});
it.each(['24:00', '12:60', '12:00:60', '12:', '1:00', '14:00Z'])('identifies invalid or partial times: %s', value => {
  expect(isValidTextFieldValue(value, 'time')).toBe(false);
});
it.each(['', '29-02-2024 23:59', '28-02-1900 00:00:00', '01-01-999 12:30:05.5'])(
  'accepts calendar dates with time: %s',
  value => {
    expect(isValidTextFieldValue(value, 'date-time')).toBe(true);
  }
);
it.each(['29-02-1900 12:00', '31-04-2024 12:00', '01-01-2024 24:00', '01-01-2024', '2024-01-01T12:00'])(
  'identifies invalid or differently formatted date-time text: %s',
  value => {
    expect(isValidTextFieldValue(value, 'date-time')).toBe(false);
  }
);
it('preserves the established date-only format and historical years', () => {
  expect(formatDateFieldInput('29022024')).toBe('29-02-2024');
  expect(isValidDateFieldValue('01-01-999')).toBe(true);
  expect(isValidDateFieldValue('29-02-1900')).toBe(false);
});
