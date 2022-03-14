import { Revisions } from '../../editor/stores/revisions/index';
import { isEntity } from '../../helpers/is-entity';
import { BaseField } from '../../types/field-types';

export function useCurrentField() {
  const { field, property, parentEntity, subtreePath } = Revisions.useStoreState(s => {
    return {
      parentEntity: s.revisionSubtree,
      subtreePath: s.revisionSubtreePath,
      field: s.revisionSubtreeField,
      property: s.revisionSelectedFieldProperty,
    };
  });

  // Next / Previous

  if (field && isEntity(field)) {
    throw new Error('Component called from context of a entity (Revisions.revisionSubtree)');
  }

  return [
    field as BaseField,
    {
      property,
      parentEntity,
      path: subtreePath,
    },
  ] as const;
}
