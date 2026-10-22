/** @jest-environment jsdom */
import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { FieldEditor } from '../../../src/frontend/shared/capture-models/editor/components/FieldEditor/FieldEditor';
import { PluginContext } from '../../../src/frontend/shared/capture-models/plugin-api/context';
import {
  TextField,
  TextFieldProps,
} from '../../../src/frontend/shared/capture-models/editor/input-types/TextField/TextField';
import TextFieldEditor from '../../../src/frontend/shared/capture-models/editor/input-types/TextField/TextField.editor';
import type { FieldSpecification } from '../../../src/frontend/shared/capture-models/types/field-types';

// These unrelated field configuration widgets pull in third-party declarations with existing errors.
jest.mock('../../../src/frontend/shared/capture-models/editor/atoms/Dropdown', () => ({ Dropdown: () => null }));
jest.mock('../../../src/frontend/shared/capture-models/editor/atoms/MultiDropdown', () => ({
  MultiDropdown: () => null,
}));
jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (text: string) => text }) }));
jest.mock('../../../src/frontend/shared/capture-models/hooks/use-model-translation', () => ({
  useModelTranslation: () => ({ t: (text: string) => text }),
}));
jest.mock('../../../src/frontend/shared/capture-models/editor/selector-types/BoxSelector/index', () => ({}));
(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
globalThis.ResizeObserver = class implements ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};
Object.defineProperty(globalThis, 'CSS', { value: { escape: (value: string) => value }, configurable: true });

const specification: FieldSpecification<TextFieldProps> = {
  type: 'text-field',
  label: 'Text field',
  description: '',
  defaultProps: {},
  defaultValue: '',
  allowMultiple: true,
  Component: TextField,
  Editor: TextFieldEditor,
  TextPreview: () => null,
};
let container: HTMLDivElement;
let root: Root | undefined;
let saved: jest.Mock;
beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  saved = jest.fn();
});
afterEach(async () => {
  await act(async () => root?.unmount());
  container.remove();
});
function render(overrides: Partial<TextFieldProps> = {}) {
  const field: TextFieldProps = {
    id: 'preview-field',
    type: 'text-field',
    label: 'Field',
    value: 'old incompatible default',
    inputFormat: 'custom',
    formatTemplate: 'MS-####',
    ...overrides,
  };
  act(() =>
    root!.render(
      <PluginContext.Provider
        value={{
          fields: { 'text-field': specification as unknown as FieldSpecification },
          selectors: {},
          contentTypes: {},
          refinements: [],
        }}
      >
        <FieldEditor field={field} onSubmit={saved} />
      </PluginContext.Provider>
    )
  );
}
async function change(name: string, value: string) {
  const input = container.querySelector<HTMLInputElement>(`input[name="${name}"]`)!;
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(input, value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
}
async function save() {
  await act(async () => {
    container.querySelector('form')!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  });
}
function button(label: string) {
  return Array.from(container.querySelectorAll('button')).find(item => item.textContent === label)!;
}

it('blocks invalid custom configuration through actual Formik Save and unmount autosave', async () => {
  render();
  await change('formatTemplate', 'no slots');
  await save();
  expect(saved).not.toHaveBeenCalled();
  expect(container.textContent).toContain('between 1 and 32');
  await act(async () => {
    root!.unmount();
    root = undefined;
  });
  expect(saved).not.toHaveBeenCalled();
});

it('saves valid configuration with an incompatible saved default verbatim', async () => {
  render();
  await change('label', 'Changed label');
  await save();
  expect(saved).toHaveBeenCalledWith(
    expect.objectContaining({ label: 'Changed label', value: 'old incompatible default', formatTemplate: 'MS-####' }),
    undefined
  );
});

it('retains valid unmount autosave after child editor fields unregister', async () => {
  render();
  await change('formatTemplate', '@@ ####');
  await act(async () => {
    root!.unmount();
    root = undefined;
  });
  expect(saved).toHaveBeenCalledWith(
    expect.objectContaining({ formatTemplate: '@@ ####', value: 'old incompatible default' }),
    undefined
  );
});

it.each<Partial<TextFieldProps>>([{ multiline: true }, { inputFormat: 'text' }])(
  'does not validate inactive custom configuration: %s',
  async overrides => {
    render({ ...overrides, formatTemplate: 'invalid' });
    await save();
    expect(saved).toHaveBeenCalledTimes(1);
  }
);

it('allows partial Try it and preview input without native constraints or Enter submission', async () => {
  render({ value: '', required: true, inputFormat: 'date-dmy' });
  const fields = container.querySelectorAll<HTMLInputElement>('input[type="text"]');
  const preview = container.querySelector<HTMLInputElement>('#preview-field')!;
  const sample = Array.from(fields).find(field => field.id.endsWith('-sample'))!;
  expect(preview.required).toBe(false);
  for (const field of [preview, sample]) {
    expect(field.required).toBe(false);
    expect(field.hasAttribute('pattern')).toBe(false);
    expect(field.validity.customError).toBe(false);
    const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true });
    act(() => field.dispatchEvent(event));
    expect(event.defaultPrevented).toBe(true);
  }
  await change(sample.name, '2');
  await change(preview.name, '2');
  expect(button('Use as default value').disabled).toBe(true);
  await save();
  expect(saved).toHaveBeenCalledWith(expect.objectContaining({ value: '', required: true }), undefined);
  await change(preview.name, '25122024');
  expect(preview.value).toBe('25-12-2024');
  expect(button('Use as default value').disabled).toBe(false);
  act(() => button('Use as default value').click());
  await save();
  expect(saved).toHaveBeenLastCalledWith(expect.objectContaining({ value: '25-12-2024' }), undefined);
});

