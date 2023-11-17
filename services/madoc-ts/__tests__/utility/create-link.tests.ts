import { createLink } from '../../src/frontend/shared/utility/create-link';

describe('createLink', () => {
  test('it can create /reviews/{taskId} link', () => {
    const link = createLink({
      subRoute: 'reviews',
      taskId: '1234',
    });

    expect(link).toEqual('/reviews/1234');
  });
});
