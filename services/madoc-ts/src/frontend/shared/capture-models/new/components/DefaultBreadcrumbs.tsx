import React from 'react';
import { BreadcrumbDivider, BreadcrumbItem, BreadcrumbList } from '../../../components/Breadcrumbs';
import { useBreads } from '../../RevisionBreadcrumbs';
import { EditorRenderingConfig } from './EditorSlots';

export const DefaultBreadcrumbs: EditorRenderingConfig['Breadcrumbs'] = () => {
  const { breads, revisionPopTo, fieldSelected, revisionDeselectField } = useBreads();

  if (breads.length === 0) {
    return null;
  }

  if (breads.length === 1) {
    const s = breads[0];
    return (
      <BreadcrumbList style={{ marginBottom: '1em' }}>
        <BreadcrumbItem>
          <a
            onClick={() => {
              if (fieldSelected) {
                revisionDeselectField();
              } else {
                revisionPopTo({ id: s.id });
              }
            }}
          >
            Back
          </a>
        </BreadcrumbItem>
      </BreadcrumbList>
    );
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
