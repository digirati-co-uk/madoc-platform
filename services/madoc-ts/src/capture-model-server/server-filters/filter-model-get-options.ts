import { CaptureModel } from '../../frontend/shared/capture-models/types/capture-model';
import { CaptureModelGetOptions } from '../types';
import { extractRevisionWithStatuses } from './extract-revision-with-statuses';
import { extractValidUserRevisionsIds } from './extract-valid-user-revisions-ids';
import { filterDocumentRevisions } from './filter-document-revisions';
import { filterMissingRevisions } from './filter-missing-revisions';
import { removeFieldsDeletedByPublishedRevisions } from './remove-fields-deleted-by-published-revisions';

export function filterModelGetOptions(
  fullModel: CaptureModel,
  {
    onlyRevisionFields,
    // context,
    // includeCanonical,
    userId,
    revisionStatuses,
    revisionId,
    revisionStatus,
    showAllRevisions,
    showDeletedFields,
    filterDeletedRevisions = true,
  }: CaptureModelGetOptions
): CaptureModel {
  if (userId && !showAllRevisions) {
    const { excludedRevisions } = extractValidUserRevisionsIds(fullModel, userId);
    // This is a mutate-y function.
    filterDocumentRevisions(fullModel.document, excludedRevisions, onlyRevisionFields);
    fullModel.revisions = (fullModel.revisions || []).filter(r => excludedRevisions.indexOf(r.id) === -1);
  }

  revisionStatuses = revisionStatuses || (revisionStatus ? [revisionStatus] : undefined);

  if (revisionId) {
    const toExclude = (fullModel.revisions || []).filter(r => r.id !== revisionId).map(r => r.id);
    filterDocumentRevisions(fullModel.document, toExclude, onlyRevisionFields);
    fullModel.revisions = (fullModel.revisions || []).filter(r => toExclude.indexOf(r.id) === -1);
  } else if (revisionStatuses && revisionStatuses.length) {
    const revisionIds = extractRevisionWithStatuses(fullModel, revisionStatuses);
    const toExclude = (fullModel.revisions || []).filter(r => revisionIds.indexOf(r.id) === -1).map(r => r.id);
    filterDocumentRevisions(fullModel.document, toExclude, onlyRevisionFields);
    fullModel.revisions = (fullModel.revisions || []).filter(r => toExclude.indexOf(r.id) === -1);
  }

  if (!showDeletedFields) {
    fullModel = removeFieldsDeletedByPublishedRevisions(fullModel);
  }

  if (filterDeletedRevisions) {
    filterMissingRevisions(fullModel);
  }

  return fullModel;
}
