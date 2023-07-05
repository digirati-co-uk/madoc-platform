import React from 'react';
import { BreadcrumbDivider, BreadcrumbItem, BreadcrumbList } from '../../../../site/blocks/Breadcrumbs';
import { useModelTranslation } from '../../hooks/use-model-translation';
import { EditorRenderingConfig } from './EditorSlots';
import { HomeIcon } from '../../../icons/HomeIcon';
import { useBreads } from '../../hooks/use-breads';

export const DefaultBreadcrumbs: EditorRenderingConfig['Breadcrumbs'] = () => {
  const { t: tModel } = useModelTranslation();
  const { breads, revisionPopTo, fieldSelected, revisionDeselectField } = useBreads();

  if (breads.length === 0) {
    return null;
  }

  function selectItem(id: string, n: number) {
    if (fieldSelected && n === breads.length - 1) {
      revisionDeselectField();
    } else {
      revisionPopTo({ id });
    }
  }

  return (
    <BreadcrumbList style={{ marginBottom: '1em' }}>
      {breads.map((s, n) => {
        const name = n === 0 ? <HomeIcon title={tModel(s.name)} /> : tModel(s.name);
        return (
          <React.Fragment key={n}>
            <BreadcrumbItem active={s.active} $icon={n === 0}>
              {!s.active ? <a onClick={() => selectItem(s.id, n)}>{name}</a> : name}
            </BreadcrumbItem>
            {n < breads.length - 1 ? <BreadcrumbDivider /> : null}
          </React.Fragment>
        );
      })}
    </BreadcrumbList>
  );
};
