/** @jest-environment jsdom */
import React, { act, useState } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { FormattedTextInput } from '../../../src/frontend/shared/capture-models/editor/input-types/TextField/FormattedTextInput';
import type { TextFieldInputFormat } from '../../../src/frontend/shared/utility/text-field-format';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (text: string, values?: Record<string, string | number>) =>
      text.replace(/{{(\w+)}}/g, (_match, token: string) => String(values?.[token] ?? token)),
  }),
}));
(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement;
let root: Root;
let changed: jest.Mock;
beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  changed = jest.fn();
});
afterEach(() => {
  act(() => root.unmount());
  container.remove();
});
function Harness({
  initial = '',
  format = 'date-dmy',
  pattern,
  required,
}: {
  initial?: string;
  format?: TextFieldInputFormat;
  pattern?: string;
  required?: boolean;
}) {
  const [value, setValue] = useState(initial);
  return (
    <FormattedTextInput
      id="guided"
      value={value}
      onChange={next => {
        changed(next);
        setValue(next);
      }}
      inputFormat={format}
      formatTemplate={pattern}
      required={required}
    />
  );
}
function render(props: Parameters<typeof Harness>[0] = {}) {
  act(() => root.render(<Harness {...props} />));
  return container.querySelector('input')!;
}
function enter(input: HTMLInputElement, next: string, data: string | null = null, inputType = 'insertText') {
  act(() => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(input, next);
    input.setSelectionRange(next.length, next.length);
    input.dispatchEvent(new InputEvent('input', { bubbles: true, data, inputType }));
  });
}
function paste(input: HTMLInputElement, text: string, start = input.value.length, end = start) {
  act(() => {
    input.setSelectionRange(start, end);
    const event = new Event('paste', { bubbles: true, cancelable: true });
    Object.defineProperty(event, 'clipboardData', { value: { getData: () => text } });
    input.dispatchEvent(event);
  });
}
function key(input: HTMLInputElement, name: string, start: number, end = start) {
  act(() => {
    input.setSelectionRange(start, end);
    input.dispatchEvent(new KeyboardEvent('keydown', { key: name, bubbles: true, cancelable: true }));
  });
}

it('keeps the remaining template inside the field after typing and adds separators', () => {
  const field = render();
  act(() => field.focus());
  enter(field, '2');
  expect(field.value).toBe('2');
  expect(container.querySelector('[aria-hidden="true"]')!.textContent).toBe('2D-MM-YYYY');
  enter(field, '25');
  expect(field.value).toBe('25-');
  expect(field.selectionStart).toBe(3);
  enter(field, '25-1');
  expect(field.getAttribute('aria-invalid')).toBeNull();
  act(() => field.blur());
  expect(field.getAttribute('aria-invalid')).toBe('true');
  expect(container.textContent).toContain('Finish entering');
  act(() => field.focus());
  expect(field.getAttribute('aria-invalid')).toBeNull();
  expect(changed.mock.calls.map(call => call[0])).toEqual(['2', '25-', '25-1']);
});

it('preserves full pasted input or refuses it atomically and validates real calendar dates', () => {
  const field = render();
  paste(field, '2024-12-25');
  expect(field.value).toBe('');
  expect(container.textContent).toContain('nothing was pasted');
  paste(field, '25/12/2024');
  expect(field.value).toBe('');
  paste(field, '25122024');
  expect(field.value).toBe('25-12-2024');
  paste(field, '31-04-2024', 0, field.value.length);
  act(() => field.focus());
  expect(field.getAttribute('aria-invalid')).toBe('true');
  expect(container.textContent).toContain('30 days');
  paste(field, '29-02-2000', 0, field.value.length);
  expect(field.getAttribute('aria-invalid')).toBeNull();
});

it('handles selection replacement, insertion, cut, backspace and forward delete around separators', () => {
  const field = render();
  paste(field, '25122024');
  key(field, 'Backspace', 3);
  expect(field.value).toBe('21-22-024');
  expect(field.selectionStart).toBe(1);
  paste(field, '25122024', 0, field.value.length);
  key(field, 'Delete', 2);
  expect(field.value).toBe('25-22-024');
  paste(field, '25122024', 0, field.value.length);
  paste(field, '11', 3, 5);
  expect(field.value).toBe('25-11-2024');
  enter(field, '25-11-', null, 'deleteByCut');
  expect(field.value).toBe('25-11-');
  key(field, '9', 3, 3);
  enter(field, '25-911-', '9');
  expect(field.value).toBe('25-91-1');
  expect(field.selectionStart).toBe(4);
  paste(field, '1', 0, field.value.length);
  expect(field.value).toBe('1');
});

