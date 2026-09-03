import {
  RESOURCE_STATUS_AVAILABLE,
  RESOURCE_STATUS_COMPLETED,
  RESOURCE_STATUS_IN_PROGRESS,
  RESOURCE_STATUS_SUBMITTED,
  TASK_STATUS_CHANGES_REQUESTED,
  TASK_STATUS_REJECTED,
  isContinuableTaskStatus,
} from '../../src/utility/resource-status';

test.each<[number, boolean]>([
  [TASK_STATUS_REJECTED, false],
  [RESOURCE_STATUS_AVAILABLE, true],
  [RESOURCE_STATUS_IN_PROGRESS, true],
  [RESOURCE_STATUS_SUBMITTED, false],
  [RESOURCE_STATUS_COMPLETED, false],
  [TASK_STATUS_CHANGES_REQUESTED, true],
])('task status %i is continuable: %s', (status, expected) => {
  expect(isContinuableTaskStatus(status)).toBe(expected);
});
