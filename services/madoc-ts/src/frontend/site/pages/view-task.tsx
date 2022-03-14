import React from 'react';
import '../../shared/capture-models/refinements';
import { useTranslation } from 'react-i18next';
import { SubjectSnippet } from '../../../extensions/tasks/resolvers/subject-resolver';
import { useProjectByTask } from '../../shared/hooks/use-project-by-task';
import { EmptyState } from '../../shared/layout/EmptyState';
import { useCreateLocaleString } from '../../shared/components/LocaleString';
import { TaskWrapper } from '../../shared/components/TaskWrapper';
import { createLink } from '../../shared/utility/create-link';
import { HrefLink } from '../../shared/utility/href-link';
import { useTaskMetadata } from '../hooks/use-task-metadata';
import { ViewApiActionTask } from './tasks/api-action-task';
import { ViewCrowdsourcingTask } from './tasks/crowdsourcing-task.lazy';
import { BrowserComponent } from '../../shared/utility/browser-component';
import { useApi } from '../../shared/hooks/use-api';
import { ViewCrowdsourcingReview } from './tasks/crowdsourcing-review';
import { TaskContext } from './loaders/task-loader';

export const ViewTask: React.FC<TaskContext<any>> = ({ task, ...props }) => {
  const { t } = useTranslation();
  const api = useApi();
  const createLocaleString = useCreateLocaleString();
  const slug = api.getSiteSlug();
  const { subject } = useTaskMetadata<{ subject?: SubjectSnippet }>(task);

  if (!task) {
    return null;
  }

  if (
    task.type === 'madoc-manifest-import' ||
    task.type === 'madoc-collection-import' ||
    task.type === 'madoc-canvas-import'
  ) {
    return (
      <div>
        <TaskWrapper task={task} refetch={props.refetch as any} subject={subject}>
          <a href={`/s/${slug}/admin/tasks/${task.id}`}>{t('View on admin dashboard')}</a>
        </TaskWrapper>
      </div>
    );
  }

  if (task.type === 'crowdsourcing-task') {
    return (
      <>
        <TaskWrapper task={task} refetch={props.refetch as any} subject={subject}>
          <BrowserComponent fallback={<div>{t('loading')}</div>}>
            <ViewCrowdsourcingTask task={task} {...props} />
          </BrowserComponent>
        </TaskWrapper>
      </>
    );
  }

  // @todo check user role.
  if (task.type === 'crowdsourcing-review') {
    return (
      <>
        <TaskWrapper task={task} refetch={props.refetch as any} subject={subject}>
          <ViewCrowdsourcingReview task={task} {...props} />
        </TaskWrapper>
      </>
    );
  }

  if (task.type === 'madoc-api-action-task') {
    return (
      <>
        <TaskWrapper task={task} refetch={props.refetch as any}>
          <ViewApiActionTask task={task} {...props} />
        </TaskWrapper>
      </>
    );
  }

  if (subject) {
    return (
      <>
        <TaskWrapper task={task} refetch={props.refetch as any} subject={subject}>
          {subject.thumbnail ? (
            <img src={subject.thumbnail} alt={createLocaleString(subject.label, 'Thumbnail')} />
          ) : null}
          {subject.type === 'manifest' ? (
            <HrefLink href={createLink({ manifestId: subject.id })}>{t('View manifest')}</HrefLink>
          ) : null}
        </TaskWrapper>
      </>
    );
  }

  return (
    <TaskWrapper task={task} refetch={props.refetch as any} subject={subject}>
      <EmptyState>No details on this task</EmptyState>
    </TaskWrapper>
  );
};
