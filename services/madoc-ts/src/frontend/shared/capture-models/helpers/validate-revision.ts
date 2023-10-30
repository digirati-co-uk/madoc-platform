import { RequestError } from '../../../../utility/errors/request-error';
import { CaptureModel } from '../types/capture-model';
import { RevisionRequest } from '../types/revision-request';
import { expandModelFields } from './expand-model-fields';
import { findStructure } from './find-structure';
import { filterDocumentByRevision } from './filter-document-by-revision';

export function validateRevision(
  req: RevisionRequest,
  captureModel: CaptureModel,
  {
    allowCanonicalChanges = false,
    allowCustomStructure = false,
    allowAnonymous = false,
  }: {
    allowCanonicalChanges?: boolean;
    allowCustomStructure?: boolean;
    allowAnonymous?: boolean;
  } = {}
) {
  // If the source is `structure` we want to validate that the fields match
  // and that there is a user associated with the change.
  const source = req.source;
  if (source === 'structure' && !allowCanonicalChanges) {
    // We will re-apply the filter that was applied to the frontend.
    // Even if this does not match the structure, it still _needs_ to be
    // describe the fields correctly in order to be valid.
    const filteredDocument = filterDocumentByRevision(req.document, req.revision, captureModel.revisions);

    if (!filteredDocument && (req.revision.deletedFields || []).length === 0) {
      throw new RequestError('Invalid revision: No changes');
    }

    // If the source is `structure` we want to make sure a user was associated. We add this to the revision.
    // This will be added by the consuming service. (In addition to checking `allowCanonicalChanges`)
    const author = req.author;
    if (!allowAnonymous && !author) {
      throw new RequestError('No user associated with change');
    }

    if (!req.revision.structureId) {
      throw new RequestError('Revision requires structure ID, use { allowCanonicalChanges: true } to override');
    }

    if (!allowCustomStructure) {
      // If the source is `structure` we also want to check the attached structureId and compare it against
      // the fields loaded. Although these may drift over time, for new items they must match.
      const structure = findStructure(captureModel, req.revision.structureId);

      // Model Root field (new option - allowCustomModelRoot)
      // Fork Values boolean
      // Editable above root option.
      // Prevent additions adjacent to root
      // We need a test to detect and then test that each of these hold. With options to override.
      // Then we need to traverse, from the structure root (can split doc with utility)
      // And only save new fields from the model root – downwards. MAKE SURE THEY ARE CONNECTED
      if (!structure || structure.type === 'choice') {
        throw new RequestError('Invalid structureId in revision');
      }

      // Diff the keys.
      const keysInStructure = new Set(expandModelFields(structure.fields).map(f => f.join('.')));
      const keysInRevision = new Set(expandModelFields(req.revision.fields).map(f => f.join('.')));

      if (keysInRevision.size !== keysInStructure.size) {
        throw new RequestError(
          'Revision fields do not match structure, use { allowCustomStructure: true } to override'
        );
      }

      for (const key of keysInRevision) {
        if (!keysInStructure.has(key)) {
          throw new RequestError(
            `Revision fields do not match structure, missing ${key}, use { allowCustomStructure: true } to override`
          );
        }
      }
    }
    return filteredDocument;
  }

  return req.document;
}
