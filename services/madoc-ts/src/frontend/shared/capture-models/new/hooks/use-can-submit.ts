import { Revisions } from '../../editor/stores/revisions';
import { isEntity } from '../../helpers/is-entity';
import { resolveSelector } from '../../helpers/resolve-selector';
import { CaptureModel } from '../../types/capture-model';
import { BaseField } from '../../types/field-types';
import { isEmptyFieldList } from '../../utility/is-field-list-empty';

export function selectorBlocksSubmission(fieldOrEntity: BaseField | CaptureModel['document'], revisionId?: string) {
  if (!fieldOrEntity.selector) {
    return false;
  }

  const selector = resolveSelector(fieldOrEntity.selector, revisionId);
  if (!selector?.required || selector.state) {
    return false;
  }

  return isEntity(fieldOrEntity) || !!fieldOrEntity.required || !isEmptyFieldList([fieldOrEntity]);
}

export function useCanSubmit() {
  const selectorsToValidate: Array<BaseField | CaptureModel['document']> = [];
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
          }
          if (singleFieldOrEntity.selector) {
            selectorsToValidate.push(singleFieldOrEntity);
          }
        }
      }
    }
  }

  if (revision) {
    for (const fieldOrEntity of selectorsToValidate) {
      if (selectorBlocksSubmission(fieldOrEntity, revision.revision.id)) {
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
