import { selectorBlocksSubmission } from '../../../src/frontend/shared/capture-models/new/hooks/use-can-submit';
import { BaseField } from '../../../src/frontend/shared/capture-models/types/field-types';

function field(value: string, required = false): BaseField {
  return {
    id: 'field',
    type: 'text-field',
    label: 'Image',
    value,
    required,
    selector: {
      id: 'selector',
      type: 'box-selector',
      required: true,
      state: null,
    },
  };
}

test('only requires the selector when an optional field is used', () => {
  expect(selectorBlocksSubmission(field(''))).toBe(false);
  expect(selectorBlocksSubmission(field('Description of image'))).toBe(true);
  expect(selectorBlocksSubmission(field('', true))).toBe(true);
});
