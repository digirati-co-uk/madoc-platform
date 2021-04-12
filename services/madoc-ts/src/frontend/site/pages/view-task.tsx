import React from 'react';
import '../../shared/caputre-models/refinements';
import { useTranslation } from 'react-i18next';
import { SubjectSnippet } from '../../../extensions/tasks/resolvers/subject-resolver';
import { useCreateLocaleString } from '../../shared/components/LocaleString';
import { createLink } from '../../shared/utility/create-link';
import { HrefLink } from '../../shared/utility/href-link';
import { useTaskMetadata } from '../hooks/use-task-metadata';
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
        <h3>{task.name}</h3>
        <p>{task.description}</p>
        <a href={`/s/${slug}/madoc/admin/tasks/${task.id}`}>{t('View on admin dashboard')}</a>
      </div>
    );
  }

  if (task.type === 'crowdsourcing-task') {
    return (
      <BrowserComponent fallback={<div>{t('loading')}</div>}>
        <ViewCrowdsourcingTask task={task} {...props} />
      </BrowserComponent>
    );
  }

  // @todo check user role.
  if (task.type === 'crowdsourcing-review') {
    return <ViewCrowdsourcingReview task={task} {...props} />;
  }

  if (subject) {
    return (
      <>
        <h1>{task.name}</h1>
        {subject.thumbnail ? (
          <img src={subject.thumbnail} alt={createLocaleString(subject.label, 'Thumbnail')} />
        ) : null}
        {subject.type === 'manifest' ? (
          <HrefLink href={createLink({ manifestId: subject.id })}>{t('View manifest')}</HrefLink>
        ) : null}
      </>
    );
  }

  return <h1>{task.name}</h1>;
};
