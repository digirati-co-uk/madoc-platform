import { createTask, hasFinishedDispatch } from '../../src/gateway/tasks/full-reindex-task';

describe('full reindex task', () => {
  test('is queued for the site and only completes when every dispatched batch is done', () => {
    expect(createTask(42)).toMatchObject({
      type: 'full-reindex',
      subject: 'urn:madoc:site:42',
      parameters: [42],
      status: 0,
    });
    expect(hasFinishedDispatch({}, 0)).toBe(true);
    expect(hasFinishedDispatch({ '2': 1, '3': 10 }, 11)).toBe(false);
    expect(hasFinishedDispatch({ '2': 0, '3': 11 }, 11)).toBe(true);
  });
});