it('does not reformat during composition and formats once composition ends', () => {
  const field = render();
  act(() => field.dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true })));
  enter(field, '25122024', null, 'insertCompositionText');
  expect(field.value).toBe('25122024');
  expect(changed).not.toHaveBeenCalled();
  act(() => field.dispatchEvent(new CompositionEvent('compositionend', { bubbles: true, data: '25122024' })));
  expect(field.value).toBe('25-12-2024');
  expect(changed).toHaveBeenCalledTimes(1);
  expect(changed).toHaveBeenLastCalledWith('25-12-2024');
});

it('only enters legacy mode for external values and never rewrites them on configuration switches', () => {
  const field = render({ initial: 'historic unknown' });
  expect(field.value).toBe('historic unknown');
  expect(changed).not.toHaveBeenCalled();
  enter(field, 'historic unknown?');
  expect(field.value).toBe('historic unknown?');
  enter(field, '');
  enter(field, 'a');
  expect(field.value).toBe('');
  paste(field, '25122024');
  act(() => root.render(<Harness initial="historic unknown" format="date-ymd" />));
  expect(field.value).toBe('25-12-2024');
  expect(changed).toHaveBeenLastCalledWith('25-12-2024');
  expect(container.textContent).toContain('saved value');
});

it.each(['000123.4500', '90071992547409930000', '0.12345678901234567890123456789'])(
  'preserves numeric model string %s without conversion',
  initial => {
    const field = render({ initial, format: 'number-decimal' });
    expect(field.value).toBe(initial);
    expect(changed).not.toHaveBeenCalled();
    paste(field, initial, 0, initial.length);
    expect(changed).toHaveBeenLastCalledWith(initial);
    paste(field, '1,234.56', 0, initial.length);
    expect(field.value).toBe(initial);
  }
);

it('maps a typed decimal separator but refuses differently separated pasted numbers', () => {
  const field = render({ format: 'number-decimal' });
  enter(field, '1');
  enter(field, '1,', ',');
  expect(field.value).toBe('1.');
  enter(field, '1.5', '5');
  expect(field.value).toBe('1.5');
  paste(field, '1,5', 0, 3);
  expect(field.value).toBe('1.5');
});

it('preserves native required semantics while adding no native format constraint', () => {
  const field = render({ required: true });
  expect(field.validity.valueMissing).toBe(true);
  enter(field, '2');
  expect(field.checkValidity()).toBe(true);
  expect(field.hasAttribute('pattern')).toBe(false);
  expect(field.validity.customError).toBe(false);
});

it('preserves historical datetime years and custom literal data on paste', () => {
  const field = render({ format: 'datetime-dmy-hm' });
  paste(field, '01-01-999 12:30');
  expect(field.value).toBe('01-01-999 12:30');
  expect(changed).toHaveBeenLastCalledWith('01-01-999 12:30');
});

it('does not strand deletion across different custom slot classes or exempt it from validation', () => {
  const field = render({ format: 'custom', pattern: '@@ ####' });
  paste(field, 'AB1234');
  expect(field.value).toBe('AB 1234');
  key(field, 'Backspace', 1);
  expect(field.value).toBe('B 1234');
  key(field, 'Backspace', 1);
  expect(field.value).toBe(' 1234');
  act(() => {
    field.focus();
    field.blur();
  });
  expect(field.getAttribute('aria-invalid')).toBe('true');
  expect(container.textContent).not.toContain('saved value');
  enter(field, 'AB 1234');
  expect(field.getAttribute('aria-invalid')).toBeNull();
});

it('lets a custom letter match a fixed prefix without consuming the entered data', () => {
  const field = render({ format: 'custom', pattern: 'MS-@@' });
  enter(field, 'M', 'M');
  expect(field.value).toBe('MS-M');
  enter(field, 'MS-MS', 'S');
  expect(field.value).toBe('MS-MS');
});

it('delays legacy advisory errors while focused without changing the accepted language', () => {
  const field = render({ format: 'time' });
  act(() => field.focus());
  enter(field, '1');
  expect(field.getAttribute('aria-invalid')).toBeNull();
  act(() => field.blur());
  expect(field.getAttribute('aria-invalid')).toBe('true');
  enter(field, '14:30:05.123');
  expect(field.getAttribute('aria-invalid')).toBeNull();
});

