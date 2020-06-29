import React, { useEffect, useLayoutEffect } from 'react';
import { BaseTask } from '../../../gateway/tasks/base-task';
import { CrowdsourcingTask } from '../../../types/tasks/crowdsourcing-task';
import '../../shared/caputre-models/refinements';
import { ViewCrowdsourcingTask } from './tasks/crowdsourcing-task.lazy';
import { BrowserComponent } from '../../shared/utility/browser-component';
import { useApi } from '../../shared/hooks/use-api';
import { CrowdsourcingReview } from '../../../gateway/tasks/crowdsourcing-review';
import { ViewCrowdsourcingReview } from './tasks/crowdsourcing-review';

export const ViewTask: React.FC<{ task: BaseTask }> = ({ task }) => {
  const api = useApi();

  const slug = api.getSiteSlug();

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
        <ViewCrowdsourcingTask task={task as CrowdsourcingTask} />
      </BrowserComponent>
    );
  }

  // @todo check user role.
  if (task.type === 'crowdsourcing-review') {
    return <ViewCrowdsourcingReview task={task as CrowdsourcingReview} />;
  }

  return <h1>{task.name}</h1>;
};
