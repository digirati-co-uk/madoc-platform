import React from 'react';
import '../../shared/caputre-models/refinements';
import { ViewCrowdsourcingTask } from './tasks/crowdsourcing-task.lazy';
import { BrowserComponent } from '../../shared/utility/browser-component';
import { useApi } from '../../shared/hooks/use-api';
import { ViewCrowdsourcingReview } from './tasks/crowdsourcing-review';
import { TaskContext } from './loaders/task-loader';

export const ViewTask: React.FC<TaskContext<any>> = ({ task, ...props }) => {
  const api = useApi();

  const slug = api.getSiteSlug();

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
        <a href={`/s/${slug}/madoc/admin/tasks/${task.id}`}>View on admin dashboard</a>
      </div>
    );
  }

  if (task.type === 'crowdsourcing-task') {
    return (
      <BrowserComponent fallback={<div>loading...</div>}>
        <ViewCrowdsourcingTask task={task} {...props} />
      </BrowserComponent>
    );
  }

  // @todo check user role.
  if (task.type === 'crowdsourcing-review') {
    return <ViewCrowdsourcingReview task={task} {...props} />;
  }

  return <h1>{task.name}</h1>;
};
