import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { TextField } from '../../../src/frontend/shared/capture-models/editor/input-types/TextField/TextField';
import type { TextFieldInputFormat } from '../../../src/frontend/shared/utility/text-field-format';

jest.mock('../../../src/frontend/shared/capture-models/hooks/use-model-translation', () => ({
  useModelTranslation: () => ({ t: (text: string) => text }),
}));
jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (text: string) => text }) }));

it.each<[TextFieldInputFormat, string]>([
  ['number', '000123.4500'],
  ['number', '90071992547409930000'],
  ['number', '-'],
  ['time', 'historic time unknown'],
  ['date-time', '2020-01-01T12:00:00Z'],
])('displays stored %s strings verbatim, including incompatible legacy data', (inputFormat, value) => {
  const markup = renderToStaticMarkup(
    <TextField
      id="field"
      type="text-field"
      label="Field"
      value={value}
      inputFormat={inputFormat}
      updateValue={() => undefined}
    />
  );
  expect(markup).toContain(`value="${value}"`);
  expect(markup).toContain('type="text"');
  expect(markup).toContain('aria-describedby="field-format"');
});

it('keeps multiline fields unrestricted with their existing minimum lines', () => {
  const markup = renderToStaticMarkup(
    <TextField
      id="field"
      type="text-field"
      label="Field"
      value={'First line\nSecond line'}
      multiline
      minLines={5}
      inputFormat="number"
      updateValue={() => undefined}
    />
  );
  expect(markup).toContain('<textarea');
  expect(markup).toContain('First line\nSecond line');
  expect(markup).not.toContain('field-format');
});
