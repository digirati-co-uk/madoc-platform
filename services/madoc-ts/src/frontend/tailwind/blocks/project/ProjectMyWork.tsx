import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { blockEditorFor } from '../../../../extensions/page-blocks/block-editor-for';
import { SubjectSnippet as SubjectSnippetType } from '../../../../extensions/tasks/resolvers/subject-resolver';
import { BaseTask } from '../../../../gateway/tasks/base-task';
import { SimpleStatus } from '../../../shared/atoms/SimpleStatus';
import { TimeAgo } from '../../../shared/atoms/TimeAgo';
import { InlineSelect } from '../../../shared/components/InlineSelect';
import { LocaleString } from '../../../shared/components/LocaleString';
import { paginatedApiHooks } from '../../../shared/hooks/use-api-query';
import { useUser } from '../../../shared/hooks/use-site';
import { ArrowForwardIcon } from '../../../shared/icons/ArrowForwardIcon';
import { Spinner } from '../../../shared/icons/Spinner';
import { HrefLink } from '../../../shared/utility/href-link';
import { useProject } from '../../../site/hooks/use-project';
import { useRelativeLinks } from '../../../site/hooks/use-relative-links';
import { useTaskMetadata } from '../../../site/hooks/use-task-metadata';

export function ProjectMyWork() {
  const user = useUser();
  const { data: project } = useProject();
  const createLink = useRelativeLinks();
  const [filter, setFilter] = useState('0,1');
  const { t } = useTranslation();
  const { data: tasks, latestData, isFetching } = paginatedApiHooks.getTasks(() =>
    user && project
      ? [
          0,
          {
            type: 'crowdsourcing-task',
            root_task_id: project.task_id,
            assignee: `urn:madoc:user:${user.id}`,
            status: filter.split(',').map(Number) as number[],
            sort_by: 'updated',
            detail: true,
            per_page: 8,
          },
        ]
      : undefined
  );

  const taskList = (latestData?.tasks || tasks?.tasks || []).filter((t: any) => {
    return filter.includes(`${t.status}`);
  });

  if (!tasks || !user) {
    return null;
  }

  return (
    <div className="my-5 bg-white">
      <div className="flex">
        <h3 className="text-xl font-semibold mb-4">{t('My Contributions')}</h3>
        <div className="ml-auto flex items-center">
          <InlineSelect
            value={filter}
            onChange={e => setFilter(e)}
            options={[
              { value: '0,1,2,3', label: 'All' },
              { value: '0,1', label: 'In progress' },
              { value: '2', label: 'Submitted' },
              { value: '3', label: 'Approved' },
            ]}
          />
        </div>
      </div>
      <div className="relative overflow-x-auto" style={{ opacity: isFetching ? 0.8 : 1 }}>
        {taskList.length === 0 ? (
          <div className="bg-white p-8 text-center text-sm text-slate-500 border rounded-lg">
            {isFetching ? <Spinner /> : t('No submissions')}
          </div>
        ) : (
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-sm text-gray-700 bg-slate-100">
              <tr>
                <th scope="col" className="px-6 py-3">
                  {t('Resource')}
                </th>
                <th scope="col" className="px-6 py-3">
                  {t('Modified')}
                </th>
                <th scope="col" className="px-6 py-3">
                  {t('Manifest')}
                </th>
                <th scope="col" className="px-6 py-3">
                  {t('Status')}
                </th>
              </tr>
            </thead>
            <tbody>
              {taskList.map(task => (
                <TaskRow key={task.id} task={task} />
              ))}
            </tbody>
          </table>
        )}
      </div>
      <div className="p-4 my-2">
        <HrefLink
          href={createLink({
            subRoute: 'tasks',
            query: { type: 'crowdsourcing-task', assignee: `urn:madoc:user:${user.id}`, status: [0, 1, 2].join(',') },
          })}
          className="flex items-center gap-2"
        >
          {t('View all tasks')}
          <ArrowForwardIcon />
        </HrefLink>
      </div>
    </div>
  );
}

function TaskRow({ task }: { task: BaseTask }) {
  const { t } = useTranslation();
  const createLink = useRelativeLinks();
  const { subject } = useTaskMetadata<{ subject?: SubjectSnippetType }>(task);
  if (!subject) return null;

  const query =
    task.status === 3
      ? undefined
      : {
          revision: task.state?.revisionId,
        };

  return (
    <tr className="bg-white border-b">
      <th scope="row" className="px-6 py-4 font-medium text-gray-900">
        {subject?.parent ? (
          <HrefLink
            href={createLink({
              manifestId: subject?.parent?.id,
              canvasId: subject?.id,
              subRoute: task.status === 3 ? undefined : 'model',
              query,
            })}
          >
            <LocaleString>{subject?.parent?.label}</LocaleString>
            {' - '}
            <LocaleString>{subject?.label}</LocaleString>
          </HrefLink>
        ) : (
          <HrefLink href={createLink({ manifestId: subject?.id })}>
            <LocaleString>{subject?.label}</LocaleString>
          </HrefLink>
        )}
      </th>
      <td className="px-2 py-4 whitespace-nowrap">
        {task.modified_at ? <TimeAgo date={new Date(task.modified_at)} /> : null}
      </td>
      <td className="px-2 py-4 whitespace-nowrap">
        <HrefLink href={createLink({ manifestId: subject?.parent?.id || subject?.id })}>{t('View manifest')}</HrefLink>
      </td>
      <td className="px-2 whitespace-nowrap">
        <SimpleStatus status={task.status || 0} status_text={task.status_text || ''} />
      </td>
    </tr>
  );
}

blockEditorFor(ProjectMyWork, {
  type: 'default.ProjectMyWork',
  label: 'Project my work',
  anyContext: ['project'],
  requiredContext: ['project'],
  editor: {},
});
