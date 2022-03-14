import { CaptureModel } from '../../types/capture-model';
import { BaseField } from '../../types/field-types';
import { resolveSelector } from '../../helpers/resolve-selector';
import { isRequiredSelectorIncomplete } from '../../utility/is-required-selector-incomplete';
import { Revisions } from '../../editor/stores/revisions';

export function useResolvedSelector(entityOrField: CaptureModel['document'] | BaseField) {
  const revisionId = Revisions.useStoreState(s => s.currentRevisionId);
  const resolvedSelector = entityOrField.selector ? resolveSelector(entityOrField.selector, revisionId) : undefined;
  const isBlockingForm = isRequiredSelectorIncomplete(resolvedSelector);

  return [resolvedSelector, { isBlockingForm }] as const;
}
