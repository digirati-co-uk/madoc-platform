import { RevisionRequest } from '../types/revision-request';
import { generateId } from './generate-id';
import { createRevisionDocument } from './create-revision-document';
import { createRevisionRequest } from './create-revision-request';

export function forkExistingRevision(
  baseRevision: RevisionRequest,
  {
    cloneMode = 'FORK_TEMPLATE',
    modelRoot = [],
    modelMapping = {},
  }: {
    cloneMode: any;
    modelRoot: string[];
    modelMapping: Partial<{ [key: string]: string }>;
  }
) {
  // Document
  const documentToClone = baseRevision.document;

  // New id
  const newRevisionId = generateId();
  // Create document
  const newDocument = createRevisionDocument(
    newRevisionId,
    documentToClone,
    cloneMode,
    modelRoot ? modelRoot : baseRevision.modelRoot,
    modelMapping
  );

  if (!newDocument) {
    throw new Error('Invalid capture model');
  }

  // Set our new id.
  baseRevision.revision.id = newRevisionId;

  // Add new revision request
  const revisionRequest = createRevisionRequest(
    baseRevision.captureModelId as string,
    baseRevision.revision,
    newDocument
  );
  revisionRequest.revision.revises = baseRevision.revision.id;
  revisionRequest.revision.id = newRevisionId;

  // New status?
  revisionRequest.revision.approved = false;
  revisionRequest.revision.status = 'draft';

  return revisionRequest;
}
