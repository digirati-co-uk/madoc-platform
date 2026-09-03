import { estimateRemainingSeconds, formatEta } from '../../../../src/frontend/shared/utility/estimated-time-remaining';

describe('estimated time remaining', () => {
  const started = Date.parse('2026-08-26T10:00:00Z');

  it('estimates from completed items', () => {
    expect(estimateRemainingSeconds(started, 25, 75, started + 50_000)).toBe(150);
  });

  it.each([
    [undefined, 10, 20],
    ['invalid', 10, 20],
    [started, 0, 20],
    [started, 10, 0],
  ])('returns null when an estimate cannot be calculated', (startedAt, completed, remaining) => {
    expect(estimateRemainingSeconds(startedAt, completed, remaining, started + 50_000)).toBeNull();
  });

  it('formats the estimate', () => {
    expect(formatEta(0)).toBe('0s');
    expect(formatEta(45)).toBe('45s');
    expect(formatEta(150)).toBe('2m 30s');
    expect(formatEta(3_661)).toBe('1h 1m 1s');
  });
});
