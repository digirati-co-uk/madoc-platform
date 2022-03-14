import React from 'react';
import {BreadcrumbDivider, BreadcrumbItem, BreadcrumbList} from '../components/Breadcrumbs';
import {HomeIcon} from '../icons/HomeIcon';
import {useBreads} from './hooks/use-breads';

export const RevisionBreadcrumbs: React.FC = () => {
  const { breads, revisionPopTo, fieldSelected, revisionDeselectField } = useBreads();

  if (breads.length === 0) {
    return null;
  }

  return (
    <BreadcrumbList style={{ marginBottom: '1em' }}>
      {breads.map((s, n) => {
        const name = n === 0 ? <HomeIcon /> : s.name;

        return (
          <React.Fragment key={n}>
            <BreadcrumbItem active={s.active} $icon={n === 0}>
              {!s.active ? (
                <a
                  onClick={() => {
                    if (fieldSelected && n === breads.length - 1) {
                      revisionDeselectField();
                    } else {
                      revisionPopTo({ id: s.id });
                    }
                  }}
                >
                  {name}
                </a>
              ) : (
                name
              )}
            </BreadcrumbItem>
            {n < breads.length - 1 ? <BreadcrumbDivider /> : null}
          </React.Fragment>
        );
      })}
    </BreadcrumbList>
  );
};
