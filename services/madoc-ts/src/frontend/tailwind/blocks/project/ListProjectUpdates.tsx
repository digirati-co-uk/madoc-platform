import React from 'react';
import { useTranslation } from 'react-i18next';
import { blockEditorFor } from '../../../../extensions/page-blocks/block-editor-for';
import { ViewProjectUpdate } from '../../components/ViewProjectUpdate';
import { useProjectUpdatesList } from '../../../site/hooks/use-project-updates-list';
import { Pagination } from '../../../shared/components/Pagination';

export function ListProjectUpdates({ withBackground }: { withBackground?: boolean }) {
  const { t } = useTranslation();
  const { data } = useProjectUpdatesList();

  if (!data) {
    return null;
  }

  if (!data || data?.pagination?.totalResults < 1) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-lg text-slate-500">{t('No project updates')}</div>
      </div>
    );
  }

  return (
    <div className={`py-4 ${withBackground ? 'bg-slate-100' : ''}`}>
      <div className="max-w-4xl mx-auto">
        <h2 className="text-lg font-semibold text-gray-500">{t('Project updates')}</h2>
        {data.updates?.map(update => (
          <ViewProjectUpdate
            key={update.id}
            update={update.update}
            id={update.id}
            created={update.created}
            user={update.user}
            snapshot={update.snapshot}
          />
        ))}
        <Pagination
          page={data ? data.pagination.page : undefined}
          totalPages={data ? data.pagination.totalPages : undefined}
          stale={!data}
        />
      </div>
    </div>
  );
}

blockEditorFor(ListProjectUpdates, {
  type: 'default.ListProjectUpdates',
  label: 'List project updates',
  anyContext: ['project'],
  requiredContext: ['project'],
  defaultProps: {
    withBackground: false,
  },
  editor: {
    withBackground: {
      type: 'checkbox-field',
      label: 'Background',
      inlineLabel: 'Dark background',
    },
  },
});
