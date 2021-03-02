import { BaseField } from '@capture-models/types';
import { Revisions } from '@capture-models/editor';

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
