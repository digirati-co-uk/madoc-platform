/** @jest-environment jsdom */
import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import i18next, { i18n } from 'i18next';
import { I18nextProvider, initReactI18next } from 'react-i18next';
import { Formik } from 'formik';
import { GuidedFormatPicker } from '../../../src/frontend/shared/capture-models/editor/input-types/TextField/GuidedFormatPicker';
import { TextFieldInputFormat } from '../../../src/frontend/shared/utility/text-field-format';

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let container: HTMLDivElement;
let root: Root;
let instance: i18n;
const oldTimeLabel = 'HH:mm (optional seconds and fractions)';
const oldDateTimeLabel = 'DD-MM-YYYY HH:mm (optional seconds and fractions)';
const oldTimeHint = 'Use 24-hour time: HH:mm (optional seconds, for example 14:30:05).';
const oldDateTimeHint = 'Use DD-MM-YYYY HH:mm (24-hour time; optional seconds).';

beforeEach(async () => {
  // Match the client namespaces/key separator; deliberately retain i18next's default ':' namespace separator.
  instance = i18next.createInstance();
  await instance.use(initReactI18next).init({
    lng: 'en',
    fallbackLng: 'en',
    ns: ['madoc', 'capture-models'],
    defaultNS: 'madoc',
    keySeparator: false,
    resources: {
      en: {
        madoc: {
          'Decimal point': 'Translated decimal point',
          'HH:mm': 'A format token must not be translated',
          [oldTimeLabel]: `Translated ${oldTimeLabel}`,
          [oldDateTimeLabel]: `Translated ${oldDateTimeLabel}`,
          [oldTimeHint]: `Translated ${oldTimeHint}`,
          [oldDateTimeHint]: `Translated ${oldDateTimeHint}`,
        },
      },
    },
  });
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});
afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

function render(inputFormat: TextFieldInputFormat) {
  act(() =>
    root.render(
      <I18nextProvider i18n={instance}>
        <Formik initialValues={{ inputFormat }} onSubmit={() => undefined}>
          <GuidedFormatPicker />
        </Formik>
      </I18nextProvider>
    )
  );
}
function option(value: string): string {
  return container.querySelector<HTMLOptionElement>(`option[value="${value}"]`)!.textContent!;
}

it('renders time/date token labels literally while translating descriptive number labels', () => {
  // Verify that this real i18next instance reproduces the original failure without the component fix.
  expect(instance.t('HH:mm')).toBe('mm');
  render('time-hm');
  expect(option('time-hm')).toBe('HH:mm · e.g. 14:30');
  expect(option('time-hms')).toBe('HH:mm:ss · e.g. 14:30:05');
  expect(option('datetime-dmy-hm')).toBe('DD-MM-YYYY HH:mm · e.g. 25-12-2024 14:30');
  expect(option('datetime-iso-hm')).toBe('YYYY-MM-DDTHH:mm · e.g. 2024-12-25T14:30');
  expect(option('number-decimal')).toBe('Translated decimal point · e.g. 1234.56');
  expect(container.querySelector('[id$="-format"]')!.textContent).toBe('HH:mm · e.g. 14:30');
});

it.each<[TextFieldInputFormat, string, string]>([
  ['time', oldTimeLabel, oldTimeHint],
  ['date-time', oldDateTimeLabel, oldDateTimeHint],
])(
  'translates complete legacy %s labels and hints without parsing format colons as namespaces',
  (inputFormat, label, hint) => {
    render(inputFormat);
    expect(option(inputFormat)).toBe(`Translated ${label}`);
    expect(container.querySelector('[id$="-format"]')!.textContent).toBe(`Translated ${hint}`);
    const input = container.querySelector('input')!;
    act(() => {
      input.focus();
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(input, 'invalid');
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
    act(() => input.blur());
    expect(container.querySelector('[id$="-status"]')!.textContent).toBe(`Translated ${hint}`);
  }
);
