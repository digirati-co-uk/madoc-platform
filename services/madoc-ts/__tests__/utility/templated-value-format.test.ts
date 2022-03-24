import { templatedValueFormat } from '../../src/frontend/shared/utility/templated-value-format';
import { unindent } from '../../test-utility/unindent';

describe('Templated value format', function() {
  test('default - no modifiers', () => {
    expect(templatedValueFormat('no value')).toEqual({ value: 'no value', modifiers: [] });
  });

  test('default - modifier', () => {
    expect(templatedValueFormat('no value {@mod}')).toEqual({ value: 'no value', modifiers: [{ id: 'mod' }] });
  });

  // test('default - modifier with value', () => {
  //   //
  // });
  test('capture model fields shorthand', () => {
    const text = unindent(`
      Publication/creation
      Physical description
      Contributors {@many}
      Type/technique
      Subjects {@many}
      Attribution {@default/Wellcome collection}
    `);

    const items = text.split('\n');

    expect(items.map(t => templatedValueFormat(t))).toEqual([
      { value: 'Publication/creation', modifiers: [] },
      { value: 'Physical description', modifiers: [] },
      { value: 'Contributors', modifiers: [{ id: 'many', value: undefined }] },
      { value: 'Type/technique', modifiers: [] },
      { value: 'Subjects', modifiers: [{ id: 'many', value: undefined }] },
      { value: 'Attribution', modifiers: [{ id: 'default', value: 'Wellcome collection' }] },
    ]);
  });
});
