import { CaptureModel } from '../types/capture-model';
import { isEntityList } from './is-entity';

export type FlatDocs = { parent?: CaptureModel['document']; property?: string; documents: CaptureModel['document'][] };

/**
 * Split document by Model Root
 *
 * This will take a nested tree document and split it by list of properties. e.g. [entity1, entity2]
 * It will traverse through document.properties.entity1[].properties.entity2[] and splits everything up to
 * the given path into one set of flat documents, and then the rest in a second set of flat documents.
 *
 * @param inputDoc
 * @param modelRoot
 */
export function splitDocumentByModelRoot(inputDoc: CaptureModel['document'], modelRoot: string[] = []) {
  // This is all of the documents following the path of the modelRoot properties.
  const topHalfOfDocument: FlatDocs[] = [];
  // This is the leafs of the chopped up document.
  let bottomHalfOfDocument: FlatDocs[] = [{ documents: [inputDoc] }];
  // Current level of flat documents that we're looping through.
  let documentCursors: FlatDocs[] = [];
  // Loop the properties (entity1, entity2 etc.)
  for (const modelRootLevel of modelRoot) {
    // Set the cursor to the bottom half of the document, we split one "level" at a time. This is a
    // full slice of the nested tree, an array of all of the nodes.
    documentCursors = bottomHalfOfDocument;
    // Reset the bottom half of the document after setting it to the cursor. Once we skim the next set of nodes,
    // we will re-set this.
    bottomHalfOfDocument = [];
    // Loop through our bottom half
    for (const cursor of documentCursors) {
      // Grab all of the properties on this document.
      for (const instanceDocuments of cursor.documents) {
        // Get the list of fields or entities.
        const entityList = instanceDocuments.properties[modelRootLevel];
        // If this is not an entity list (i.e. a list of fields) the path to select was
        // invalid in the model.
        if (!isEntityList(entityList)) {
          throw new Error('Invalid modelRoot provided');
        }
        // Now we set the bottom half of the document to this entity list. (for each of the instances)
        bottomHalfOfDocument.push({ parent: instanceDocuments, property: modelRootLevel, documents: entityList });
      }
    }
    // At this point we have all of the properties from the next level down in `bottomHalfOfDocument` and we can
    // push the document to the top half. Each time we skim a layer off, we add the document to the top half of the
    // document. This gives us ALL of the documents in the top half, and only the top-level in the bottom half.
    topHalfOfDocument.push(...documentCursors);
  }

  // We return the split document in 2 halves.
  return [topHalfOfDocument, bottomHalfOfDocument] as const;
}
