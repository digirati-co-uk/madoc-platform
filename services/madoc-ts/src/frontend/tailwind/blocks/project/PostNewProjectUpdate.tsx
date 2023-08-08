import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation } from 'react-query';
import RichMarkdownEditor from 'rich-markdown-editor';
import invariant from 'tiny-invariant';
import { blockEditorFor } from '../../../../extensions/page-blocks/block-editor-for';
import { ErrorMessage } from '../../../shared/callouts/ErrorMessage';
import { SuccessMessage } from '../../../shared/callouts/SuccessMessage';
import { useApi } from '../../../shared/hooks/use-api';
import { useUser } from '../../../shared/hooks/use-site';
import { LockIcon } from '../../../shared/icons/LockIcon';
import { Button, ButtonRow } from '../../../shared/navigation/Button';
import { useRouteContext } from '../../../site/hooks/use-route-context';

export function PostNewProjectUpdate() {
  const user = useUser();
  const { projectId } = useRouteContext();
  const api = useApi();
  const { t } = useTranslation();
  const [markdown, setMarkdown] = useState('');

  const [postUpdate, postUpdateStatus] = useMutation(async () => {
    invariant(projectId, 'Project id must be set');
    invariant(markdown.trim(), 'Update must not be empty');
    return api.createProjectUpdate(projectId, markdown);
  });

  if (!user || user.site_role !== 'admin') {
    return null;
  }

  if (postUpdateStatus.isSuccess) {
    return (
      <div className="max-w-4xl mx-auto my-8">
        <SuccessMessage $banner>{t('Project update posted')}</SuccessMessage>
      </div>
    );
  }

  return (
    <div className="max-w-4xl self-center w-full">
      <div className="container py-8 px-8 bg-gray-100 rounded my-8">
        <h3 className="text-xl font-semibold mt-0 pb-4 text-gray-600 flex gap-3 items-center">
          {t('Post new project update')}
        </h3>

        {postUpdateStatus.isError ? (
          <ErrorMessage $banner $margin>
            {(postUpdateStatus.error as any)?.message}
          </ErrorMessage>
        ) : null}

        <div className="px-8 bg-white border border-gray-300 rounded py-4">
          <RichMarkdownEditor
            disableExtensions={['image']}
            defaultValue={''}
            onChange={value => {
              setMarkdown(value());
            }}
          />
        </div>

        <ButtonRow $noMargin className="mt-8">
          <Button $primary onClick={() => postUpdate()} disabled={markdown.length <= 2 || postUpdateStatus.isLoading}>
            Post update
          </Button>
        </ButtonRow>
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
