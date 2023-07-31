import React from 'react';
import { useTranslation } from 'react-i18next';
import { ViewProjectUpdate } from '../../components/ViewProjectUpdate';
import { useProjectUpdatesList } from '../../../site/hooks/use-project-updates-list';

export function ListProjectUpdates() {
  const { t } = useTranslation();
  const { data } = useProjectUpdatesList();

  if (!data) {
    return null;
  }
  const withBackground = false as boolean;

  if (!data || data?.pagination?.totalResults < 1) {
    return (
      <div>
        <div>{t('No project updates')}</div>
      </div>
    );
  }

  return (
    <div className={`py-4 ${withBackground ? 'bg-slate-100' : ''}`}>
      <div className="max-w-4xl mx-auto">
        <h2 className="text-lg font-semibold text-gray-500">{t('Project updates')}</h2>
        {data.updates.map(update => (
          <ViewProjectUpdate key={update.id} {...(update || {})} />
        ))}
      </div>
    </div>
  );
}
