import { isValidDateFieldValue } from './date-field-format';

export type TextFieldInputFormat = 'text' | 'number' | 'time' | 'date-time';

export function getTextFieldFormatHint(format?: TextFieldInputFormat): string | undefined {
  switch (format) {
    case 'number':
      return 'Enter a number, for example -12.5 (use a decimal point).';
    case 'time':
      return 'Use 24-hour time: HH:mm (optional seconds, for example 14:30:05).';
    case 'date-time':
      return 'Use DD-MM-YYYY HH:mm (24-hour time; optional seconds).';
    default:
      return undefined;
  }
}

export function isValidTextFieldValue(value: string, format?: TextFieldInputFormat): boolean {
  if (!value) return true;
  switch (format) {
    case 'number':
      return /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/.test(value);
    case 'time':
      return /^(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d(?:\.\d{1,3})?)?$/.test(value);
    case 'date-time': {
      const parts = /^(\d{2}-\d{2}-\d{3,4}) (.+)$/.exec(value);
      return !!parts && isValidDateFieldValue(parts[1]) && isValidTextFieldValue(parts[2], 'time');
    }
    default:
      return true;
  }
}
