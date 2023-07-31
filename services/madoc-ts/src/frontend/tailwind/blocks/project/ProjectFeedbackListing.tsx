import React from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation } from 'react-query';
import { TimeAgo } from '../../../shared/atoms/TimeAgo';
import { useApi } from '../../../shared/hooks/use-api';
import { apiHooks } from '../../../shared/hooks/use-api-query';
import { useUser } from '../../../shared/hooks/use-site';
import { LockIcon } from '../../../shared/icons/LockIcon';
import { HrefLink } from '../../../shared/utility/href-link';
import { useRouteContext } from '../../../site/hooks/use-route-context';

export function ProjectFeedbackListing() {
  const user = useUser();
  const { t } = useTranslation();
  const isAdmin = user?.scope?.includes('site.admin');
  const { projectId } = useRouteContext();
  const { data, refetch } = apiHooks.getAllProjectFeedback(() => (isAdmin && projectId ? [projectId] : undefined));
  const api = useApi();
  const [deleteFeedback] = useMutation(async (id: number) => {
    if (projectId) {
      await api.deleteProjectFeedback(projectId, id);
    }
    await refetch();
  });

  if (!isAdmin || !data?.feedback.length) {
    return null;
  }

  return (
    <div className="my-5 max-w-4xl bg-yellow-50 p-5 border border-yellow-500 rounded w-full mx-auto">
      <div className="flex items-center mb-4 border-b border-y-gray-200 pb-4">
        <h3 className="text-xl font-semibold m-0">{t('Project feedback')}</h3>
        <div className="ml-auto flex items-center gap-3 text-yellow-700">
          <LockIcon />
          {t('Only visible to admins')}
        </div>
      </div>
      <div className="">
        {data?.feedback.map(feedback => (
          <div key={feedback.id} className="mb-2 rounded bg-white border p-4 drop-shadow-sm">
            <div className="flex">
              <div className="flex-1 whitespace-pre-wrap">{feedback.feedback}</div>
              {feedback.user ? (
                <div className="text-right text-sm">
                  <HrefLink className="text-sky-500 no-underline hover:underline" href={`/users/${feedback.user.id}`}>
                    {feedback.user.name}
                  </HrefLink>
                  <div className="text-xs text-gray-500 mt-1">
                    <TimeAgo date={feedback.created} />
                  </div>
                  <button
                    className="text-red-800 mt-2 text-xs hover:underline"
                    onClick={() => window.confirm(t('Are you sure?')) && deleteFeedback(feedback.id)}
                  >
                    {t('Delete feedback')}
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
