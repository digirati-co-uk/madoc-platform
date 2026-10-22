import { compileMask, InputMask, maskComplete } from './input-mask';

const presetDefinitions = [
  ['number-whole', 'Numbers', 'Whole number (digits only)', '001234'],
  ['number-decimal', 'Numbers', 'Decimal point', '1234.56'],
  ['number-decimal-comma', 'Numbers', 'Decimal comma', '1234,56'],
  ['date-dmy', 'Dates', 'DD-MM-YYYY', '25-12-2024'],
  ['date-dmy-slash', 'Dates', 'DD/MM/YYYY', '25/12/2024'],
  ['date-dmy-dot', 'Dates', 'DD.MM.YYYY', '25.12.2024'],
  ['date-ymd', 'Dates', 'YYYY-MM-DD', '2024-12-25'],
  ['date-mdy-slash', 'Dates', 'MM/DD/YYYY', '12/25/2024'],
  ['date-my', 'Dates', 'MM/YYYY', '12/2024'],
  ['date-y', 'Dates', 'YYYY', '2024'],
  ['time-hm', 'Times', 'HH:mm', '14:30'],
  ['time-hms', 'Times', 'HH:mm:ss', '14:30:05'],
  ['datetime-dmy-hm', 'Dates and times', 'DD-MM-YYYY HH:mm', '25-12-2024 14:30'],
  ['datetime-dmy-hms', 'Dates and times', 'DD-MM-YYYY HH:mm:ss', '25-12-2024 14:30:05'],
  ['datetime-dmy-slash-hm', 'Dates and times', 'DD/MM/YYYY HH:mm', '25/12/2024 14:30'],
  ['datetime-ymd-hm', 'Dates and times', 'YYYY-MM-DD HH:mm', '2024-12-25 14:30'],
  ['datetime-ymd-hms', 'Dates and times', 'YYYY-MM-DD HH:mm:ss', '2024-12-25 14:30:05'],
  ['datetime-iso-hm', 'Dates and times', 'YYYY-MM-DDTHH:mm', '2024-12-25T14:30'],
] as const;
export type GuidedFormatId = (typeof presetDefinitions)[number][0] | 'custom';
export interface GuidedFormatConfig {
  inputFormat?: string;
  formatTemplate?: string;
  allowNegative?: boolean;
  multiline?: boolean;
}
export interface GuidedFormat {
  id: GuidedFormatId;
  label: string;
  example: string;
  mask?: InputMask;
  historicalMask?: InputMask;
  decimal?: '.' | ',';
  allowNegative: boolean;
}
export const guidedFormatGroups = ['Numbers', 'Dates', 'Times', 'Dates and times'] as const;
export const guidedFormatPresets = presetDefinitions.map(([id, group, label, example]) => ({
  id,
  group,
  label,
  example,
}));
export const customFormatExamples = [
  { label: 'Catalogue reference', pattern: 'MS-####' },
  { label: 'Phone number', pattern: '+## ### ### ####' },
  { label: 'Shelfmark', pattern: '@@ ####.##' },
];

export function validateTextFieldSettings(config: GuidedFormatConfig): { formatTemplate?: string } {
  if (config.multiline || config.inputFormat !== 'custom') return {};
  const mask = compileMask(config.formatTemplate || '', true);
  return typeof mask === 'string' ? { formatTemplate: mask } : {};
}

export function resolveGuidedFormat(config: GuidedFormatConfig): GuidedFormat | undefined {
  if (config.multiline) return undefined;
  if (config.inputFormat === 'custom') {
    const mask = compileMask(config.formatTemplate || '', true);
    return typeof mask === 'string'
      ? undefined
      : { id: 'custom', label: mask.template, example: mask.example, mask, allowNegative: false };
  }
  const preset = guidedFormatPresets.find(item => item.id === config.inputFormat);
  if (!preset) return undefined;
  if (preset.group === 'Numbers') {
    return {
      ...preset,
      allowNegative: !!config.allowNegative,
      decimal: preset.id === 'number-decimal' ? '.' : preset.id === 'number-decimal-comma' ? ',' : undefined,
    };
  }
  const mask = compileMask(preset.label);
  const historicalMask = preset.label.includes('YYYY') ? compileMask(preset.label.replace('YYYY', 'YYY')) : undefined;
  if (typeof mask === 'string') return undefined;
  return {
    ...preset,
    mask,
    historicalMask: typeof historicalMask === 'string' ? undefined : historicalMask,
    allowNegative: false,
  };
}

/** No Number conversion: precision, leading zeros and the chosen decimal separator are preserved. */
export function numberFits(format: GuidedFormat, value: string, complete = false): boolean {
  const sign = format.allowNegative ? '-?' : '';
  const decimal = format.decimal ? `(?:\\${format.decimal}[0-9]*)?` : '';
  return (
    new RegExp(`^${sign}[0-9]*${decimal}$`).test(value) &&
    (!complete || (/[0-9]/.test(value) && !value.endsWith(format.decimal || '\0')))
  );
}

export function formatIsComplete(format: GuidedFormat, value: string): boolean {
  if (!format.mask) return false; // A number has no fixed completion point.
  return maskComplete(format.mask, value) || (!!format.historicalMask && maskComplete(format.historicalMask, value));
}

export interface GuidedValueIssue {
  message: string;
  values?: Record<string, string | number>;
}

/** Pure display validation. Empty values are optional here; requiredness belongs to the caller. */
export function getGuidedValueIssue(value: string, config: GuidedFormatConfig): GuidedValueIssue | undefined {
  if (!value) return undefined;
  const format = resolveGuidedFormat(config);
  if (!format) return undefined;
  if (!format.mask)
    return numberFits(format, value, true) ? undefined : { message: 'Finish the number using the selected format.' };
  if (!formatIsComplete(format, value))
    return {
      message: 'Finish entering {{format}}, for example {{example}}.',
      values: { format: format.label, example: format.example },
    };
  if (format.id === 'custom') return undefined;
  const groups: string[] = [];
  const escaped = format.label.replace(/([.*+?^${}()|[\]\\])/g, '\\$1');
  const expression = escaped.replace(/D+|M+|Y+|H+|m+|s+/g, token => {
    groups.push(token[0]);
    return token[0] === 'Y' ? '([0-9]{3,4})' : `([0-9]{${token.length}})`;
  });
  const match = new RegExp(`^${expression}$`).exec(value);
  if (!match)
    return {
      message: 'Finish entering {{format}}, for example {{example}}.',
      values: { format: format.label, example: format.example },
    };
  const parts: Record<string, number> = {};
  groups.forEach((group, i) => {
    parts[group] = Number(match[i + 1]);
  });
  if (parts.M !== undefined && (parts.M < 1 || parts.M > 12))
    return { message: 'The month must be between 01 and 12.' };
  if (parts.D !== undefined) {
    if (parts.D < 1 || parts.D > 31) return { message: 'The day must be between 01 and 31.' };
    const leap = parts.Y % 4 === 0 && (parts.Y % 100 !== 0 || parts.Y % 400 === 0);
    const days = parts.M === 2 ? (leap ? 29 : 28) : [4, 6, 9, 11].includes(parts.M) ? 30 : 31;
    if (parts.D > days) return { message: 'This month has {{days}} days in that year.', values: { days } };
  }
  if (parts.H > 23) return { message: 'Hours must be between 00 and 23.' };
  if (parts.m > 59) return { message: 'Minutes must be between 00 and 59.' };
  if (parts.s > 59) return { message: 'Seconds must be between 00 and 59.' };
  return undefined;
}
