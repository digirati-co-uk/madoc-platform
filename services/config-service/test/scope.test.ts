import { describe, expect, it } from 'vitest';

import { extendKeylist, genKey, iterateKeylist, iterateSeparatedKeylist } from '../src/scope.js';

describe('scope helpers', () => {
  it('genKey', () => {
    const fourElementList = ['a', 'b', 'c', 'd'];
    const fiveElementList = ['a', 'b', 'c', 'd', 'e'];

    expect(genKey(fourElementList, '|')).toBe('a|b|c|d');
    expect(genKey(fiveElementList, '.')).toBe('a.b.c.d.e');
    expect(genKey([], '.')).toBeUndefined();
  });

  it('iterateSeparatedKeylist', () => {
    const fourElementList = ['a', 'b', 'c', 'd'];

    expect(iterateSeparatedKeylist(fourElementList, '|', false)).toEqual(['a|b|c|d', 'b|c|d', 'a|c|d', 'c|d', 'a|d', 'd']);
    expect(iterateSeparatedKeylist(fourElementList, '|', true, ['x', 'y'])).toEqual([
      'a|b|c|d|x|y',
      'b|c|d|x|y',
      'a|c|d|x|y',
      'c|d|x|y',
      'a|d|x|y',
      'd|x|y',
      'a|x|y',
      'x|y',
      'a|y',
      'y',
    ]);
    expect(iterateSeparatedKeylist([], '|', true, ['x', 'y'])).toBeUndefined();
  });

  it('extendKeylist', () => {
    const fourElementList = ['a', 'b', 'c', 'd'];

    expect(extendKeylist(fourElementList, ['x', 'y'], false)).toEqual(['a', 'b', 'c', 'd']);
    expect(extendKeylist(fourElementList, ['x', 'y'], true)).toEqual(['a', 'b', 'c', 'd', 'x', 'y']);
    expect(extendKeylist(fourElementList, ['d', 'x'], true)).toEqual(['a', 'b', 'c', 'd', 'x']);
    expect(extendKeylist([], ['d', 'x'], true)).toEqual(['d', 'x']);
    expect(extendKeylist([], ['d', 'x'], false)).toEqual([]);
    expect(extendKeylist(null, ['d', 'x'], false)).toBeUndefined();
  });

  it('iterateKeylist', () => {
    const threeElementList = ['a', 'b', 'c'];

    expect(iterateKeylist(threeElementList)).toEqual([
      ['a', 'b', 'c'],
      ['b', 'c'],
      ['a', 'c'],
      ['c'],
    ]);
    expect(iterateKeylist(null)).toBeUndefined();
    expect(iterateKeylist([])).toBeUndefined();
  });
});
