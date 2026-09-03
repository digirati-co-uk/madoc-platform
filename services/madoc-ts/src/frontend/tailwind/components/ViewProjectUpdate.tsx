import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation } from 'react-query';
import { CreateProjectUpdate, ProjectUpdate } from '../../../types/projects';
import { TimeAgo } from '../../shared/atoms/TimeAgo';
import { ErrorMessage } from '../../shared/callouts/ErrorMessage';
import { useApi } from '../../shared/hooks/use-api';
import { useUser } from '../../shared/hooks/use-site';
import { HrefLink } from '../../shared/utility/href-link';
import { useProjectUpdatesCache } from '../../site/hooks/use-project-updates-cache';
import { useRouteContext } from '../../site/hooks/use-route-context';
import { ProjectUpdateForm } from './ProjectUpdateForm';
import { ProjectUpdateMarkdown } from './ProjectUpdateMarkdown';

export function ViewProjectUpdate(props: ProjectUpdate) {
  const { t } = useTranslation();
  const api = useApi();
  const user = useUser();
  const { projectId } = useRouteContext();
  const updatesCache = useProjectUpdatesCache();
  const [isEditing, setIsEditing] = useState(false);
  const canManage = Boolean(projectId && user?.scope.includes('site.admin'));

  const [saveUpdate, saveUpdateStatus] = useMutation(async (update: CreateProjectUpdate) => {
    if (!projectId) {
      return;
    }
    const saved = await api.updateProjectUpdate(projectId, props.id, update);
    updatesCache.updated(saved);
    setIsEditing(false);
  });

  const [deleteUpdate, deleteUpdateStatus] = useMutation(async () => {
    if (!projectId) {
      return;
    }
    await api.deleteProjectUpdate(projectId, props.id);
    updatesCache.deleted(props.id);
  });

  return (
    <div className="container my-4 border border-gray-300 overflow-hidden bg-white">
      <div className="m-6">
        {isEditing ? (
          <ProjectUpdateForm
            initialTitle={props.title}
            initialUpdate={props.update}
            isLoading={saveUpdateStatus.isLoading}
            error={saveUpdateStatus.isError ? saveUpdateStatus.error : undefined}
            submitLabel={t('Save')}
            onSubmit={saveUpdate}
            onCancel={() => setIsEditing(false)}
          />
        ) : (
          <>
            {props.title ? <h3 className="text-xl font-semibold mb-3">{props.title}</h3> : null}
            <ProjectUpdateMarkdown markdown={props.update} />
          </>
        )}
        {deleteUpdateStatus.isError ? (
          <ErrorMessage $margin>
            {deleteUpdateStatus.error instanceof Error ? deleteUpdateStatus.error.message : t('Failed')}
          </ErrorMessage>
        ) : null}
      </div>
      <div className="flex items-end p-4 bg-slate-50 border-t-2 ">
        {props.user ? (
          <div className="text-sm">
            {t('Posted by')} <HrefLink href={`/users/${props.user.id}`}>{props.user.name}</HrefLink>
          </div>
        ) : null}
        <div className="ml-auto flex items-center gap-3 text-gray-500 text-sm">
          <TimeAgo date={props.created} />
          {canManage && !isEditing ? (
            <>
              <button type="button" className="text-sky-700 hover:underline" onClick={() => setIsEditing(true)}>
                {t('Edit')}
              </button>
              <button
                type="button"
                className="text-red-800 hover:underline"
                disabled={deleteUpdateStatus.isLoading}
                onClick={() => window.confirm(t('Are you sure?')) && deleteUpdate()}
              >
                {t('Delete')}
              </button>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
