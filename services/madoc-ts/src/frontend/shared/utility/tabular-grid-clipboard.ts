import Papa from 'papaparse';

export type TabularCopyShortcutKeyInput = {
  key: string;
  altKey: boolean;
  ctrlKey: boolean;
  metaKey: boolean;
};

type CopyableInput = {
  type?: string;
  value: string;
  checked?: boolean;
  selectionStart: number | null;
  selectionEnd: number | null;
};

export type TabularClipboardCell = {
  fieldType?: string;
  fieldOptions?: Array<{ value: string; text: string; label?: string }>;
  value: unknown;
};

export type TabularClipboardParseResult = { accepted: true; value: unknown } | { accepted: false };

const CHECKBOX_COPY_TRUE = 'Yes';
const CHECKBOX_COPY_FALSE = 'No';
const OFFSCREEN_COPY_LEFT = '-9999px';

export function isTabularCopyShortcut(options: TabularCopyShortcutKeyInput): boolean {
  return !options.altKey && (options.ctrlKey || options.metaKey) && options.key.toLowerCase() === 'c';
}

export function hasInputSelection(input: Pick<CopyableInput, 'selectionStart' | 'selectionEnd'>): boolean {
  return (
    typeof input.selectionStart === 'number' &&
    typeof input.selectionEnd === 'number' &&
    input.selectionStart !== input.selectionEnd
  );
}

export function shouldCopyWholeInputValue(input: CopyableInput): boolean {
  return input.type === 'checkbox' || !hasInputSelection(input);
}

export function getInputCopyValue(input: Pick<CopyableInput, 'type' | 'value' | 'checked'>): string {
  if (input.type === 'checkbox') {
    return input.checked ? CHECKBOX_COPY_TRUE : CHECKBOX_COPY_FALSE;
  }
  return input.value;
}

export function getTabularCellClipboardText(cell: TabularClipboardCell): string {
  if (cell.fieldType === 'checkbox-field') {
    return cell.value ? CHECKBOX_COPY_TRUE : CHECKBOX_COPY_FALSE;
  }

  return typeof cell.value === 'string'
    ? cell.value
    : cell.value === null || typeof cell.value === 'undefined'
      ? ''
      : String(cell.value);
}

export function formatTabularClipboardMatrix(values: string[][]): string {
  return Papa.unparse(values, { delimiter: '\t', newline: '\n' });
}

export function parseTabularClipboardMatrix(clipboardText: string): string[][] {
  const result = Papa.parse<string[]>(clipboardText, {
    delimiter: '\t',
    skipEmptyLines: false,
  });

  if (result.errors.length > 0) {
    return [];
  }

  const rows = result.data;
  if (rows.length > 1 && rows.at(-1)?.every(value => value === '')) {
    rows.pop();
  }
  return rows;
}

export function parseTabularCellClipboardText(
  cell: Pick<TabularClipboardCell, 'fieldType' | 'fieldOptions'>,
  clipboardText: string
): TabularClipboardParseResult {
  const value = clipboardText;

  if (cell.fieldType === 'checkbox-field') {
    const normalizedValue = value.trim().toLowerCase();
    if (['yes', 'true', '1', 'on'].includes(normalizedValue)) {
      return { accepted: true, value: true };
    }
    if (['no', 'false', '0', 'off', ''].includes(normalizedValue)) {
      return { accepted: true, value: false };
    }
    return { accepted: false };
  }

  if (cell.fieldType === 'dropdown-field') {
    if (!value) {
      return { accepted: true, value: '' };
    }

    const normalizedValue = value.trim().toLowerCase();
    const option = cell.fieldOptions?.find(
      item =>
        item.value === value ||
        item.text.trim().toLowerCase() === normalizedValue ||
        item.label?.trim().toLowerCase() === normalizedValue
    );
    return option ? { accepted: true, value: option.value } : { accepted: false };
  }

  return { accepted: true, value };
}

function fallbackCopyToClipboard(text: string): boolean {
  if (typeof document === 'undefined') {
    return false;
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.left = OFFSCREEN_COPY_LEFT;
  textarea.style.top = '0';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);

  try {
    textarea.focus();
    textarea.select();
    return document.execCommand('copy');
  } catch {
    return false;
  } finally {
    document.body.removeChild(textarea);
  }
}

export async function copyTabularCellValueToClipboard(value: string): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
    try {
      await navigator.clipboard.writeText(value);
      return true;
    } catch {
      // Fallback for browsers or contexts that block the async clipboard API.
    }
  }

  return fallbackCopyToClipboard(value);
}
