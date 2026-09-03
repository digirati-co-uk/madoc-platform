import { ApiError } from '../../src/utility/errors/api-error';

test('includes useful HTTP context without query parameters', () => {
  const error = new ApiError('Unknown error', {
    status: 500,
    statusText: 'Internal Server Error',
    url: 'http://gateway:8080/api/tasks/task-id/subtasks?debug=true',
  });

  expect(error.message).toBe('Unknown error (HTTP 500 Internal Server Error · /api/tasks/task-id/subtasks)');
});
