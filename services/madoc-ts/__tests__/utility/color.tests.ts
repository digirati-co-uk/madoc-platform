import { parseHex, parseRGBA } from '../../src/utility/color';

describe('Color', () => {
  test('parseHex', () => {
    expect(parseHex('#000')).toEqual({ r: 0, g: 0, b: 0, a: 1 });
    expect(parseHex('#fff')).toEqual({ r: 255, g: 255, b: 255, a: 1 });
    expect(parseHex('#f00')).toEqual({ r: 255, g: 0, b: 0, a: 1 });

    expect(parseHex('#000000')).toEqual({ r: 0, g: 0, b: 0, a: 1 });
    expect(parseHex('#ffffff')).toEqual({ r: 255, g: 255, b: 255, a: 1 });
    expect(parseHex('#ff0000')).toEqual({ r: 255, g: 0, b: 0, a: 1 });

    // Does not support this format.
    // expect(parseHex('#000000ff')).toEqual({ r: 0, g: 0, b: 0, a: 1 });
    // expect(parseHex('#ffffffff')).toEqual({ r: 255, g: 255, b: 255, a: 1 });
    // expect(parseHex('#ff0000ff')).toEqual({ r: 255, g: 0, b: 0, a: 1 });
    // expect(parseHex('#00000000')).toEqual({ r: 0, g: 0, b: 0, a: 0 });
    // expect(parseHex('#ffffff00')).toEqual({ r: 255, g: 255, b: 255, a: 0 });
    // expect(parseHex('#ff000000')).toEqual({ r: 255, g: 0, b: 0, a: 0 });

    expect(() => parseHex('NOPE')).toThrow();
  });

  test('parseRGBA', () => {
    expect(parseRGBA('rgb(255, 255, 255)')).toEqual({ r: 255, b: 255, g: 255, a: 1 });
    expect(parseRGBA('rgba(255, 255, 255, 1)')).toEqual({ r: 255, b: 255, g: 255, a: 1 });
    expect(parseRGBA('rgba(255, 255, 255, 0.5)')).toEqual({ r: 255, b: 255, g: 255, a: 0.5 });
  });
});