it('resets populated Try it state and mask baseline when switching to a custom template, preserving the saved preview', async () => {
  render({ inputFormat: 'date-dmy', formatTemplate: '' });
  let sample = container.querySelector<HTMLInputElement>('input[id$="-sample"]')!;
  await change(sample.name, '29022024');
  expect(sample.value).toBe('29-02-2024');
  await act(async () => {
    const select = container.querySelector<HTMLSelectElement>('select[name="inputFormat"]')!;
    select.value = 'custom';
    select.dispatchEvent(new Event('change', { bubbles: true }));
  });
  await act(async () => {
    Array.from(container.querySelectorAll('button'))
      .find(item => item.textContent === 'Catalogue reference · MS-####')!
      .click();
  });
  sample = container.querySelector<HTMLInputElement>('input[id$="-sample"]')!;
  expect(sample.value).toBe('');
  expect(sample.parentElement!.querySelector('[aria-hidden="true"]')!.textContent).toBe('MS-####');
  for (const digit of '1234') await change(sample.name, sample.value + digit);
  expect(sample.value).toBe('MS-1234');
  expect(container.querySelector<HTMLInputElement>('#preview-field')!.value).toBe('old incompatible default');
  await save();
  expect(saved).toHaveBeenCalledWith(
    expect.objectContaining({ value: 'old incompatible default', formatTemplate: 'MS-####' }),
    undefined
  );
});

it('resets Try it on custom-pattern and numeric sign configuration changes', async () => {
  render();
  let sample = container.querySelector<HTMLInputElement>('input[id$="-sample"]')!;
  await change(sample.name, '1234');
  expect(sample.value).toBe('MS-1234');
  await change('formatTemplate', '@@ ####');
  sample = container.querySelector<HTMLInputElement>('input[id$="-sample"]')!;
  expect(sample.value).toBe('');
  await change(sample.name, 'AB1234');
  expect(sample.value).toBe('AB 1234');
  await act(async () => {
    const select = container.querySelector<HTMLSelectElement>('select[name="inputFormat"]')!;
    select.value = 'number-whole';
    select.dispatchEvent(new Event('change', { bubbles: true }));
  });
  sample = container.querySelector<HTMLInputElement>('input[id$="-sample"]')!;
  await change(sample.name, '123');
  expect(sample.value).toBe('123');
  await act(async () => container.querySelector<HTMLInputElement>('input[name="allowNegative"]')!.click());
  sample = container.querySelector<HTMLInputElement>('input[id$="-sample"]')!;
  expect(sample.value).toBe('');
  await change(sample.name, '-123');
  expect(sample.value).toBe('-123');
  expect(container.querySelector<HTMLInputElement>('#preview-field')!.value).toBe('old incompatible default');
});
