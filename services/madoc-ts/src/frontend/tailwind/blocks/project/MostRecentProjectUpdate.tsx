import React from 'react';
import { useTranslation } from 'react-i18next';
import { useProject } from '../../../site/hooks/use-project';
import { ViewProjectUpdate } from '../../components/ViewProjectUpdate';

export function MostRecentProjectUpdate() {
  const { t } = useTranslation();
  const { data } = useProject();

  if (!data) {
    return null;
  }

  const latestUpdate = data.latestUpdate;
  const withBackground = false as boolean;

  if (!latestUpdate) {
    return (
      <div>
        <div>{t('No project updates')}</div>
      </div>
    );
  }

  const featured = 'border-t-2 border-blue-500 bg-blue-100';

  return (
    <div className={`py-4 ${withBackground ? 'bg-slate-100' : ''}`}>
      <div className="max-w-4xl mx-auto">
        <h2 className="text-lg font-semibold  text-gray-500">{t('Latest project update')}</h2>
        <ViewProjectUpdate {...(latestUpdate || {})} />
      </div>
    </div>
  );
}
