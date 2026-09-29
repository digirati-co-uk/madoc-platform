/** @vitest-environment jsdom */

import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { EstimatedTimeRemaining } from '../../../../../src/frontend/admin/pages/tasks/EstimatedTimeRemaining';

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, values?: { time?: string }) => key.replace('{{time}}', values?.time || ''),
  }),
}));

describe('EstimatedTimeRemaining', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-08-26T10:00:00Z'));
    container = document.createElement('div');
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    vi.useRealTimers();
  });

  it('counts down and resets when a new estimate arrives', () => {
    act(() => root.render(<EstimatedTimeRemaining seconds={65} />));
    expect(container.textContent).toBe('Estimated time remaining: 1m 5s');

    act(() => vi.advanceTimersByTime(2000));
    expect(container.textContent).toBe('Estimated time remaining: 1m 3s');

    act(() => root.render(<EstimatedTimeRemaining seconds={125} />));
    expect(container.textContent).toBe('Estimated time remaining: 2m 5s');
  });
});