it('handles virtual-keyboard deletion events beside automatic separators', () => {
  const field = render();
  paste(field, '25122024');
  enter(field, '2512-2024', null, 'deleteContentBackward');
  expect(field.value).toBe('21-22-024');
  paste(field, '25122024', 0, field.value.length);
  enter(field, '2512-2024', null, 'deleteContentForward');
  expect(field.value).toBe('25-22-024');
});

it.each<[TextFieldInputFormat, string, string]>([
  ['date-ymd', '999-01-01', '2024-01-01'],
  ['date-dmy', '01-01-999', '01-01-2024'],
  ['datetime-dmy-hm', '01-01-999 12:30', '01-01-2024 12:30'],
  ['datetime-iso-hm', '999-01-01T12:30', '2024-01-01T12:30'],
])('replaces historical %s values with standard-year values and back', (format, initial, replacement) => {
  const field = render({ format, initial });
  paste(field, replacement, 0, field.value.length);
  expect(field.value).toBe(replacement);
  paste(field, initial, 0, field.value.length);
  expect(field.value).toBe(initial);
});

it.each([
  { pattern: '@#', initial: '𐐀1', position: 2, expected: '1', caretPosition: 0 },
  { pattern: '📁-@#', initial: '📁-𐐀1', position: 5, expected: '📁-1', caretPosition: 3 },
])(
  'deletes a whole astral custom letter across unlike slots: $pattern',
  ({ pattern, initial, position, expected, caretPosition }) => {
    const field = render({ format: 'custom', pattern, initial });
    key(field, 'Backspace', position);
    expect(field.value).toBe(expected);
    expect(field.selectionStart).toBe(caretPosition);
    expect(changed).toHaveBeenLastCalledWith(expected);
    paste(field, initial, 0, field.value.length);
    expect(field.value).toBe(initial);
    key(field, 'Delete', caretPosition);
    expect(field.value).toBe(expected);
  }
);

it('keeps strict paste active during custom correction and formats complete raw replacements', () => {
  const field = render({ format: 'custom', pattern: '@@ ####', initial: 'AB 1234' });
  key(field, 'Backspace', 1);
  expect(field.value).toBe('B 1234');
  paste(field, '!@#$%', 0, field.value.length);
  expect(field.value).toBe('B 1234');
  expect(container.textContent).toContain('nothing was pasted');
  paste(field, 'AB1234', 0, field.value.length);
  expect(field.value).toBe('AB 1234');
  act(() => {
    field.focus();
    field.blur();
  });
  expect(field.getAttribute('aria-invalid')).toBeNull();
  key(field, 'Backspace', 1);
  paste(field, '!', 0, 0);
  expect(field.value).toBe('B 1234');
  paste(field, 'A', 0, 0);
  expect(field.value).toBe('AB 1234');
});

it.each<{ format: TextFieldInputFormat; pattern?: string; initial: string; next: string }>([
  { format: 'text', initial: '😀', next: '😁' },
  { format: 'text', initial: 'A😀Z', next: 'A😁Z' },
  { format: 'text', initial: '𐀀', next: '𠀀' },
  { format: 'text', initial: '😀𐐀x😀', next: '😀𐐁x😀' },
  { format: 'custom', pattern: '@#', initial: '𐐀1', next: '𐐁1' },
  { format: 'custom', pattern: '@#', initial: '𐐀1', next: '𠐀1' },
  { format: 'custom', pattern: '@@#', initial: '𐐀B1', next: '𐐁B1' },
  { format: 'custom', pattern: '@@#', initial: '𐐀𐐀1', next: '𐐀𐐁1' },
])('commits a whole Unicode composition replacement once: $initial -> $next', ({ format, pattern, initial, next }) => {
  const field = render({ format, pattern, initial });
  act(() => field.dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true })));
  enter(field, next, next, 'insertCompositionText');
  expect(field.value).toBe(next);
  expect(changed).not.toHaveBeenCalled();
  act(() => field.dispatchEvent(new CompositionEvent('compositionend', { bubbles: true, data: next })));
  expect(field.value).toBe(next);
  expect(changed).toHaveBeenCalledTimes(1);
  expect(changed).toHaveBeenLastCalledWith(next);
});
