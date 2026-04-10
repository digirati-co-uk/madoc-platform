export type TabularGridCaretPosition = 'start' | 'end';

export type TabularGridKeyboardNavigation = {
  nextRow: number;
  nextCol: number;
  caretPosition: TabularGridCaretPosition;
};

type TabularGridKeyboardNavigationInput = {
  key: string;
  shiftKey: boolean;
  altKey: boolean;
  ctrlKey: boolean;
  metaKey: boolean;
  rowIndex: number;
  colIndex: number;
  rowCount: number;
  colCount: number;
  inputType?: string;
  selectionStart?: number | null;
  selectionEnd?: number | null;
  valueLength?: number;
  horizontalArrowBehavior?: 'at-edges' | 'always';
};

export type TabularGridKeyInput = Pick<
  TabularGridKeyboardNavigationInput,
  'key' | 'shiftKey' | 'altKey' | 'ctrlKey' | 'metaKey'
>;

const DIRECTIONAL_ARROW_KEYS = new Set(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']);

function hasNonShiftModifier(
  options: Pick<TabularGridKeyboardNavigationInput, 'altKey' | 'ctrlKey' | 'metaKey'>
) {
  return options.altKey || options.ctrlKey || options.metaKey;
}

export function isDirectionalArrowKey(key: string): boolean {
  return DIRECTIONAL_ARROW_KEYS.has(key);
}

export function isForwardTabWithoutModifiers(options: TabularGridKeyInput): boolean {
  return options.key === 'Tab' && !options.shiftKey && !hasNonShiftModifier(options);
}

function canNavigateHorizontally(options: TabularGridKeyboardNavigationInput, moveLeft: boolean): boolean {
  if (options.horizontalArrowBehavior === 'always') {
    return true;
  }

  if (options.inputType === 'checkbox') {
    return true;
  }

  if (
    typeof options.selectionStart !== 'number' ||
    typeof options.selectionEnd !== 'number' ||
    typeof options.valueLength !== 'number'
  ) {
    return true;
  }

  if (options.selectionStart !== options.selectionEnd) {
    return false;
  }

  if (moveLeft) {
    return options.selectionStart === 0;
  }

  return options.selectionEnd === options.valueLength;
}

export function getTabularGridKeyboardNavigation(
  options: TabularGridKeyboardNavigationInput
): TabularGridKeyboardNavigation | null {
  if (hasNonShiftModifier(options)) {
    return null;
  }

  if (options.rowCount < 1 || options.colCount < 1) {
    return null;
  }

  const lastRowIndex = options.rowCount - 1;
  const lastColIndex = options.colCount - 1;

  if (options.key === 'Tab') {
    let nextRow = options.rowIndex;
    let nextCol = options.colIndex + (options.shiftKey ? -1 : 1);

    if (nextCol < 0) {
      nextRow -= 1;
      nextCol = lastColIndex;
    } else if (nextCol > lastColIndex) {
      nextRow += 1;
      nextCol = 0;
    }

    if (nextRow < 0 || nextRow > lastRowIndex) {
      return null;
    }

    return {
      nextRow,
      nextCol,
      caretPosition: options.shiftKey ? 'end' : 'start',
    };
  }

  if (options.key === 'ArrowUp') {
    const nextRow = options.rowIndex - 1;
    if (nextRow < 0) {
      return null;
    }
    return {
      nextRow,
      nextCol: options.colIndex,
      caretPosition: 'end',
    };
  }

  if (options.key === 'ArrowDown') {
    const nextRow = options.rowIndex + 1;
    if (nextRow > lastRowIndex) {
      return null;
    }
    return {
      nextRow,
      nextCol: options.colIndex,
      caretPosition: 'end',
    };
  }

  if (options.key === 'ArrowLeft' || options.key === 'ArrowRight') {
    const moveLeft = options.key === 'ArrowLeft';
    if (!canNavigateHorizontally(options, moveLeft)) {
      return null;
    }

    const nextCol = options.colIndex + (moveLeft ? -1 : 1);
    if (nextCol < 0 || nextCol > lastColIndex) {
      return null;
    }

    return {
      nextRow: options.rowIndex,
      nextCol,
      caretPosition: moveLeft ? 'end' : 'start',
    };
  }

  return null;
}
