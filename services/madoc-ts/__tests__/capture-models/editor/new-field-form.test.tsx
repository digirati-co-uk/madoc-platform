/** @jest-environment jsdom */
import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { NewFieldForm } from '../../../src/frontend/shared/capture-models/editor/components/NewFieldForm/NewFieldForm';
import { ChooseFieldButton } from '../../../src/frontend/shared/capture-models/editor/components/ChooseFieldButton/ChooseFieldButton';
import { PluginContext } from '../../../src/frontend/shared/capture-models/plugin-api/context';
import type { FieldSpecification } from '../../../src/frontend/shared/capture-models/types/field-types';
import type { PluginStore } from '../../../src/frontend/shared/capture-models/types/plugin-store';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (text: string, values?: { term: string }) => text.replace('{{term}}', values?.term || ''),
  }),
}));
// Selector registration imports the canvas viewer, which this form does not exercise.
jest.mock('../../../src/frontend/shared/capture-models/editor/selector-types/BoxSelector/index', () => ({}));

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
globalThis.ResizeObserver = class implements ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};
// React Aria escapes option keys; the fixture keys contain only letters and hyphens.
Object.defineProperty(globalThis, 'CSS', { value: { escape: (value: string) => value }, configurable: true });

function field(type: string, label: string): FieldSpecification {
  return {
    type,
    label,
    description: '',
    defaultValue: '',
    defaultProps: {},
    allowMultiple: true,
    Component: () => null,
    Editor: () => null,
    TextPreview: () => null,
  };
}

const textField = field('text-field', 'Text field');
const choiceField = field('choice-field', 'Choice field');

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

function renderForm(fields: PluginStore['fields'], existingTerms: string[] = []) {
  const onSave = jest.fn();
  act(() =>
    root.render(
      <PluginContext.Provider value={{ fields, selectors: {}, contentTypes: {}, refinements: [] }}>
        <NewFieldForm existingTerms={existingTerms} onSave={onSave} />
      </PluginContext.Provider>
    )
  );
  return onSave;
}

function enterTerm(term: string) {
  const input = container.querySelector<HTMLInputElement>('input[name="term"]')!;
  act(() => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(input, term);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
}

function saveButton(): HTMLButtonElement {
  return container.querySelector<HTMLButtonElement>('button[type="submit"]')!;
}

function fieldInput(): HTMLInputElement {
  return container.querySelector<HTMLInputElement>('[role="combobox"]')!;
}

function submitForm() {
  act(() => container.querySelector('form')!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })));
}

it('saves the displayed Text field without requiring a dropdown change', () => {
  const onSave = renderForm({ 'choice-field': choiceField, 'text-field': textField });
  expect(fieldInput().value).toBe('Text field');
  expect(saveButton().disabled).toBe(true);
  enterTerm('title');
  expect(saveButton().disabled).toBe(false);
  act(() => saveButton().click());
  expect(onSave).toHaveBeenCalledTimes(1);
  expect(onSave).toHaveBeenCalledWith(
    expect.objectContaining({ term: 'title', fieldType: 'text-field', field: textField })
  );
});

it('keeps the displayed and submitted field aligned when registration mutates the registry in place', () => {
  const fields: PluginStore['fields'] = { 'choice-field': choiceField };
  const onSave = renderForm(fields);
  expect(fieldInput().value).toBe('Choice field');

  // registerField adds to the existing fields object rather than replacing it.
  fields['text-field'] = textField;
  enterTerm('title');

  expect(fieldInput().value).toBe('Text field');
  expect(saveButton().disabled).toBe(false);
  act(() => saveButton().click());
  expect(onSave).toHaveBeenCalledTimes(1);
  expect(onSave).toHaveBeenCalledWith(
    expect.objectContaining({ term: 'title', fieldType: 'text-field', field: textField })
  );
});

it('keeps an explicit dropdown choice displayed and submits that field', async () => {
  const onSave = renderForm({ 'text-field': textField, 'choice-field': choiceField });
  await act(async () => fieldInput().click());
  const option = Array.from(document.querySelectorAll<HTMLElement>('[role="option"]')).find(element =>
    element.textContent?.includes('Choice field')
  );
  expect(option).toBeDefined();
  await act(async () => option!.click());
  expect(fieldInput().value).toBe('Choice field');
  enterTerm('category');
  // Another form render must preserve the controlled dropdown selection.
  expect(fieldInput().value).toBe('Choice field');
  act(() => saveButton().click());
  expect(onSave).toHaveBeenCalledWith(
    expect.objectContaining({ term: 'category', fieldType: 'choice-field', field: choiceField })
  );
});

it('saves the first registered available field when Text field is unavailable', () => {
  const onSave = renderForm({ unavailable: undefined, 'choice-field': choiceField });
  expect(fieldInput().value).toBe('Choice field');
  enterTerm('category');
  act(() => saveButton().click());
  expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ fieldType: 'choice-field', field: choiceField }));
});

it('disables saving and safely rejects submission when no fields are available', () => {
  const onSave = renderForm({ unavailable: undefined });
  enterTerm('title');
  expect(fieldInput().value).toBe('');
  expect(fieldInput().disabled).toBe(true);
  expect(saveButton().disabled).toBe(true);
  submitForm();
  expect(onSave).not.toHaveBeenCalled();
});

it('rejects duplicate terms and allows saving after the term is corrected', () => {
  const onSave = renderForm({ 'text-field': textField }, ['title']);
  enterTerm('title');
  expect(container.textContent).toContain('The key "title" already exists in this item');
  expect(saveButton().disabled).toBe(true);
  submitForm();
  expect(onSave).not.toHaveBeenCalled();
  enterTerm('description');
  expect(saveButton().disabled).toBe(false);
  act(() => saveButton().click());
  expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ term: 'description', fieldType: 'text-field' }));
});

it('does not notify existing-field callers on mount or when a displayed fallback is needed', () => {
  const onChange = jest.fn();
  const store: PluginStore = {
    fields: { 'text-field': textField, 'choice-field': choiceField },
    selectors: {},
    contentTypes: {},
    refinements: [],
  };
  const renderChooser = (fieldType: string, allowedFieldTypes?: string[]) =>
    act(() =>
      root.render(
        <PluginContext.Provider value={store}>
          <ChooseFieldButton fieldType={fieldType} allowedFieldTypes={allowedFieldTypes} onChange={onChange} />
        </PluginContext.Provider>
      )
    );
  renderChooser('choice-field');
  expect(fieldInput().value).toBe('Choice field');
  renderChooser('missing-field');
  expect(fieldInput().value).toBe('Text field');
  renderChooser('text-field', ['choice-field']);
  expect(fieldInput().value).toBe('Choice field');
  renderChooser('text-field', []);
  expect(fieldInput().disabled).toBe(true);
  expect(onChange).not.toHaveBeenCalled();
});
