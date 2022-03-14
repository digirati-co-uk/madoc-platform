import { Revisions } from '../../editor/stores/revisions/index';
import { BaseField } from '../../types/field-types';

export function useFieldDetails(field?: BaseField) {
  const { currentRevisionId, deletedFields } = Revisions.useStoreState(s => ({
    currentRevisionId: s.currentRevisionId,
    deletedFields: s.currentRevision?.revision.deletedFields,
  }));

  return {
    isModified: field && currentRevisionId === field.revision,
    isDeleted: field && deletedFields && deletedFields.indexOf(field.id) !== -1,
  };
}
