import { CaptureModel, Revision } from '../types/capture-model';
import { BaseField } from '../types/field-types';
import { filterCaptureModel } from './filter-capture-model';
import { expandModelFields } from './expand-model-fields';
import { recurseRevisionDependencies } from './recurse-revision-dependencies';

export function filterDocumentByRevision(
  document: CaptureModel['document'],
  revision: Revision,
  revisions: CaptureModel['revisions'] = []
): CaptureModel['document'] | null {
  const revisionIds = recurseRevisionDependencies(revision.id, revisions);
  return filterCaptureModel(
    revision.id,
    document,
    expandModelFields(revision.fields),
    (field, parent) => {
      if (parent.selector && parent.selector.revisedBy) {
        for (const selector of parent.selector.revisedBy) {
          if (selector.revisionId && revisionIds.indexOf(selector.revisionId) !== -1) {
            field.immutable = true;
            return true;
          }
        }
      }

      if (field.revision && revisionIds.indexOf(field.revision) !== -1) {
        if (field.revision !== revision.id) {
          field.immutable = true;
        }

        return true;
      }

      if (field.selector && field.selector.revisedBy) {
        for (const selector of field.selector.revisedBy) {
          if (selector.revisionId && revisionIds.indexOf(selector.revisionId) !== -1) {
            if (field.revision !== revision.id) {
              field.immutable = true;
            }

            return true;
          }
        }
      }

      return false;
    },
    fields => {
      const newFields: BaseField[] = [];
      for (const field of fields) {
        if (field.selector && field.selector.revisedBy) {
          const newField = {
            ...field,
            immutable: field.revision === revision.id,
            revisedBy: field.selector.revisedBy.filter(r => r.revisionId === revision.id),
          };
          newFields.push(newField);
        } else {
          newFields.push(field);
        }
      }
      return newFields;
    }
  );
}
