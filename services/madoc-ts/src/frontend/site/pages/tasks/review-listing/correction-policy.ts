import type { CaptureModel } from '../../../../shared/capture-models/types/capture-model';

interface CorrectionPolicyInput {
  scope: readonly string[];
  taskStatus: number;
  revisionId?: string;
  model?: CaptureModel;
  activeMerge?: boolean;
  customRenderer?: boolean;
  tabular?: boolean;
}

export function canCorrectApprovedValues(input: CorrectionPolicyInput): boolean {
  const revision = input.model?.revisions?.find(item => item.id === input.revisionId);
  return (
    // Match userWithScope's site.admin override; models.admin alone does not grant PUT.
    (input.scope.includes('site.admin') ||
      (input.scope.includes('models.admin') && input.scope.includes('models.create'))) &&
    input.taskStatus === 3 &&
    !!input.model?.id &&
    !!revision &&
    revision.status === 'accepted' &&
    revision.approved === true &&
    !revision.tabularAlignment &&
    !input.activeMerge &&
    !input.customRenderer &&
    !input.tabular
  );
}
