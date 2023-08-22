// import { BaseField } from '../types/field-types';
// import { RevisionRequest } from '../types/revision-request';
// export function isDocumentDependantsSatisfied(revisionDocument?: RevisionRequest['document']) {
//   const properties =
//     revisionDocument && revisionDocument.type === 'entity' ? Object.keys(revisionDocument.properties) : [];
//
//   if (revisionDocument) {
//     for (const property of properties) {
//       const fieldOrEntity = revisionDocument.properties[property];
//       if (fieldOrEntity && fieldOrEntity.length) {
//         for (const singleFieldOrEntity of fieldOrEntity) {
//           if (singleFieldOrEntity.dependant) {
//             // find dependant field byID
//             // check if filled
//             // show field
//           }
//         }
//       }
//     }
//   }
// }
