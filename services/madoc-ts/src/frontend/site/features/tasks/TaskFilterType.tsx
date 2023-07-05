import { stringify } from 'query-string';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { ItemFilter } from '../../../shared/components/ItemFilter';
import { useLocationQuery } from '../../../shared/hooks/use-location-query';

export const TaskFilterType: React.FC<{ types: Array<{ label: any; value: string }> }> = ({ types: allTypes }) => {
  const { t } = useTranslation();
  const { page, ...query } = useLocationQuery();
  const types = query.type ? query.type.split(',') : [''];
  const navigate = useNavigate();
  const location = useLocation();

  const realLabel = types.length === 1 ? allTypes.find(ty => ty.value && ty.value === types[0])?.label : '';

  return (
    <ItemFilter
      type="radio"
      label={realLabel || t('Filter by type')}
      closeOnChange
      items={allTypes.map(type => ({
        id: type.value,
        onChange: selected => {
          if (selected) {
            navigate(`${location.pathname}?${stringify({ ...query, type: type.value }, { arrayFormat: 'comma' })}`);
          }
        },
        label: type.label,
      }))}
      selected={types}
    />
  );
};
