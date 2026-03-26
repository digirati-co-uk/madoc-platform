import type { TabularFlaggedCellItem } from './tabular-project-custom-editor-sidebar';

export type TabularReviewIssueSeverity = 'blocking';

export type TabularReviewIssueType = 'table-error' | 'flagged-cell' | 'orphan-flagged-cell';

export type TabularReviewIssueFlagContext = Pick<
  TabularFlaggedCellItem,
  'key' | 'rowIndex' | 'columnKey' | 'columnLabel' | 'comment'
> & {
  canFocusCell: boolean;
};

export type TabularReviewIssue = {
  id: string;
  type: TabularReviewIssueType;
  severity: TabularReviewIssueSeverity;
  message: string;
  rowIndex?: number;
  columnKey?: string;
  focusable: boolean;
};

const BLOCKING_SEVERITY: TabularReviewIssueSeverity = 'blocking';
const TABLE_ERROR_PREFIX = 'table-error';
const FLAG_PREFIX = 'flag';

export function isFocusableTabularReviewIssue(
  issue: TabularReviewIssue
): issue is TabularReviewIssue & { focusable: true; rowIndex: number; columnKey: string } {
  return issue.focusable && typeof issue.rowIndex === 'number' && typeof issue.columnKey === 'string';
}

function getFlagIssueMessage(flag: TabularReviewIssueFlagContext) {
  const location = `Row ${flag.rowIndex + 1}, ${flag.columnLabel}`;
  if (!flag.canFocusCell) {
    return `Flagged cell (${location}) is no longer available in the current table view.`;
  }

  return `Flagged cell requires review (${location}).`;
}

export function detectTabularReviewIssues(options: {
  visibleTableErrors: string[];
  flaggedCells: TabularReviewIssueFlagContext[];
}): TabularReviewIssue[] {
  const tableErrorIssues = options.visibleTableErrors
    .map(error => error.trim())
    .filter(Boolean)
    .map((message, index) => ({
      id: `${TABLE_ERROR_PREFIX}:${index}`,
      type: 'table-error' as const,
      severity: BLOCKING_SEVERITY,
      message,
      focusable: false,
    }));

  const flaggedIssues = options.flaggedCells.map(flag => ({
    id: `${FLAG_PREFIX}:${flag.key}`,
    type: (flag.canFocusCell ? 'flagged-cell' : 'orphan-flagged-cell') as TabularReviewIssueType,
    severity: BLOCKING_SEVERITY,
    message: getFlagIssueMessage(flag),
    rowIndex: flag.rowIndex,
    columnKey: flag.columnKey,
    focusable: flag.canFocusCell,
  }));

  return [...tableErrorIssues, ...flaggedIssues];
}
