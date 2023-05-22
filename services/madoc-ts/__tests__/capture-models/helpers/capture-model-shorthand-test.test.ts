jest.mock('.../../../src/frontend/shared/capture-models/helpers/generate-id', () => {
  return {
    __esModule: true,
    generateId() {
      return '[auto-generated]';
    },
  };
});

import { captureModelShorthandText } from '../../../src/frontend/shared/capture-models/helpers/capture-model-shorthand-text';
import { captureModelShorthand } from '../../../src';
import { unindent } from '../../../test-utility/unindent';

describe('Capture model shorthand (text version)', function() {
  test('it can work with simple fields', () => {
    const shorthand = unindent(`
      First name
      Last name
    `);

    expect(captureModelShorthandText(shorthand)).toEqual(
      captureModelShorthand({
        'first-name': { type: 'international-field', label: 'First name', value: { none: [''] } },
        'last-name': { type: 'international-field', label: 'Last name', value: { none: [''] } },
      })
    );
  });
  test('default values', () => {
    const shorthand = unindent(`
      First name {@default/Stephen}
      Last name {@default/Fraser}
    `);

    expect(captureModelShorthandText(shorthand)).toEqual(
      captureModelShorthand({
        'first-name': { type: 'international-field', label: 'First name', value: { none: ['Stephen'] } },
        'last-name': { type: 'international-field', label: 'Last name', value: { none: ['Fraser'] } },
      })
    );
  });
  test('default values + lang', () => {
    const shorthand = unindent(`
      First name {@default/Stephen} {@lang/en}
      Last name {@langs/en,fr}
    `);

    expect(captureModelShorthandText(shorthand)).toEqual(
      captureModelShorthand({
        'first-name': { type: 'international-field', label: 'First name', value: { en: ['Stephen'] } },
        'last-name': { type: 'international-field', label: 'Last name', value: { en: [''], fr: [''] } },
      })
    );
  });
  test('default values + lang 2', () => {
    const shorthand = unindent(`
      First name {@default/Stephen} {@lang/en}
      Last name {@langs/en,fr} {@default/Fraser}
    `);

    expect(captureModelShorthandText(shorthand)).toEqual(
      captureModelShorthand({
        'first-name': { type: 'international-field', label: 'First name', value: { en: ['Stephen'] } },
        'last-name': { type: 'international-field', label: 'Last name', value: { en: ['Fraser'], fr: ['Fraser'] } },
      })
    );
  });
  test('default values + lang 3', () => {
    const shorthand = unindent(`
      First name {@default/Stephen} {@lang/en}
      Last name {@langs/en,fr} {@default/Fraser} {@defaultLang/en}
    `);

    expect(captureModelShorthandText(shorthand)).toEqual(
      captureModelShorthand({
        'first-name': { type: 'international-field', label: 'First name', value: { en: ['Stephen'] } },
        'last-name': { type: 'international-field', label: 'Last name', value: { en: ['Fraser'], fr: [''] } },
      })
    );
  });

  test('text fields, ignoring lang', () => {
    const shorthand = unindent(`
      First name {@type/text-field} {@lang/en} {@default/Stephen}
      Last name {@type/text-field}
    `);

    expect(captureModelShorthandText(shorthand)).toEqual(
      captureModelShorthand({
        'first-name': { type: 'text-field', label: 'First name', value: 'Stephen' },
        'last-name': { type: 'text-field', label: 'Last name', value: '' },
      })
    );
  });

  test('allow multiple', () => {
    const shorthand = unindent(`
      Label {@type/international-field} {@langs/en,de}
      Description
      Tags {@many} {@type/text-field}
    `);

    expect(captureModelShorthandText(shorthand)).toEqual(
      captureModelShorthand({
        label: { type: 'international-field', label: 'Label', value: { en: [''], de: [''] } },
        description: { type: 'international-field', label: 'Description', value: { none: [''] } },
        tags: { type: 'text-field', label: 'Tags', allowMultiple: true, value: '' },
      })
    );
  });
});
