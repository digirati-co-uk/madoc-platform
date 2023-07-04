import React from 'react';
import { useTranslation } from 'react-i18next';
import { ItemFilter } from '../../shared/components/ItemFilter';
import { useLocationQuery } from '../../shared/hooks/use-location-query';
import { useGoToQuery } from '../hooks/use-go-to-query';

export const TaskFilterStatuses: React.FC<{ statuses: Array<{ label: any; value: number }> }> = ({
  statuses: allStatuses,
}) => {
  const { t } = useTranslation();
  const { page, ...query } = useLocationQuery();
  const statuses = query.status ? query.status.split(',').map(Number) : [];
  const goToQuery = useGoToQuery();

  const realLabel = statuses.length === 1 ? allStatuses.find(ty => ty.value && ty.value === statuses[0])?.label : '';

  return (
    <ItemFilter
      label={realLabel || t('Filter by status')}
      closeOnChange
      items={allStatuses.map(status => ({
        id: status.value,
        onChange: selected => {
          if (selected) {
            goToQuery({
              status: [...statuses, status.value],
            });
          } else {
            goToQuery({
              status: statuses.filter((e: any) => e !== status.value),
            });
          }
        },
        label: status.label,
      }))}
      selected={statuses}
    />
  );
};
