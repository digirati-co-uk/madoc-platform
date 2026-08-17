import { shouldResumeCollectionImport } from '../../../src/gateway/tasks/should-resume-collection-import';

test('resumes a legacy collection only when failed manifests are waiting', () => {
  expect(shouldResumeCollectionImport({ '-1': 2, '3': 10 })).toBe(true);
  expect(shouldResumeCollectionImport({ '-1': 2, '0': 1, '3': 9 })).toBe(false);
  expect(shouldResumeCollectionImport({ '3': 12 })).toBe(false);
});
