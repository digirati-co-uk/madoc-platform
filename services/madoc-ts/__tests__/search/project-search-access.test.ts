import { onlyPublishedProjects } from '../../src/utility/user-with-scope';

test('only site admins can search unpublished projects', () => {
  expect(onlyPublishedProjects(['site.admin'])).toBe(false);
  expect(onlyPublishedProjects(['models.contribute'])).toBe(true);
  expect(onlyPublishedProjects()).toBe(true);
});
