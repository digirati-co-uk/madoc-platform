import { Revisions } from '@capture-models/editor';
import { isEntity } from '@capture-models/helpers';

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
    field,
    {
      property,
      parentEntity,
      path: subtreePath,
    },
  ] as const;
}
