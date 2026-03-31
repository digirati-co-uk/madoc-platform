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
