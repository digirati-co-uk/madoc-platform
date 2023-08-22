import { CaptureModel } from '../../types/capture-model';
import { BaseField } from '../../types/field-types';
import { resolveSelector } from '../../helpers/resolve-selector';
import { isRequiredSelectorIncomplete } from '../../utility/is-required-selector-incomplete';
import { Revisions } from '../../editor/stores/revisions';
import { traverseDocument } from '../../helpers/traverse-document';
import { filterRevises } from '../../helpers/filter-revises';
import { DocumentStore } from '../../editor/stores/document/document-store';

export function useResolvedDependant(entityOrField: CaptureModel['document'] | BaseField) {
  const revisionId = Revisions.useStoreState(s => s.currentRevisionId);
  const currentRevision = Revisions.useStoreState(s => s.currentRevision);
  const properties = currentRevision;
  // const isBlockingForm = isRequiredSelectorIncomplete(resolvedSelector);
  console.log(currentRevision);
  const hasValue = true;
  return [currentRevision, { hasValue }] as const;
}
