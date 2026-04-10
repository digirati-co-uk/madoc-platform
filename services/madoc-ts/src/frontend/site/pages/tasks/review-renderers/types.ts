import React from 'react';
import { CrowdsourcingReview } from '../../../../../gateway/tasks/crowdsourcing-review';
import { CrowdsourcingTask } from '../../../../../gateway/tasks/crowdsourcing-task';
import { ProjectFull } from '../../../../../types/project-full';

export type ReviewRendererMode = 'read' | 'write';

export type ReviewRendererSubjectType = 'canvas' | 'manifest';

export type ReviewRendererActionCallbacks = {
  reject: () => Promise<void>;
  requestChanges: () => Promise<void>;
  approve: () => Promise<void>;
  toggleEditing: () => void;
  startMerge?: () => Promise<void>;
};

export type ReviewRendererContextValue = {
  task: CrowdsourcingTask & { id: string };
  review: (CrowdsourcingReview & { id: string }) | null;
  project: ProjectFull<any> | undefined;
  mode: ReviewRendererMode;
  isEditing: boolean;
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
  isDone: boolean;
  isLocked: boolean;
  canReview: boolean;
  wasRejected: boolean;
  subjectType: ReviewRendererSubjectType;
  assigneeName?: string;
  reviewAssigneeName?: string;
  actions: ReviewRendererActionCallbacks;
};

export type ReviewDefaultControlsProps = {
  compact?: boolean;
};

export type ReviewDefaultControlsComponent = React.FC<ReviewDefaultControlsProps>;

export type ReviewBlockingIssueState = {
  hasBlockingIssues: boolean;
  blockingIssueCount: number;
};

export const EMPTY_REVIEW_BLOCKING_ISSUES: ReviewBlockingIssueState = {
  hasBlockingIssues: false,
  blockingIssueCount: 0,
};

export function toReviewBlockingIssueState(blockingIssueCount: number): ReviewBlockingIssueState {
  return {
    hasBlockingIssues: blockingIssueCount > 0,
    blockingIssueCount,
  };
}

export function getApproveDisabledReason(blockingIssueCount: number): string | undefined {
  if (blockingIssueCount < 1) {
    return undefined;
  }

  return `Resolve ${blockingIssueCount} blocking issue${blockingIssueCount === 1 ? '' : 's'} before approving.`;
}

export type CustomReviewRendererProps = {
  mode: ReviewRendererMode;
  subjectType: ReviewRendererSubjectType;
  viewer?: React.ReactNode;
  saveControl?: React.ReactNode;
  controls?: React.ReactNode;
  DefaultControls: ReviewDefaultControlsComponent;
  onBlockingIssuesChange?: (next: ReviewBlockingIssueState) => void;
};

export type CustomAdminPreviewRendererProps = {
  mode: ReviewRendererMode;
  subjectType: ReviewRendererSubjectType;
  viewer?: React.ReactNode;
  saveControl?: React.ReactNode;
  controls?: React.ReactNode;
  DefaultControls?: React.FC;
};

export function getReviewRendererMode(isEditing: boolean): ReviewRendererMode {
  return isEditing ? 'write' : 'read';
}
