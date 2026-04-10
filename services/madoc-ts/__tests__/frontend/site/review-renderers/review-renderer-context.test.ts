/**
 * @jest-environment node
 */

import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  ReviewRendererContextProvider,
  useReviewRendererContext,
} from '../../../../src/frontend/site/pages/tasks/review-renderers/review-renderer-context';
import {
  getApproveDisabledReason,
  getReviewRendererMode,
  ReviewRendererContextValue,
} from '../../../../src/frontend/site/pages/tasks/review-renderers/types';

const ContextProbe: React.FC = () => {
  const context = useReviewRendererContext();
  return React.createElement('span', {}, context.mode);
};

describe('review renderer context', () => {
  test('throws outside provider', () => {
    expect(() => renderToStaticMarkup(React.createElement(ContextProbe))).toThrow(
      'useReviewRendererContext must be used inside ReviewRendererContextProvider'
    );
  });

  test('returns context value inside provider', () => {
    const value: ReviewRendererContextValue = {
      task: { id: 'task-1', name: 'Task 1' } as any,
      review: null,
      project: undefined,
      mode: 'write',
      isEditing: true,
      setIsEditing: jest.fn(),
      isDone: false,
      isLocked: false,
      canReview: true,
      wasRejected: false,
      subjectType: 'canvas',
      assigneeName: 'User',
      reviewAssigneeName: 'Reviewer',
      actions: {
        reject: async () => undefined,
        requestChanges: async () => undefined,
        approve: async () => undefined,
        toggleEditing: () => undefined,
      },
    };

    const html = renderToStaticMarkup(
      React.createElement(ReviewRendererContextProvider, {
        value,
        children: React.createElement(ContextProbe),
      })
    );

    expect(html).toContain('write');
  });

  test('maps edit mode to renderer mode', () => {
    expect(getReviewRendererMode(true)).toBe('write');
    expect(getReviewRendererMode(false)).toBe('read');
  });

  test('formats approve disabled reason from blocking issue count', () => {
    expect(getApproveDisabledReason(0)).toBeUndefined();
    expect(getApproveDisabledReason(1)).toEqual('Resolve 1 blocking issue before approving.');
    expect(getApproveDisabledReason(2)).toEqual('Resolve 2 blocking issues before approving.');
  });
});
