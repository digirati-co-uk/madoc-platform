import React from 'react';
import { useTranslation } from 'react-i18next';
import { blockEditorFor } from '../../../../extensions/page-blocks/block-editor-for';
import { useProject } from '../../../site/hooks/use-project';
import { ViewProjectUpdate } from '../../components/ViewProjectUpdate';

export function MostRecentProjectUpdate({
  withBackground,
  featured,
}: {
  featured?: boolean;
  withBackground?: boolean;
}) {
  const { t } = useTranslation();
  const { data } = useProject();

  if (!data) {
    return null;
  }

  const latestUpdate = data.latestUpdate;

  if (!latestUpdate) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-lg text-slate-500">{t('No project updates')}</div>
      </div>
    );
  }

  const featuredStyle = featured ? 'border-t-2 border-blue-500 bg-blue-100' : '';

  return (
    <div className={`py-4 ${withBackground ? 'bg-slate-100' : featuredStyle}`}>
      <div className="max-w-4xl mx-auto">
        <h2 className="text-lg font-semibold  text-gray-500">{t('Latest project update')}</h2>
        <ViewProjectUpdate {...(latestUpdate || {})} />
      </div>
    </div>
  );
}

blockEditorFor(MostRecentProjectUpdate, {
  type: 'default.MostRecentProjectUpdate',
  label: 'Most recent project update',
  anyContext: ['project'],
  requiredContext: ['project'],
  defaultProps: {
    featured: false,
    withBackground: false,
  },
  editor: {
    featured: {
      type: 'checkbox-field',
      label: 'Featured',
      inlineLabel: 'Show featured styling',
    },
    withBackground: {
      type: 'checkbox-field',
      label: 'Background',
      inlineLabel: 'Dark background',
    },
  },
});
