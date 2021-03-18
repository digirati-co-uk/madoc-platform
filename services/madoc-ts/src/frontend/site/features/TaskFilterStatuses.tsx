import { stringify } from 'query-string';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import { ItemFilter } from '../../shared/components/ItemFilter';
import { useLocationQuery } from '../../shared/hooks/use-location-query';

export const TaskFilterStatuses: React.FC<{ statuses: Array<{ label: any; value: number }> }> = ({
  statuses: allStatuses,
}) => {
  const { t } = useTranslation();
  const { page, ...query } = useLocationQuery();
  const statuses = query.status ? query.status.split(',').map(Number) : [];
  const { location, push } = useHistory();

  return (
    <ItemFilter
      label={t('Filter by status')}
      closeOnChange
      items={allStatuses.map(status => ({
        id: status.value,
        onChange: selected => {
          if (selected) {
            push(
              `${location.pathname}?${stringify(
                { ...query, status: [...statuses, status.value] },
                { arrayFormat: 'comma' }
              )}`
            );
          } else {
            push(
              `${location.pathname}?${stringify(
                { ...query, status: statuses.filter((e: any) => e !== status.value) },
                { arrayFormat: 'comma' }
              )}`
            );
          }
        },
        label: status.label,
      }))}
      selected={statuses}
    />
  );
};
