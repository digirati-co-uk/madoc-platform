import { Revisions } from '../editor/stores/revisions';
import { useMemo } from 'react';

export function useBreads(): {
  breads: Array<{ id: string; name: string; profile?: string; active?: boolean }>;
  revisionPopTo: (args: { id: string }) => void;
  revisionDeselectField: () => void;
  fieldSelected: boolean;
} {
  const { revision, path, field } = Revisions.useStoreState(s => ({
    revision: s.currentRevision,
    path: s.revisionSubtreePath,
    field: s.revisionSubtreeField,
  }));
  const { revisionPopTo, revisionDeselectField } = Revisions.useStoreActions(a => {
    return {
      revisionPopTo: a.revisionPopTo,
      revisionDeselectField: a.revisionDeselectField,
    };
  });

  return useMemo(() => {
    const breads: Array<{ id: string; name: string; profile?: string }> = [];
    if (revision) {
      let currentLevel = revision.document;
      let label = 'Home';
      for (const [prop, id, skip] of path || []) {
        label = currentLevel.pluralLabel ? currentLevel.pluralLabel : currentLevel.label;
        currentLevel = (currentLevel.properties[prop] as any[]).find(i => i.id === id);

        if (!skip) {
          // Add it.
          breads.push({
            id: currentLevel.id,
            name: label,
            profile: currentLevel.profile,
          });
        }
      }

      if (field) {
        breads.push({
          id: field.id,
          name: field.pluralLabel ? field.pluralLabel : field.label,
          profile: field.profile,
        });
      }

      if (currentLevel && breads.length) {
        breads.push({
          id: currentLevel.id,
          name: currentLevel.pluralLabel ? currentLevel.pluralLabel : currentLevel.label,
          active: true,
        } as any);
      }
    }

    return { breads, revisionPopTo, revisionDeselectField, fieldSelected: !!field } as any;
  }, [field, path, revision, revisionDeselectField, revisionPopTo]);
}
