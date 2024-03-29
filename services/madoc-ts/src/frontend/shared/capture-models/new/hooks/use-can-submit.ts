import { Revisions } from '../../editor/stores/revisions';
import { resolveSelector } from '../../helpers/resolve-selector';
import { BaseSelector } from '../../types/selector-types';

export function useCanSubmit() {
  const selectorsToValidate: BaseSelector[] = [];
  const requiredFieldsToValidate: any[] = [];

  const revision = Revisions.useStoreState(state => state.currentRevision);

  const revisionDocument = revision && revision.document ? revision.document : null;
  const properties =
    revisionDocument && revisionDocument.type === 'entity' ? Object.keys(revisionDocument.properties) : [];

  // Strategy for can submit.
  // 1. Find the top-level we are editing - unrolled entity/model root
  // 2. Create a list of selectors
  // 3. Make sure they are all valid.
  // 4. Make sure fields and selectors that are required have a value
  if (revisionDocument) {
    for (const property of properties) {
      const fieldOrEntity = revisionDocument.properties[property];
      if (fieldOrEntity && fieldOrEntity.length) {
        for (const singleFieldOrEntity of fieldOrEntity) {
          if (singleFieldOrEntity.required) {
            requiredFieldsToValidate.push(singleFieldOrEntity);
            if (singleFieldOrEntity.selector) {
              selectorsToValidate.push(singleFieldOrEntity.selector);
            }
          }
          if (singleFieldOrEntity.selector) {
            selectorsToValidate.push(singleFieldOrEntity.selector);
          }
        }
      }
    }
  }

  if (revision) {
    for (const selector of selectorsToValidate) {
      const resolved = resolveSelector(selector, revision?.revision.id);
      if (resolved && resolved.required && !resolved.state) {
        return false;
      }
    }
    for (const field of requiredFieldsToValidate) {
      if (!field.value || field.value === '') {
        return false;
      }
    }
  }
  return true;
}
