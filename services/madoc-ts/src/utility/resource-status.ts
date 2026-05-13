import { parseUrn } from './parse-urn';

export const RESOURCE_STATUS_AVAILABLE = 0;
export const RESOURCE_STATUS_IN_PROGRESS = 1;
export const RESOURCE_STATUS_SUBMITTED = 2;
export const RESOURCE_STATUS_COMPLETED = 3;
export const TASK_STATUS_CHANGES_REQUESTED = 4;
export const TASK_STATUS_REJECTED = -1;

export const HIDE_COMPLETED_FILTER = `${RESOURCE_STATUS_COMPLETED}`;
export const SHOW_AVAILABLE_FILTER = `${RESOURCE_STATUS_IN_PROGRESS},${RESOURCE_STATUS_SUBMITTED},${RESOURCE_STATUS_COMPLETED}`;

export type ResourceStatus =
  | typeof RESOURCE_STATUS_AVAILABLE
  | typeof RESOURCE_STATUS_IN_PROGRESS
  | typeof RESOURCE_STATUS_SUBMITTED
  | typeof RESOURCE_STATUS_COMPLETED;

export interface TaskSubjectStatus {
  subject: string;
  status: number;
}

export function filterHiddenSubjects<T extends TaskSubjectStatus>(subjects: T[], hideStatus: string[]) {
  const hiddenIds: number[] = [];
  const visibleSubjects: T[] = [];

  for (const subject of subjects) {
    const parsedUrn = parseUrn(subject.subject);
    if (!parsedUrn) continue;

    if (hideStatus.includes(`${subject.status}`)) {
      hiddenIds.push(parsedUrn.id);
    } else {
      visibleSubjects.push(subject);
    }
  }

  return { hiddenIds, visibleSubjects };
}

export function isActiveTaskStatus(status: number) {
  return status !== TASK_STATUS_REJECTED;
}

export function mapUserTaskStatus(status: number): ResourceStatus {
  switch (status) {
    case RESOURCE_STATUS_COMPLETED:
      return RESOURCE_STATUS_COMPLETED;
    case RESOURCE_STATUS_SUBMITTED:
      return RESOURCE_STATUS_SUBMITTED;
    case RESOURCE_STATUS_AVAILABLE:
    case RESOURCE_STATUS_IN_PROGRESS:
    case TASK_STATUS_CHANGES_REQUESTED:
      return RESOURCE_STATUS_IN_PROGRESS;
    default:
      return RESOURCE_STATUS_AVAILABLE;
  }
}

export function mapProjectTaskStatus(status: number, isPreparing = false): ResourceStatus | undefined {
  switch (status) {
    case RESOURCE_STATUS_COMPLETED:
      return RESOURCE_STATUS_COMPLETED;
    case RESOURCE_STATUS_SUBMITTED:
      return RESOURCE_STATUS_IN_PROGRESS;
    case RESOURCE_STATUS_AVAILABLE:
    case RESOURCE_STATUS_IN_PROGRESS:
      return isPreparing ? RESOURCE_STATUS_IN_PROGRESS : RESOURCE_STATUS_AVAILABLE;
    default:
      return undefined;
  }
}
