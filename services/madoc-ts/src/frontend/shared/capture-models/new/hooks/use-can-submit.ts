import { Revisions } from '../../editor/stores/revisions/index';
import { BaseSelector } from '../../types/selector-types';

export function useCanSubmit() {
  const selectorsToValidate: BaseSelector[] = [];

  const revision = Revisions.useStoreState(state => state.currentRevision);

  const revisionDocument = revision && revision.document ? revision.document : null;
  const properties =
    revisionDocument && revisionDocument.type === 'entity' ? Object.keys(revisionDocument.properties) : [];

  // Strategy for can submit.
  // 1. Find the top-level we are editing - unrolled entity/model root
  // 2. Create a list of selectors
  // 3. Make sure they are all valid.
  if (revisionDocument) {
    for (const property of properties) {
      const fieldOrEntity = revisionDocument.properties[property];
      if (fieldOrEntity && fieldOrEntity.length) {
        for (const singleFieldOrEntity of fieldOrEntity) {
          if (singleFieldOrEntity.selector) {
            selectorsToValidate.push(singleFieldOrEntity.selector);
          }
        }
      }
    }
  }

  if (true as boolean) {
    return false;
  }

  for (const selector of selectorsToValidate) {
    if (selector && selector.required && !selector.state) {
      return false;
    }
  }

  return true;
}
