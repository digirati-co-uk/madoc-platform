import { BaseField } from '../../types/field-types';
import { Revisions } from '../../editor/stores/revisions';
import { isEntityEmpty } from '../../utility/is-entity-empty';

export function useResolvedDependant(entityOrField: BaseField) {
  const currentRevision = Revisions.useStoreState(s => s.currentRevision);
  const revisionDocument = currentRevision?.document;

  if (entityOrField.dependant && revisionDocument) {
    const dependantField = revisionDocument.properties[entityOrField.dependant][0];
    if (dependantField) {
      if (dependantField.type === 'entity') {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const isEmpty = isEntityEmpty(dependantField);
        return !isEmpty;
      }
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      return !(!dependantField.value || dependantField.value === '') || !!dependantField.selector?.state;
    }
    return true;
  }
  return true;
}
