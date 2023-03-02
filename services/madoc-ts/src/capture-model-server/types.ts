interface BaseOptions {
  context?: string[];
}

export interface CaptureModelGetOptions extends BaseOptions {
  fullModel?: boolean;
  includeCanonical?: boolean;
  revisionStatus?: string;
  revisionStatuses?: string[];
  onlyRevisionFields?: boolean;
  showDeletedFields?: boolean;
  revisionId?: string;
  userId?: number;
  showAllRevisions?: boolean;
  filterDeletedRevisions?: boolean;
}
