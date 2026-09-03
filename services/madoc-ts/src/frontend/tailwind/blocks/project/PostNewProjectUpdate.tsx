import React from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation } from 'react-query';
import invariant from 'tiny-invariant';
import { blockEditorFor } from '../../../../extensions/page-blocks/block-editor-for';
import { CreateProjectUpdate } from '../../../../types/projects';
import { SuccessMessage } from '../../../shared/callouts/SuccessMessage';
import { useApi } from '../../../shared/hooks/use-api';
import { useUser } from '../../../shared/hooks/use-site';
import { useProjectUpdatesCache } from '../../../site/hooks/use-project-updates-cache';
import { useRouteContext } from '../../../site/hooks/use-route-context';
import { ProjectUpdateForm } from '../../components/ProjectUpdateForm';

export function PostNewProjectUpdate() {
  const user = useUser();
  const { projectId } = useRouteContext();
  const api = useApi();
  const updatesCache = useProjectUpdatesCache();
  const { t } = useTranslation();

  const [postUpdate, postUpdateStatus] = useMutation(async (update: CreateProjectUpdate) => {
    invariant(projectId, 'Project id must be set');
    const created = await api.createProjectUpdate(projectId, update);
    updatesCache.created({
      ...created,
      user: created.user ? { ...created.user, name: created.user.name || user?.name } : undefined,
    });
    return created;
  });

  if (!user?.scope.includes('site.admin')) {
    return null;
  }

  return (
    <div className="max-w-4xl self-center w-full">
      <div className="container py-8 px-8 bg-gray-100 rounded my-8">
        <h3 className="text-xl font-semibold mt-0 pb-4 text-gray-600 flex gap-3 items-center">
          {t('Post new project update')}
        </h3>

        {postUpdateStatus.isSuccess ? (
          <SuccessMessage $banner $margin>
            {t('Project update posted')}
          </SuccessMessage>
        ) : null}

        <ProjectUpdateForm
          key={postUpdateStatus.data?.id || 'new'}
          isLoading={postUpdateStatus.isLoading}
          error={postUpdateStatus.isError ? postUpdateStatus.error : undefined}
          submitLabel={t('Post new project update')}
          onSubmit={postUpdate}
        />
      </div>
    </div>
  );
}

blockEditorFor(PostNewProjectUpdate, {
  type: 'default.PostNewProjectUpdate',
  label: 'Post new project update',
  anyContext: ['project'],
  requiredContext: ['project'],
  editor: {},
});
