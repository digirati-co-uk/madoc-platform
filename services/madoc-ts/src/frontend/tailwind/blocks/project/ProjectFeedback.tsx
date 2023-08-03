import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation } from 'react-query';
import { blockEditorFor } from '../../../../extensions/page-blocks/block-editor-for';
import { StyledFormMultilineInputElement } from '../../../shared/capture-models/editor/atoms/StyledForm';
import { Spinner } from '../../../shared/icons/Spinner';
import { WhiteTickIcon } from '../../../shared/icons/TickIcon';
import { Button } from '../../../shared/navigation/Button';
import { useApi } from '../../../shared/hooks/use-api';
import { useUser } from '../../../shared/hooks/use-site';
import { useRouteContext } from '../../../shared/plugins/public-api';
import { useProject } from '../../../site/hooks/use-project';

export function ProjectFeedback() {
  const { t } = useTranslation();
  const user = useUser();
  const { projectId } = useRouteContext();
  const [feedback, setFeedback] = useState('');
  const isAdmin = user?.scope?.includes('site.admin');
  const { data: project } = useProject();
  const api = useApi();

  const [postFeedback, postFeedbackStatus] = useMutation(async () => {
    if (projectId) {
      await api.addProjectFeedback(projectId, feedback);
    }
  });

  if (!projectId || !user || !(project?.isProjectMember || isAdmin)) {
    return null;
  }

  return (
    <div className="my-5 bg-white max-w-4xl w-full mx-auto" id="feedback">
      <h3 className="text-xl font-semibold mb-4">{t('Project feedback')}</h3>
      {postFeedbackStatus.isLoading ? (
        <div className="bg-gray-100 border border-gray-200 text-gray-700 px-4 py-3 rounded relative" role="alert">
          <Spinner className="inline-block mr-2" />
          <span className="block sm:inline">{t('Submitting feedback')}</span>
        </div>
      ) : null}
      {postFeedbackStatus.isSuccess ? (
        <div
          className="bg-green-100 border border-green-200 text-green-700 px-4 py-3 rounded relative flex gap-3 items-center"
          role="alert"
        >
          <WhiteTickIcon />
          <span className="block sm:inline">{t('Thank you for your feedback')}</span>
        </div>
      ) : null}
      {postFeedbackStatus.isError ? (
        <div className="bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{t('Failed to submit feedback')}</span>
        </div>
      ) : null}
      {postFeedbackStatus.isIdle || postFeedbackStatus.isError ? (
        <form
          onSubmit={e => {
            e.preventDefault();
            return postFeedback();
          }}
        >
          <StyledFormMultilineInputElement
            minRows={5}
            placeholder={t('Enter feedback')}
            value={feedback}
            onChange={e => {
              setFeedback(e.target.value);
            }}
          />
          <div className="flex mt-3">
            <Button>{t('Submit feedback')}</Button>
          </div>
        </form>
      ) : null}
    </div>
  );
}

blockEditorFor(ProjectFeedback, {
  type: 'default.ProjectFeedback',
  label: 'Project feedback',
  anyContext: ['project'],
  requiredContext: ['project'],
  editor: {},
});
