import { CaptureModel } from '../types/capture-model';
import { FlatDocs } from './split-document-by-model-root';

/**
 * Filter document graph.
 *
 * We want to filter out the flat set of documents, that could be at any level. If we displayed the
 * immutable part of the tree, we should show ALL of the additional branches. The input for this is
 * a mapping to reduce this by selecting specific entities by their id { term: id }.
 *
 * We return another split of documents that matched the IDs and the ones that did not. These can be
 * used when traversing the capture model to filter out completely.
 *
 * @param documents
 * @param modelMapping
 */
export function filterDocumentGraph<Field extends string>(
  documents: FlatDocs[],
  modelMapping: Partial<{ [key in Field]: string }> = {}
) {
  // We keep track of the IDs we are removing.
  const documentIdsToRemove: string[] = [];
  // The documents to keep and remove are set up.
  let documentsToRemove: CaptureModel['document'][] = [];
  let documentsToKeep: CaptureModel['document'][] = [];

  // Important note, model mapping MAY contain an entity ID outside of the root.
  // We will skip all of this if there are no documents. (see below for fallback)
  if (documents.length) {
    // Loop through the flat documents, we want to check each one and it's parent.
    for (const flatDoc of documents) {
      // We reset the documents to remove. @todo (Why?)
      documentsToRemove = [];
      // If the parent is already in the documents ids to remove, then we want to add this
      // document to be removed too.
      if (flatDoc.parent && documentIdsToRemove.indexOf(flatDoc.parent.id) !== -1) {
        // If we are on an item that has had its parent filtered out. Then add all of its
        // documents to the filtered list.
        documentIdsToRemove.push(...flatDoc.documents.map(d => d.id));
        documentsToRemove.push(...flatDoc.documents);

        // Other wise, we want to check if the user provided an ID to filter this document.
        // The flat document contains a property.
      } else if (flatDoc.property && modelMapping[flatDoc.property as Field]) {
        // We grab the ID from the user input.
        const filterId = modelMapping[flatDoc.property as Field];
        // And loop through the documents to find the matching one.
        for (const doc of flatDoc.documents) {
          if (doc.id === filterId) {
            // We add the matching document
            documentsToKeep = [doc];
          } else {
            // And remove the rest.
            documentIdsToRemove.push(doc.id);
            documentsToRemove.push(doc);
          }
        }
      }
    }
    // If there was no documents returned at all, then we fallback to all of the documents.
    // @todo maybe check the user input instead. If the user selected IDs that don't exist, then returning nothing
    //   might be correct in this case.
    if (documentsToKeep.length === 0) {
      // We set the documents to keep, looping through all of the documents.
      documentsToKeep = documents.reduce((acc, flatDoc) => {
        // Since we are looping through all of the documents, some may be children
        // of other documents. So if it has a parent we first check if the parent was in the
        // list of documents to keep. If it was, we remove it and replace it with the list of
        // it's own documents.
        if (flatDoc.parent) {
          const parentIdx = acc.indexOf(flatDoc.parent);
          if (parentIdx !== -1) {
            acc.splice(parentIdx, 1);
          }
        }
        // And we add of the documents for the flat doc.
        acc.push(...flatDoc.documents);
        return acc;
      }, [] as CaptureModel['document'][]);
    }
  }

  return [documentsToKeep, documentsToRemove];
}
