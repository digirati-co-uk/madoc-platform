import React from 'react';
import { useTranslation } from 'react-i18next';
import { useProjectAssigneeStats } from '../../../site/hooks/use-project-assignee-stats';

export function ProjectContributorStatistics() {
  const { t } = useTranslation();
  const { data } = useProjectAssigneeStats();

  if (!data) {
    return null;
  }

  return (
    <div className={`py-4`}>
      <div className="max-w-4xl mx-auto">
        <h2 className="text-lg font-semibold  text-gray-500">{t('Contributor statistics')}</h2>
      </div>
    </div>
  );
}
