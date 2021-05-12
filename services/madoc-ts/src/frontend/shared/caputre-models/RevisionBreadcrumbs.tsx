import { Revisions } from '@capture-models/editor';
import React, { useMemo } from 'react';
import { BreadcrumbDivider, BreadcrumbItem, BreadcrumbList } from '../components/Breadcrumbs';

export function useBreads(): {
  breads: Array<{ id: string; name: string; profile?: string }>;
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
      for (const [prop, id, skip] of path || []) {
        currentLevel = (currentLevel.properties[prop] as any[]).find(i => i.id === id);

        if (!skip) {
          // Add it.
          breads.push({
            id: currentLevel.id,
            name: currentLevel.pluralLabel ? currentLevel.pluralLabel : currentLevel.label,
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
    }

    return { breads, revisionPopTo, revisionDeselectField, fieldSelected: !!field } as any;
  }, [field, path, revision, revisionDeselectField, revisionPopTo]);
}

export const RevisionBreadcrumbs: React.FC = () => {
  const { breads, revisionPopTo, fieldSelected, revisionDeselectField } = useBreads();

  if (breads.length === 0) {
    return null;
  }

  return (
    <BreadcrumbList style={{ marginBottom: '1em' }}>
      {breads.map((s, n) => (
        <React.Fragment key={s.id}>
          <BreadcrumbItem>
            <a
              onClick={() => {
                if (fieldSelected && n === breads.length - 1) {
                  revisionDeselectField();
                } else {
                  revisionPopTo({ id: s.id });
                }
              }}
            >
              {s.name}
            </a>
          </BreadcrumbItem>
          {n < breads.length - 1 ? <BreadcrumbDivider /> : null}
        </React.Fragment>
      ))}
    </BreadcrumbList>
  );
};
